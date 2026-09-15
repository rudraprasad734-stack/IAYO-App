/// <reference path="../pb_data/types.d.ts" />

// Secure server-side audit log. Fires on API create/update/delete requests to
// the managed collections and writes an audit_log record identifying the
// authenticated actor. Programmatic saves (migrations, hooks) do not trigger
// the *Request hooks, so seeding and internal operations stay quiet. Public
// anonymous writes (member join, comment submit) have no auth and are skipped.

onRecordCreateRequest((e) => {
  e.next();
  const tracked = ["research", "investigations", "findings", "rti_cases", "comments", "members", "notifications", "site_stats", "users", "contributions"];
  if (tracked.indexOf(e.collection.name) === -1) return;
  const auth = e.requestInfo && e.requestInfo.auth ? e.requestInfo.auth : null;
  if (!auth) return;
  try {
    const col = $app.findCollectionByNameOrId("audit_log");
    const rec = new Record(col);
    const t = e.record.get("title") || e.record.get("full_name") || e.record.get("name") || e.record.get("label") || e.record.get("rti_id") || "";
    rec.set("action", "create");
    rec.set("collection_name", e.collection.name);
    rec.set("record_id", e.record.id || "");
    rec.set("record_title", String(t).slice(0, 300));
    rec.set("actor", auth.id);
    rec.set("actor_name", auth.getString("name") || auth.getString("email") || "");
    rec.set("actor_role", auth.getString("role") || "");
    rec.set("summary", "Created " + e.collection.name + (t ? " — " + String(t).slice(0, 140) : ""));
    $app.save(rec);
  } catch (err) {
    $app.logger().error("audit create failed", "err", String(err));
  }
});

onRecordUpdateRequest((e) => {
  e.next();
  const tracked = ["research", "investigations", "findings", "rti_cases", "comments", "members", "notifications", "site_stats", "users", "contributions"];
  if (tracked.indexOf(e.collection.name) === -1) return;
  const auth = e.requestInfo && e.requestInfo.auth ? e.requestInfo.auth : null;
  if (!auth) return;
  try {
    const col = $app.findCollectionByNameOrId("audit_log");
    const rec = new Record(col);
    const t = e.record.get("title") || e.record.get("full_name") || e.record.get("name") || e.record.get("label") || e.record.get("rti_id") || "";
    rec.set("action", "update");
    rec.set("collection_name", e.collection.name);
    rec.set("record_id", e.record.id || "");
    rec.set("record_title", String(t).slice(0, 300));
    rec.set("actor", auth.id);
    rec.set("actor_name", auth.getString("name") || auth.getString("email") || "");
    rec.set("actor_role", auth.getString("role") || "");
    rec.set("summary", "Updated " + e.collection.name + (t ? " — " + String(t).slice(0, 140) : ""));
    $app.save(rec);
  } catch (err) {
    $app.logger().error("audit update failed", "err", String(err));
  }
});

onRecordDeleteRequest((e) => {
  const tracked = ["research", "investigations", "findings", "rti_cases", "comments", "members", "notifications", "site_stats", "users", "contributions"];
  if (tracked.indexOf(e.collection.name) === -1) {
    e.next();
    return;
  }
  const auth = e.requestInfo && e.requestInfo.auth ? e.requestInfo.auth : null;
  const rid = e.record.id || "";
  const t = e.record.get("title") || e.record.get("full_name") || e.record.get("name") || e.record.get("label") || e.record.get("rti_id") || "";
  e.next();
  if (!auth) return;
  try {
    const col = $app.findCollectionByNameOrId("audit_log");
    const rec = new Record(col);
    rec.set("action", "delete");
    rec.set("collection_name", e.collection.name);
    rec.set("record_id", rid);
    rec.set("record_title", String(t).slice(0, 300));
    rec.set("actor", auth.id);
    rec.set("actor_name", auth.getString("name") || auth.getString("email") || "");
    rec.set("actor_role", auth.getString("role") || "");
    rec.set("summary", "Deleted " + e.collection.name + (t ? " — " + String(t).slice(0, 140) : ""));
    $app.save(rec);
  } catch (err) {
    $app.logger().error("audit delete failed", "err", String(err));
  }
});
