/// <reference path="../pb_data/types.d.ts" />

// Brand the built-in OTP (email code) messages so the one-time login code
// sent to a president (or any user) is clearly delivered from IAYO and not
// silently filtered as a generic system email. PocketBase already sends the
// OTP email; this hook only rewrites the subject/sender/body, then calls
// e.next() so the platform mailer delivers it to the record's registered email.
onMailerRecordOTPSend((e) => {
  const appUrl = $app.settings().meta.appURL;
  const code = e.meta.password || "";
  const recipient = e.record.getString("email");

  e.message.from.name = "IAYO Security";
  e.message.subject = "Your IAYO sign-in code: " + code;
  e.message.html =
    "<div style='font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0b1b33'>" +
    "<h2 style='color:#0b1b33'>Your one-time sign-in code</h2>" +
    "<p>Hello,</p>" +
    "<p>You requested a sign-in code for your IAYO account. Use the code below to complete sign-in. This code is valid for a few minutes.</p>" +
    "<div style='margin:24px 0;text-align:center'>" +
    "<span style='display:inline-block;font-family:Menlo,Consolas,monospace;font-size:30px;font-weight:800;letter-spacing:0.35em;color:#1d4ed8;background:#f4f6f9;border:1px solid #e8ecf1;padding:16px 28px;border-radius:6px'>" +
    code +
    "</span></div>" +
    "<p style='color:#5a6a7e;font-size:13px'>If you did not request this code, you can safely ignore this email. Your account remains secure.</p>" +
    "<p style='color:#5a6a7e;font-size:12px'>— IAYO Security Directorate</p>" +
    "</div>";

  try {
    $app.logger().info("otp email dispatched", "to", recipient, "otpId", e.meta.otpId || "");
  } catch (_) {}

  e.next();
}, "users");
