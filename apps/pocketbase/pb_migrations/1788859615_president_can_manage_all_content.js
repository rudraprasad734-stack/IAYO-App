/// <reference path="../pb_data/types.d.ts" />

// Align updateRule/deleteRule with createRule for all staff-authored content
// collections. Previously update/delete were scoped to the record's author or
// admin only. Seeded content was reassigned to the admin account during the
// president-unseed migration, so a newly-set-up president could SEE published
// records in the dashboard (listRule passes on status='published') but could
// not edit them — the updateRule found no matching row and PocketBase returned
// 404 "sql: no rows in result set". Presidents are the authorised content
// managers for IAYO, so they may update/delete any research, investigation,
// finding, or RTI case, matching the existing createRule.
migrate(
  (app) => {
    const collections = ["research", "investigations", "findings", "rti_cases"];
    for (const name of collections) {
      const col = app.findCollectionByNameOrId(name);
      col.updateRule =
        "@request.auth.role = 'president' || @request.auth.id = author || @request.auth.role = 'admin'";
      col.deleteRule =
        "@request.auth.role = 'president' || @request.auth.id = author || @request.auth.role = 'admin'";
      app.save(col);
    }
  },
  (app) => {
    const collections = ["research", "investigations", "findings", "rti_cases"];
    for (const name of collections) {
      const col = app.findCollectionByNameOrId(name);
      col.updateRule = "@request.auth.id = author || @request.auth.role = 'admin'";
      col.deleteRule = "@request.auth.id = author || @request.auth.role = 'admin'";
      app.save(col);
    }
  },
);
