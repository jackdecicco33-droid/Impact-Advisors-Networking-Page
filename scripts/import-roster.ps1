param(
  [Parameter(Mandatory = $true)]
  [string]$WorkbookPath,

  [string]$WorksheetName = "S&O Service Lines",

  [string]$OutputPath = (Join-Path $PSScriptRoot "..\assets\data\roster-data.js"),

  [string]$StoredWorkbookPath = (Join-Path $PSScriptRoot "..\assets\Strategy & Operations Service Lines.xlsx"),

  [string]$CompareWorkbookPath = "",

  [switch]$AllowCrossServiceAssignments
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem

$requiredColumns = @(
  "Name",
  "Service Line",
  "Title",
  "Location",
  "LinkedIn",
  "Email"
)

function Get-NormalizedKey {
  param([AllowEmptyString()][string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return ""
  }

  return ([regex]::Replace($Value.Trim(), "\s+", " ")).ToLowerInvariant()
}

function Get-ZipXml {
  param(
    [System.IO.Compression.ZipArchive]$Archive,
    [string]$EntryPath
  )

  $entry = $Archive.GetEntry($EntryPath)
  if (-not $entry) {
    throw "Workbook is missing required Open XML part '$EntryPath'."
  }

  $reader = [System.IO.StreamReader]::new($entry.Open())
  try {
    return [xml]$reader.ReadToEnd()
  }
  finally {
    $reader.Dispose()
  }
}

function Get-RelationshipMap {
  param([xml]$RelationshipsXml)

  $map = @{}
  foreach ($relationship in $RelationshipsXml.SelectNodes("//*[local-name()='Relationship']")) {
    $map[$relationship.Id] = $relationship.Target
  }
  return $map
}

function Get-CellText {
  param(
    [System.Xml.XmlElement]$Cell,
    [object[]]$SharedStrings
  )

  if ($Cell.t -eq "inlineStr") {
    return (($Cell.SelectNodes(".//*[local-name()='t']") | ForEach-Object { $_.'#text' }) -join "")
  }

  $valueNode = $Cell.SelectSingleNode("./*[local-name()='v']")
  if (-not $valueNode) {
    return ""
  }

  if ($Cell.t -eq "s") {
    return [string]$SharedStrings[[int]$valueNode.InnerText]
  }

  return [string]$valueNode.InnerText
}

function Import-WorksheetRows {
  param(
    [string]$Path,
    [string]$SheetName,
    [switch]$Validate,
    [switch]$AllowCrossService
  )

  $resolvedPath = (Resolve-Path -LiteralPath $Path).Path
  $archive = [System.IO.Compression.ZipFile]::OpenRead($resolvedPath)

  try {
    $workbookXml = Get-ZipXml -Archive $archive -EntryPath "xl/workbook.xml"
    $workbookRelationships = Get-RelationshipMap (
      Get-ZipXml -Archive $archive -EntryPath "xl/_rels/workbook.xml.rels"
    )

    $sheet = $workbookXml.SelectNodes("//*[local-name()='sheet']") |
      Where-Object { $_.name -eq $SheetName } |
      Select-Object -First 1

    if (-not $sheet) {
      $availableSheets = @(
        $workbookXml.SelectNodes("//*[local-name()='sheet']") |
          ForEach-Object { $_.name }
      ) -join ", "
      throw "Worksheet '$SheetName' was not found. Available worksheets: $availableSheets"
    }

    $relationshipId = (
      $sheet.Attributes |
        Where-Object { $_.LocalName -eq "id" } |
        Select-Object -First 1
    ).Value

    $sheetTarget = [string]$workbookRelationships[$relationshipId]
    if ([string]::IsNullOrWhiteSpace($sheetTarget)) {
      throw "Could not resolve worksheet '$SheetName' in the workbook relationships."
    }

    $sheetPath = if ($sheetTarget.StartsWith("/")) {
      $sheetTarget.TrimStart("/")
    }
    elseif ($sheetTarget.StartsWith("xl/")) {
      $sheetTarget
    }
    else {
      "xl/$sheetTarget"
    }

    $sharedStrings = @()
    if ($archive.GetEntry("xl/sharedStrings.xml")) {
      $sharedStringsXml = Get-ZipXml -Archive $archive -EntryPath "xl/sharedStrings.xml"
      $sharedStrings = @(
        $sharedStringsXml.SelectNodes("//*[local-name()='si']") |
          ForEach-Object {
            ($_.SelectNodes(".//*[local-name()='t']") | ForEach-Object { $_.'#text' }) -join ""
          }
      )
    }

    $sheetXml = Get-ZipXml -Archive $archive -EntryPath $sheetPath
    $sheetFileName = [System.IO.Path]::GetFileName($sheetPath)
    $sheetDirectory = [System.IO.Path]::GetDirectoryName($sheetPath).Replace("\", "/")
    $sheetRelationshipsPath = "$sheetDirectory/_rels/$sheetFileName.rels"
    $sheetRelationships = @{}

    if ($archive.GetEntry($sheetRelationshipsPath)) {
      $sheetRelationships = Get-RelationshipMap (
        Get-ZipXml -Archive $archive -EntryPath $sheetRelationshipsPath
      )
    }

    $hyperlinks = @{}
    foreach ($hyperlink in $sheetXml.SelectNodes("//*[local-name()='hyperlink']")) {
      $hyperlinkRelationshipId = (
        $hyperlink.Attributes |
          Where-Object { $_.LocalName -eq "id" } |
          Select-Object -First 1
      ).Value

      if ($hyperlinkRelationshipId -and $sheetRelationships.ContainsKey($hyperlinkRelationshipId)) {
        $hyperlinks[$hyperlink.ref] = [string]$sheetRelationships[$hyperlinkRelationshipId]
      }
    }

    $rows = @($sheetXml.SelectNodes("//*[local-name()='sheetData']/*[local-name()='row']"))
    if ($rows.Count -eq 0) {
      throw "Worksheet '$SheetName' contains no rows."
    }

    $headerByColumn = @{}
    foreach ($cell in $rows[0].SelectNodes("./*[local-name()='c']")) {
      $column = [regex]::Match($cell.r, "^[A-Z]+").Value
      $header = (Get-CellText -Cell $cell -SharedStrings $sharedStrings).Trim()
      if ($header) {
        $headerByColumn[$column] = $header
      }
    }

    $missingColumns = @(
      $requiredColumns |
        Where-Object { $_ -notin $headerByColumn.Values }
    )
    if ($missingColumns.Count -gt 0) {
      throw "Worksheet '$SheetName' is missing required column(s): $($missingColumns -join ', ')."
    }

    $records = [System.Collections.Generic.List[object]]::new()
    $rowErrors = [System.Collections.Generic.List[string]]::new()

    foreach ($row in $rows | Select-Object -Skip 1) {
      $values = @{}
      foreach ($columnName in $requiredColumns) {
        $values[$columnName] = ""
      }

      foreach ($cell in $row.SelectNodes("./*[local-name()='c']")) {
        $column = [regex]::Match($cell.r, "^[A-Z]+").Value
        if (-not $headerByColumn.ContainsKey($column)) {
          continue
        }

        $header = $headerByColumn[$column]
        if ($header -notin $requiredColumns) {
          continue
        }

        $cellValue = (Get-CellText -Cell $cell -SharedStrings $sharedStrings).Trim()
        if ($header -eq "LinkedIn" -and $hyperlinks.ContainsKey($cell.r)) {
          $cellValue = $hyperlinks[$cell.r].Trim()
        }
        if ($header -eq "Email" -and $cellValue.StartsWith("mailto:", [StringComparison]::OrdinalIgnoreCase)) {
          $cellValue = $cellValue.Substring(7)
        }
        $values[$header] = $cellValue
      }

      $hasAnyValue = @($requiredColumns | Where-Object { -not [string]::IsNullOrWhiteSpace($values[$_]) }).Count -gt 0
      if (-not $hasAnyValue) {
        continue
      }

      if ([string]::IsNullOrWhiteSpace($values["Name"])) {
        $rowErrors.Add("Row $($row.r) has data but no Name.")
        continue
      }

      $records.Add([ordered]@{
        name = $values["Name"]
        serviceLine = $values["Service Line"]
        title = $values["Title"]
        location = $values["Location"]
        linkedin = $values["LinkedIn"]
        email = $values["Email"]
      })
    }

    if ($Validate) {
      if ($rowErrors.Count -gt 0) {
        throw ($rowErrors -join [Environment]::NewLine)
      }

      $formatErrors = [System.Collections.Generic.List[string]]::new()
      foreach ($record in $records) {
        if (
          -not [string]::IsNullOrWhiteSpace($record.email) -and
          $record.email -notmatch "^[^@\s]+@[^@\s]+\.[^@\s]+$"
        ) {
          $formatErrors.Add("Employee '$($record.name)' has an invalid email: '$($record.email)'.")
        }

        if (-not [string]::IsNullOrWhiteSpace($record.linkedin)) {
          $linkedinUri = $null
          $isValidLinkedIn = (
            [Uri]::TryCreate($record.linkedin, [UriKind]::Absolute, [ref]$linkedinUri) -and
            $linkedinUri.Scheme -in @("http", "https")
          )
          if (-not $isValidLinkedIn) {
            $formatErrors.Add("Employee '$($record.name)' has an invalid LinkedIn URL: '$($record.linkedin)'.")
          }
        }
      }
      if ($formatErrors.Count -gt 0) {
        throw ($formatErrors -join [Environment]::NewLine)
      }

      $duplicateEmailGroups = @(
        $records |
          Where-Object { -not [string]::IsNullOrWhiteSpace($_.email) } |
          Group-Object { Get-NormalizedKey $_.email } |
          Where-Object { $_.Count -gt 1 }
      )
      if ($duplicateEmailGroups.Count -gt 0) {
        if (-not $AllowCrossService) {
          $duplicateEmails = $duplicateEmailGroups | ForEach-Object { $_.Name }
          throw "Duplicate employee email(s) found: $($duplicateEmails -join ', '). Re-run with -AllowCrossServiceAssignments only when these are intentional assignments to different service lines."
        }

        foreach ($group in $duplicateEmailGroups) {
          $serviceLines = @($group.Group | ForEach-Object { Get-NormalizedKey $_.serviceLine })
          if (($serviceLines | Sort-Object -Unique).Count -ne $serviceLines.Count) {
            throw "Duplicate email '$($group.Name)' appears more than once in the same service line."
          }

          $identitySignatures = @(
            $group.Group |
              ForEach-Object {
                @(
                  (Get-NormalizedKey $_.name),
                  (Get-NormalizedKey $_.title),
                  (Get-NormalizedKey $_.location),
                  (Get-NormalizedKey $_.linkedin),
                  (Get-NormalizedKey $_.email)
                ) -join "|"
              } |
              Sort-Object -Unique
          )
          if ($identitySignatures.Count -ne 1) {
            throw "Duplicate email '$($group.Name)' has conflicting employee data across service lines."
          }
        }
      }

      $recordsForEmployeeDuplicateCheck = if ($AllowCrossService) {
        @($records | Where-Object { [string]::IsNullOrWhiteSpace($_.email) })
      }
      else {
        @($records)
      }
      $duplicateEmployeeGroups = @(
        $recordsForEmployeeDuplicateCheck |
          Group-Object {
            if (-not [string]::IsNullOrWhiteSpace($_.email)) {
              "email:$((Get-NormalizedKey $_.email))"
            }
            else {
              "name-service:$((Get-NormalizedKey $_.name))|$((Get-NormalizedKey $_.serviceLine))"
            }
          } |
          Where-Object { $_.Count -gt 1 }
      )
      if ($duplicateEmployeeGroups.Count -gt 0) {
        $duplicates = $duplicateEmployeeGroups | ForEach-Object { $_.Name }
        throw "Employees appear more than once after normalization: $($duplicates -join ', ')."
      }

      $duplicateNameServiceGroups = @(
        $records |
          Group-Object {
            "$((Get-NormalizedKey $_.name))|$((Get-NormalizedKey $_.serviceLine))"
          } |
          Where-Object { $_.Count -gt 1 }
      )
      if ($duplicateNameServiceGroups.Count -gt 0) {
        $duplicates = $duplicateNameServiceGroups | ForEach-Object { $_.Name }
        throw "Employees have duplicate normalized Name + Service Line values: $($duplicates -join ', ')."
      }
    }

    if ($AllowCrossService) {
      $consolidated = [System.Collections.Generic.List[object]]::new()
      $groups = $records | Group-Object {
        if (-not [string]::IsNullOrWhiteSpace($_.email)) {
          "email:$((Get-NormalizedKey $_.email))"
        }
        else {
          "name-service:$((Get-NormalizedKey $_.name))|$((Get-NormalizedKey $_.serviceLine))"
        }
      }

      foreach ($group in $groups) {
        $first = $group.Group[0]
        $consolidated.Add([ordered]@{
          name = $first.name
          serviceLines = @($group.Group | ForEach-Object { $_.serviceLine } | Sort-Object -Unique)
          title = $first.title
          location = $first.location
          linkedin = $first.linkedin
          email = $first.email
        })
      }
      return @($consolidated)
    }

    return @($records)
  }
  finally {
    $archive.Dispose()
  }
}

function Get-RecordKey {
  param($Record)

  if (-not [string]::IsNullOrWhiteSpace($Record.email)) {
    return "email:$((Get-NormalizedKey $Record.email))"
  }
  $serviceLineKey = if ($Record.serviceLines) {
    @($Record.serviceLines | ForEach-Object { Get-NormalizedKey $_ } | Sort-Object) -join "|"
  }
  else {
    Get-NormalizedKey $Record.serviceLine
  }
  return "name-service:$((Get-NormalizedKey $Record.name))|$serviceLineKey"
}

function Get-Reconciliation {
  param(
    [object[]]$PreviousRecords,
    [object[]]$CurrentRecords
  )

  $previousByKey = @{}
  foreach ($record in $PreviousRecords) {
    $previousByKey[(Get-RecordKey $record)] = $record
  }

  $currentByKey = @{}
  foreach ($record in $CurrentRecords) {
    $currentByKey[(Get-RecordKey $record)] = $record
  }

  $added = @(
    $currentByKey.Keys |
      Where-Object { -not $previousByKey.ContainsKey($_) } |
      ForEach-Object { $currentByKey[$_].name } |
      Sort-Object
  )
  $removed = @(
    $previousByKey.Keys |
      Where-Object { -not $currentByKey.ContainsKey($_) } |
      ForEach-Object { $previousByKey[$_].name } |
      Sort-Object
  )

  $updated = [System.Collections.Generic.List[string]]::new()
  foreach ($key in $currentByKey.Keys | Where-Object { $previousByKey.ContainsKey($_) }) {
    $previousJson = $previousByKey[$key] | ConvertTo-Json -Compress
    $currentJson = $currentByKey[$key] | ConvertTo-Json -Compress
    if ($previousJson -ne $currentJson) {
      $updated.Add($currentByKey[$key].name)
    }
  }

  $sameNameChanges = @(
    $added |
      Where-Object {
        $addedName = Get-NormalizedKey $_
        @($removed | Where-Object { (Get-NormalizedKey $_) -eq $addedName }).Count -gt 0
      }
  )
  if ($sameNameChanges.Count -gt 0) {
    $sameNameKeys = @($sameNameChanges | ForEach-Object { Get-NormalizedKey $_ })
    $added = @($added | Where-Object { (Get-NormalizedKey $_) -notin $sameNameKeys })
    $removed = @($removed | Where-Object { (Get-NormalizedKey $_) -notin $sameNameKeys })
    foreach ($name in $sameNameChanges) {
      if ($name -notin $updated) {
        $updated.Add($name)
      }
    }
  }

  return [ordered]@{
    added = @($added)
    updated = @($updated | Sort-Object)
    removed = @($removed)
  }
}

$rawCurrentRecords = Import-WorksheetRows -Path $WorkbookPath -SheetName $WorksheetName
$currentRecords = Import-WorksheetRows -Path $WorkbookPath -SheetName $WorksheetName -Validate -AllowCrossService:$AllowCrossServiceAssignments
$previousRecords = if (-not [string]::IsNullOrWhiteSpace($CompareWorkbookPath)) {
  Import-WorksheetRows -Path $CompareWorkbookPath -SheetName $WorksheetName -AllowCrossService
}
else {
  @()
}
$json = $currentRecords | ConvertTo-Json -Depth 4
$roundTripRecords = $json | ConvertFrom-Json
$roundTripCount = $roundTripRecords.Count

if ($roundTripCount -ne $currentRecords.Count) {
  throw "Generated website count ($roundTripCount) does not match valid deduplicated Excel employee count ($($currentRecords.Count))."
}

$outputDirectory = Split-Path -Parent $OutputPath
$storedWorkbookDirectory = Split-Path -Parent $StoredWorkbookPath
New-Item -ItemType Directory -Force -Path $outputDirectory, $storedWorkbookDirectory | Out-Null

$generatedSource = @"
// Generated by scripts/import-roster.ps1. Do not edit employee records manually.
window.CONNECT_HUB_EMPLOYEES = $json;
"@
[System.IO.File]::WriteAllText(
  [System.IO.Path]::GetFullPath($OutputPath),
  $generatedSource,
  [System.Text.UTF8Encoding]::new($false)
)

$resolvedInputPath = (Resolve-Path -LiteralPath $WorkbookPath).Path
$resolvedStoredPath = [System.IO.Path]::GetFullPath($StoredWorkbookPath)
if ($resolvedInputPath -ne $resolvedStoredPath) {
  Copy-Item -LiteralPath $resolvedInputPath -Destination $resolvedStoredPath -Force
}

$serviceLineCounts = [ordered]@{}
$serviceLineAssignments = foreach ($record in $currentRecords) {
  foreach ($serviceLine in @($record.serviceLines)) {
    [pscustomobject]@{ serviceLine = $serviceLine }
  }
}
foreach ($group in $serviceLineAssignments | Group-Object serviceLine | Sort-Object Name) {
  $serviceLineCounts[$group.Name] = $group.Count
}

$reconciliation = [ordered]@{
  sourceWorkbook = [System.IO.Path]::GetFileName($resolvedInputPath)
  worksheet = $WorksheetName
  workbookRosterRows = $rawCurrentRecords.Count
  validExcelRows = $currentRecords.Count
  uniqueEmployees = $currentRecords.Count
  generatedWebsiteRecords = $roundTripCount
  duplicateOrInvalidRows = $rawCurrentRecords.Count - $currentRecords.Count
  countByServiceLine = $serviceLineCounts
  added = @()
  updated = @()
  removed = @()
}

if (-not [string]::IsNullOrWhiteSpace($CompareWorkbookPath)) {
  $changes = Get-Reconciliation -PreviousRecords $previousRecords -CurrentRecords $currentRecords
  $reconciliation.added = $changes.added
  $reconciliation.updated = $changes.updated
  $reconciliation.removed = $changes.removed
}

$reportPath = Join-Path $outputDirectory "reconciliation.json"
[System.IO.File]::WriteAllText(
  [System.IO.Path]::GetFullPath($reportPath),
  ($reconciliation | ConvertTo-Json -Depth 6),
  [System.Text.UTF8Encoding]::new($false)
)

Write-Output "Imported $($currentRecords.Count) valid employees from '$WorksheetName'."
Write-Output "Generated website records: $roundTripCount."
Write-Output "Service-line counts:"
$serviceLineCounts.GetEnumerator() | ForEach-Object {
  Write-Output "  $($_.Key): $($_.Value)"
}
Write-Output "Roster data: $([System.IO.Path]::GetFullPath($OutputPath))"
Write-Output "Stored workbook: $resolvedStoredPath"
Write-Output "Reconciliation report: $([System.IO.Path]::GetFullPath($reportPath))"
