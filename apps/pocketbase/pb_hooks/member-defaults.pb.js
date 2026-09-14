/// <reference path="../pb_data/types.d.ts" />

// Ensure every member record has a collision-resistant membership code and an
// active status, even if the public form omitted them. The client generates the
// code it displays on the success page; this is the server-side safety net.
onRecordCreateRequest((e) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  function randomCode() {
    let s = "";
    for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  if (!e.record.get("membership_code")) {
    let code = "";
    let attempts = 0;
    do {
      code = "IAYO-2026-" + randomCode();
      attempts++;
      try {
        app.findFirstRecordByFilter("members", `membership_code = "${code}"`);
      } catch (_) {
        break;
      }
    } while (attempts < 10);
    e.record.set("membership_code", code);
  }

  if (!e.record.get("status")) {
    e.record.set("status", "active");
  }

  e.next();
}, "members");
