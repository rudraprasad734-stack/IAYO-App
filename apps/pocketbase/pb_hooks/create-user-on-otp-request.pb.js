/// <reference path="../pb_data/types.d.ts" />

// Create a citizen auth record on the fly when an OTP is requested for an
// email that does not yet exist. This enables passwordless public sign-up
// for citizens via email OTP. President/admin accounts are created separately
// by an admin and are never created here.
onRecordRequestOTPRequest((e) => {
  if (!e.record) {
    const email = e.requestInfo().body["email"];
    const record = new Record(e.collection);
    record.setEmail(email);
    record.setPassword($security.randomString(30));
    record.set("name", email ? email.split("@")[0] : "Member");
    record.set("role", "citizen");
    e.app.save(record);
    e.record = record;
  }
  return e.next();
}, "users");
