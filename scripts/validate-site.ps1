param(
  [string]$RosterPath = (Join-Path $PSScriptRoot "..\assets\data\roster-data.js"),
  [string]$ReconciliationPath = (Join-Path $PSScriptRoot "..\assets\data\reconciliation.json")
)

$ErrorActionPreference = "Stop"

$source = Get-Content -Raw -LiteralPath $RosterPath
$prefix = "window.CONNECT_HUB_EMPLOYEES = "
$assignmentIndex = $source.IndexOf($prefix, [StringComparison]::Ordinal)
if ($assignmentIndex -lt 0 -or -not $source.TrimEnd().EndsWith(";")) {
  throw "Roster data does not use the expected generated JavaScript format."
}

$json = $source.Substring($assignmentIndex + $prefix.Length).Trim()
$json = $json.Substring(0, $json.Length - 1)
$employees = $json | ConvertFrom-Json
$report = Get-Content -Raw -LiteralPath $ReconciliationPath | ConvertFrom-Json
$allowedFields = @("name", "serviceLines", "title", "location", "linkedin", "email")

if ($employees.Count -ne $report.generatedWebsiteRecords) {
  throw "Roster contains $($employees.Count) employees but reconciliation expects $($report.generatedWebsiteRecords)."
}

$keys = [System.Collections.Generic.HashSet[string]]::new(
  [StringComparer]::OrdinalIgnoreCase
)

foreach ($employee in $employees) {
  $properties = @($employee.PSObject.Properties.Name)
  $unsupported = @($properties | Where-Object { $_ -notin $allowedFields })
  $missing = @($allowedFields | Where-Object { $_ -notin $properties })

  if ($unsupported.Count -gt 0) {
    throw "Employee '$($employee.name)' has unsupported field(s): $($unsupported -join ', ')."
  }
  if ($missing.Count -gt 0) {
    throw "Employee '$($employee.name)' is missing generated field(s): $($missing -join ', ')."
  }
  if ([string]::IsNullOrWhiteSpace($employee.name)) {
    throw "Generated roster contains an employee with no name."
  }

  if (-not [string]::IsNullOrWhiteSpace($employee.email)) {
    if ($employee.email -notmatch "^[^@\s]+@[^@\s]+\.[^@\s]+$") {
      throw "Employee '$($employee.name)' has an invalid email."
    }
    $key = "email:$($employee.email.Trim().ToLowerInvariant())"
  }
  else {
    $normalizedName = [regex]::Replace($employee.name.Trim(), "\s+", " ").ToLowerInvariant()
    $normalizedServices = @(
      $employee.serviceLines |
        ForEach-Object { $_.Trim().ToLowerInvariant() } |
        Sort-Object
    ) -join "|"
    $key = "name-service:$normalizedName|$normalizedServices"
  }

  if (-not $keys.Add($key)) {
    throw "Generated roster contains duplicate normalized employee '$key'."
  }

  if (-not [string]::IsNullOrWhiteSpace($employee.linkedin)) {
    $uri = $null
    if (
      -not [Uri]::TryCreate($employee.linkedin, [UriKind]::Absolute, [ref]$uri) -or
      $uri.Scheme -notin @("http", "https")
    ) {
      throw "Employee '$($employee.name)' has an invalid LinkedIn URL."
    }
  }
}

$sourceFiles = @(
  (Join-Path $PSScriptRoot "..\index.html"),
  (Join-Path $PSScriptRoot "..\directory.js"),
  (Join-Path $PSScriptRoot "..\org-chart.js"),
  $RosterPath
)
$forbiddenPattern = "pastProjects|Past Projects|profile-notes|profile-note|workbookPeople"
foreach ($path in $sourceFiles) {
  if (Select-String -LiteralPath $path -Pattern $forbiddenPattern -Quiet) {
    throw "Unsupported profile fields or obsolete roster references remain in '$path'."
  }
}

Write-Output "Validated $($employees.Count) unique generated employees."
Write-Output "Approved fields only: $($allowedFields -join ', ')."
Write-Output "No duplicate employee keys, invalid links, or unsupported profile fields found."
