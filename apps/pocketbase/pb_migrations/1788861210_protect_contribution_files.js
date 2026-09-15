/// <reference path="../pb_data/types.d.ts" />

/*
 * Security fix: contributions.files was never marked as a PocketBase
 * "protected" file field. PocketBase only enforces a collection's viewRule
 * on /api/files/... requests when the file field is explicitly protected —
 * an unprotected field's files are served from a plain, unauthenticated
 * URL regardless of the collection's own access rules. Live testing
 * confirmed a contribution's uploaded file could be downloaded by a fully
 * anonymous request with no token at all, even though
 * pb_hooks/president-access.pb.js explicitly documents (and the President
 * Dashboard promises contributors) that "Files remain private because the
 * contributions collection is readable only by the President." That
 * guarantee did not actually hold.
 *
 * Marking the field protected requires a short-lived file token
 * (pb.files.getToken()) to fetch a file; apps/web/src/lib/data.js and
 * PresidentDashboard.jsx are updated alongside this migration to request
 * one when rendering contribution file links, which only the President can
 * do since the collection's viewRule still gates who may obtain that token
 * for these records.
 */
migrate(
  (app) => {
    const contributions = app.findCollectionByNameOrId("contributions");
    const files = contributions.fields.getByName("files");
    if (files) {
      files.protected = true;
      app.save(contributions);
    }
  },
  (app) => {
    const contributions = app.findCollectionByNameOrId("contributions");
    const files = contributions.fields.getByName("files");
    if (files) {
      files.protected = false;
      app.save(contributions);
    }
  },
);
