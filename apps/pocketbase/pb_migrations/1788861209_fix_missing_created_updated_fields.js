/// <reference path="../pb_data/types.d.ts" />

/*
 * Bug fix: research_applications and contributions were created without
 * `created`/`updated` autodate fields (every other collection in this
 * schema has them). Both apps/web/src/lib/data.js#fetchResearchApplications
 * and #fetchContributions request `sort: '-created'`, and the President
 * Dashboard (PresidentDashboard.jsx) calls them on every load. Sorting by a
 * field that does not exist on the collection makes PocketBase reject the
 * whole list request with a 400, which the dashboard's per-tab
 * `.catch(() => [])` silently swallows — so the "Research Applications" and
 * "Public Contributions" tabs always rendered empty, even though real
 * pending submissions existed in the database. The President could never
 * see or review them.
 *
 * Adding the two standard autodate fields (matching every other collection)
 * fixes the sort and is non-destructive: PocketBase backfills `created`/
 * `updated` for existing rows from their internal row metadata.
 */
migrate(
  (app) => {
    for (const name of ["research_applications", "contributions"]) {
      const collection = app.findCollectionByNameOrId(name);
      if (!collection.fields.getByName("created")) {
        collection.fields.add(new AutodateField({
          name: "created",
          onCreate: true,
          onUpdate: false,
        }));
      }
      if (!collection.fields.getByName("updated")) {
        collection.fields.add(new AutodateField({
          name: "updated",
          onCreate: true,
          onUpdate: true,
        }));
      }
      app.save(collection);
    }
  },
  (app) => {
    for (const name of ["research_applications", "contributions"]) {
      const collection = app.findCollectionByNameOrId(name);
      const created = collection.fields.getByName("created");
      if (created) collection.fields.removeByName("created");
      const updated = collection.fields.getByName("updated");
      if (updated) collection.fields.removeByName("updated");
      app.save(collection);
    }
  },
);
