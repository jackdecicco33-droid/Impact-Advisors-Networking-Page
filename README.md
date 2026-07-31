# Connect Hub

Connect Hub is a static internal employee directory. The employee cards, search,
filters, statistics, service-line rosters, and organizational charts all use the
single generated dataset at `assets/data/roster-data.js`.

## Update the roster

Run the importer from the project directory:

```powershell
.\scripts\import-roster.ps1 `
  -WorkbookPath "C:\path\to\Strategy & Operations Service Lines.xlsx" `
  -CompareWorkbookPath ".\assets\Strategy & Operations Service Lines.xlsx" `
  -AllowCrossServiceAssignments
```

The importer reads the `S&O Service Lines` worksheet and imports only:

- Name
- Title
- Service Line
- Location
- Email
- LinkedIn

It validates the required columns, names, duplicate identities, email formatting,
and LinkedIn URLs. Cross-service assignments with the same email are consolidated
into one employee profile while retaining every listed service-line membership.
Conflicting duplicate records still fail the import.

The command stores a copy of the authoritative workbook, regenerates
`assets/data/roster-data.js`, and writes the validation and reconciliation summary
to `assets/data/reconciliation.json`.

Run the generated-data validation:

```powershell
.\scripts\validate-site.ps1
```

## Run and verify locally

No build step or package installation is required. Open `index.html` directly in
a browser. A headless render check can be run with Microsoft Edge:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless=new --disable-gpu --dump-dom `
  "file:///C:/path/to/Internal%20Networking%20Page/index.html"
```
