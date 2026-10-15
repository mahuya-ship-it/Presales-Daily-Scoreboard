# Presales Daily Scorecard

Live dashboard for Alcove Realty's New Kolkata presales team. It reads Salesforce live, through the viewer's own Salesforce connection, and runs as a claude.ai Dashboard artifact.

## What it shows

Pick a period with **From** / **To**, or press **Today** or **All time**. All time means 1 Oct 2025 to today.

| Screen | Covers |
|---|---|
| Day overview | Headline figures, insights, calls and connected customers |
| Task 1: 5-minute fresh-lead call | Fresh enquiries per owner, office-hours misses, overnight leads |
| Task 2: Reconnect with Customer | Customers who asked again, called back vs missed, owner-wise |
| Task 3: Priority target vs achievement | The morning P1–P4 list for the **To** date |
| Task 4: Attendance & weekly roster | Present / absent per day, week of the To date, period totals |
| Team & birthdays | Team directory, upcoming birthdays and work anniversaries |

**Export** downloads the selected period as an Excel workbook.

## Files

- `index.html`: the whole page. It contains:
  - the Salesforce queries (`buildParams`);
  - the data loaders, including paging for long periods;
  - the calculations (`dash.calc`);
  - the drawing code and the Excel exporter.
- `store/`: the dashboard's stored settings.
  - `store/params.json` holds the default filter values and queries.
  - `store/datasets/*.json` holds one Salesforce query per data source.
- `tools/generate-store.js`: rebuilds `store/` from `index.html`, so the queries live in one place.
- `tools/mock-test.js`: runs the query builder, loaders and calculations on made-up data.
- `tools/syntax-check.js`: checks that every script block in the page parses.

Run the tools from the repo root with Node (`node tools/mock-test.js`). On a PC without Node, VS Code's runtime works:

```
ELECTRON_RUN_AS_NODE=1 "<VS Code folder>/Code.exe" tools/mock-test.js
```

## Not in this repo

The team list (names, roles, joining dates, birthdays) is kept out because it is personal data. The dashboard reads it from its own private storage.
