/// <reference path="../pb_data/types.d.ts" />

// One-time cleanup: remove any president records currently in the database
// (left over from pre-deployment testing) so the one-time President setup flow
// is available to the real user. This migration runs once and is then recorded
// as applied, so it will NOT affect any president the user sets up afterwards.
// Authored content is reassigned to the admin first to respect cascadeDelete.
migrate(
  (app) => {
    let admin = null;
    try {
      admin = app.findAuthRecordByEmail("users", "admin@iayo.in");
    } catch (_) {}

    let presidents = [];
    try {
      presidents = app.findRecordsByFilter("users", "role = 'president'", "", 1000, 0);
    } catch (_) {}

    for (const president of presidents) {
      const pid = president.id;
      if (admin) {
        for (const col of ["research", "investigations", "findings", "rti_cases"]) {
          let records = [];
          try {
            records = app.findRecordsByFilter(col, `author = "${pid}"`, "", 1000, 0);
          } catch (_) {}
          for (const r of records) {
            r.set("author", admin.id);
            app.save(r);
          }
        }
      }
      app.delete(president);
    }
  },
  (app) => {},
);
