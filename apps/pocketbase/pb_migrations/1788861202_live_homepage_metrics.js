/// <reference path="../pb_data/types.d.ts" />

// Live homepage metrics support.
// Each published finding may optionally contain a verified monetary amount.
// The public homepage sums this field; it does not use a hard-coded corruption
// figure. Existing findings are left at zero until a President enters an amount.

migrate(
  (app) => {
    const findings = app.findCollectionByNameOrId("findings");
    if (!findings.fields.getByName("corruption_amount")) {
      findings.fields.add(new NumberField({
        name: "corruption_amount",
        min: 0,
      }));
      app.save(findings);
    }

    // Ensure homepage statistic records remain publicly readable for the
    // non-sensitive manual metrics that are still maintained by the President.
    const siteStats = app.findCollectionByNameOrId("site_stats");
    siteStats.listRule = "";
    siteStats.viewRule = "";
    siteStats.updateRule = "@request.auth.role = 'president'";
    siteStats.deleteRule = "@request.auth.role = 'president'";
    app.save(siteStats);
  },
  (app) => {
    // Keep the field on rollback if data has been entered; deleting it would
    // silently destroy historical financial inputs.
  },
);
