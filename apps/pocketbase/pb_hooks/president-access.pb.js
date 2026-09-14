/// <reference path="../pb_data/types.d.ts" />

/*
 * IAYO access control.
 *
 * President:
 *   - exactly one account
 *   - registered email + password + email OTP
 *
 * Admin:
 *   - account is created by the President
 *   - Admin ID + password login
 *   - no publishing/edit/delete permissions
 *
 * Content:
 *   Admin creates -> pending_president
 *   President publishes or rejects
 */

/* ---------------------------------------------------------------
 * President existence check
 * --------------------------------------------------------------- */
routerAdd("GET", "/api/president-exists", (e) => {
  const noRows = (message) => {
    const text = String(message || "");
    return text.includes("no rows in result set") || text.includes("no rows");
  };

  try {
    const president = $app.findFirstRecordByFilter("users", "role = 'president'");
    const email = president.getString("email") || "";
    const at = email.indexOf("@");
    const masked =
      at > 0
        ? email.slice(0, Math.min(2, at)) + "***@" + email.slice(at + 1)
        : "";

    return e.json(200, { exists: true, email: masked });
  } catch (err) {
    if (noRows(err?.message || err)) {
      return e.json(200, { exists: false, email: "" });
    }

    $app.logger().error("president-exists failed", "err", String(err));
    return e.json(500, { error: "Unable to verify President registration status." });
  }
});

/* ---------------------------------------------------------------
 * One-time President setup
 * --------------------------------------------------------------- */
routerAdd("POST", "/api/president-setup", (e) => {
  const noRows = (message) => {
    const text = String(message || "");
    return text.includes("no rows in result set") || text.includes("no rows");
  };

  function sendPresidentAlert(president, attemptEmail, attemptId, kind) {
    const to = president.getString("email");
    if (!to) return;
  
    const presidentName = president.getString("name") || "President";
    const subject =
      kind === "setup"
        ? "IAYO Security Alert: second President registration attempt"
        : "IAYO Security Alert: unauthorized President login attempt";
  
    const details = [];
    if (attemptEmail) {
      details.push("<li>Attempted email: <strong>" + attemptEmail + "</strong></li>");
    }
    if (attemptId) {
      details.push("<li>Attempted ID: <strong>" + attemptId + "</strong></li>");
    }
  
    const html =
      "<div style='font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0b1b33'>" +
      "<h2>IAYO Security Alert</h2>" +
      "<p>Hello " + presidentName + ",</p>" +
      "<p>We detected " +
      (kind === "setup"
        ? "an attempt to register a second President account"
        : "an unauthorised President login attempt") +
      ". The attempt was denied.</p>" +
      "<ul>" + (details.length ? details.join("") : "<li>No identifier supplied.</li>") + "</ul>" +
      "<p>Time: " + new Date().toISOString() + "</p>" +
      "<p>— IAYO Security</p>" +
      "</div>";
  
    try {
      const message = new MailerMessage({
        from: { name: "IAYO Security" },
        to: [{ address: to }],
        subject,
        html,
      });
      $app.newMailClient().send(message);
    } catch (err) {
      $app.logger().error("president alert email failed", "err", String(err));
    }
  }

  const body = e.requestInfo().body || {};

  let existing = null;
  try {
    existing = $app.findFirstRecordByFilter("users", "role = 'president'");
  } catch (err) {
    if (!noRows(err?.message || err)) {
      $app.logger().error("president setup lookup failed", "err", String(err));
      return e.json(500, { error: "Unable to verify President registration status." });
    }
  }

  if (existing) {
    sendPresidentAlert(
      existing,
      String(body.email || "").trim().toLowerCase(),
      "",
      "setup",
    );

    return e.json(409, {
      error: "A President profile already exists. Registration is permanently closed.",
    });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const district = String(body.district || "").trim();
  const state = String(body.state || "").trim();
  const bio = String(body.bio || "").trim();

  if (!name || !email || !password) {
    return e.json(400, { error: "Name, email and password are required." });
  }

  if (password.length < 10) {
    return e.json(400, { error: "Password must be at least 10 characters." });
  }

  try {
    $app.findAuthRecordByEmail("users", email);
    return e.json(400, { error: "That email is already registered." });
  } catch (err) {
    if (!noRows(err?.message || err)) {
      return e.json(500, { error: "Unable to verify email availability." });
    }
  }

  const users = $app.findCollectionByNameOrId("users");
  const record = new Record(users);
  record.setEmail(email);
  record.setPassword(password);
  record.set("name", name);
  record.set("role", "president");
  record.set("verified", true);
  if (district) record.set("district", district);
  if (state) record.set("state", state);
  if (bio) record.set("bio", bio);

  try {
    // The unique database index is the final race-condition protection.
    $app.save(record);
  } catch (err) {
    const text = String(err?.message || err || "");
    if (text.toLowerCase().includes("unique") || text.toLowerCase().includes("constraint")) {
      return e.json(409, { error: "A President profile already exists. Registration is permanently closed." });
    }
    $app.logger().error("president creation failed", "err", text);
    return e.json(500, { error: "President account could not be created." });
  }

  return e.json(200, { ok: true, email });
});

/* ---------------------------------------------------------------
 * President security alert endpoint
 * --------------------------------------------------------------- */
routerAdd("POST", "/api/president-alert", (e) => {
  const noRows = (message) => {
    const text = String(message || "");
    return text.includes("no rows in result set") || text.includes("no rows");
  };

  function sendPresidentAlert(president, attemptEmail, attemptId, kind) {
    const to = president.getString("email");
    if (!to) return;
  
    const presidentName = president.getString("name") || "President";
    const subject =
      kind === "setup"
        ? "IAYO Security Alert: second President registration attempt"
        : "IAYO Security Alert: unauthorized President login attempt";
  
    const details = [];
    if (attemptEmail) {
      details.push("<li>Attempted email: <strong>" + attemptEmail + "</strong></li>");
    }
    if (attemptId) {
      details.push("<li>Attempted ID: <strong>" + attemptId + "</strong></li>");
    }
  
    const html =
      "<div style='font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0b1b33'>" +
      "<h2>IAYO Security Alert</h2>" +
      "<p>Hello " + presidentName + ",</p>" +
      "<p>We detected " +
      (kind === "setup"
        ? "an attempt to register a second President account"
        : "an unauthorised President login attempt") +
      ". The attempt was denied.</p>" +
      "<ul>" + (details.length ? details.join("") : "<li>No identifier supplied.</li>") + "</ul>" +
      "<p>Time: " + new Date().toISOString() + "</p>" +
      "<p>— IAYO Security</p>" +
      "</div>";
  
    try {
      const message = new MailerMessage({
        from: { name: "IAYO Security" },
        to: [{ address: to }],
        subject,
        html,
      });
      $app.newMailClient().send(message);
    } catch (err) {
      $app.logger().error("president alert email failed", "err", String(err));
    }
  }

  const body = e.requestInfo().body || {};

  let president = null;
  try {
    president = $app.findFirstRecordByFilter("users", "role = 'president'");
  } catch (err) {
    if (!noRows(err?.message || err)) {
      return e.json(500, { error: "Unable to process security alert." });
    }
  }

  if (president) {
    sendPresidentAlert(
      president,
      String(body.attempt_email || body.email || "").trim().toLowerCase(),
      "",
      "login",
    );
  }

  return e.json(200, { ok: true });
});

/* ---------------------------------------------------------------
 * Admin ID -> email resolver
 * --------------------------------------------------------------- */
routerAdd("GET", "/api/admin/resolve", (e) => {
  const noRows = (message) => {
    const text = String(message || "");
    return text.includes("no rows in result set") || text.includes("no rows");
  };

  const adminId = String(e.requestInfo().query?.admin_id || "").trim();

  if (!adminId) {
    return e.json(422, { error: "admin_id is required." });
  }

  try {
    const record = $app.findFirstRecordByFilter(
      "users",
      `role = 'admin' && admin_enabled = true && admin_id = "${adminId.replaceAll('"', '\\"')}"`,
    );

    return e.json(200, { email: record.getString("email") || "" });
  } catch (err) {
    if (noRows(err?.message || err)) {
      return e.json(404, { error: "Admin ID not found." });
    }

    return e.json(500, { error: "Unable to verify Admin ID." });
  }
});

/* ---------------------------------------------------------------
 * Public research contributor applications
 * --------------------------------------------------------------- */
routerAdd("GET", "/api/homepage-metrics", (e) => {
  const publishedRtiFilter = "status = 'published' || status = 'reply_received' || status = 'awaiting_reply' || status = 'appeal_filed' || status = 'resolved' || status = 'filed'";
  const publishedContentFilter = "status = 'published'";

  const safeNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const distinct = new Set();
  const addDistrict = (value) => {
    const v = String(value || "").trim().toLowerCase();
    if (v) distinct.add(v);
  };

  try {
    const members = $app.findRecordsByFilter("members", "", "", 100000, 0);
    const rtis = $app.findRecordsByFilter("rti_cases", publishedRtiFilter, "", 100000, 0);
    const findings = $app.findRecordsByFilter("findings", publishedContentFilter, "", 100000, 0);
    const research = $app.findRecordsByFilter("research", publishedContentFilter, "", 100000, 0);
    const investigations = $app.findRecordsByFilter("investigations", publishedContentFilter, "", 100000, 0);

    let corruptionAmount = 0;
    findings.forEach((record) => {
      corruptionAmount += safeNumber(record.get("corruption_amount"));
      addDistrict(record.getString("district"));
      addDistrict(record.getString("location"));
    });
    rtis.forEach((record) => addDistrict(record.getString("district")));
    members.forEach((record) => addDistrict(record.getString("district")));

    const replies = rtis.filter((record) =>
      ["reply_received", "published", "resolved"].includes(record.getString("status")),
    ).length;

    return e.json(200, {
      members: members.length,
      rtis: rtis.length,
      districts: distinct.size,
      corruptionAmount,
      replies,
      reports: research.length,
      findings: findings.length,
      investigations: investigations.length,
      replyRate: rtis.length ? Number(((replies / rtis.length) * 100).toFixed(1)) : 0,
    });
  } catch (err) {
    $app.logger().error("homepage metrics failed", "err", String(err));
    return e.json(500, { error: "Unable to calculate live homepage metrics." });
  }
});

routerAdd("POST", "/api/research-applications", (e) => {
  const body = e.requestInfo().body || {};
  const text = (name, max) => String(body[name] || "").trim().slice(0, max);
  const name = text("name", 160);
  const phone = text("phone", 30);
  const email = text("email", 200).toLowerCase();
  const fieldOfInterest = text("field_of_interest", 200);
  const area = text("area", 200);
  const education = text("education_qualification", 200);
  const motivation = text("motivation", 2000);
  const oathAgreed = body.oath_agreed === true || body.oath_agreed === "true";
  const honeypot = text("website", 200);

  if (honeypot) return e.json(400, { error: "Invalid submission." });
  if (!name || !phone || !email || !fieldOfInterest || !area || !education || !motivation) {
    return e.json(400, { error: "Please complete every required field." });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) return e.json(400, { error: "Please provide a valid email address." });
  if (!oathAgreed) return e.json(400, { error: "You must agree to the IAYO research oath before submitting." });

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  let president;
  try {
    president = $app.findFirstRecordByFilter("users", "role = 'president'");
  } catch (_) {
    return e.json(503, { error: "President account is not configured yet. Please try again later." });
  }

  const collection = $app.findCollectionByNameOrId("research_applications");
  const record = new Record(collection);
  record.set("name", name);
  record.set("phone", phone);
  record.set("email", email);
  record.set("field_of_interest", fieldOfInterest);
  record.set("area", area);
  record.set("education_qualification", education);
  record.set("motivation", motivation);
  record.set("oath_agreed", true);
  record.set("status", "pending");

  try {
    $app.save(record);
  } catch (err) {
    $app.logger().error("research application save failed", "err", String(err));
    return e.json(500, { error: "Your application could not be saved. Please try again." });
  }

  const presidentEmail = president.getString("email");
  if (presidentEmail) {
    try {
      const message = new MailerMessage({
        from: { address: $app.settings().meta.senderAddress, name: "IAYO Research Applications" },
        to: [{ address: presidentEmail }],
        subject: "New IAYO Research Contributor Application",
        html:
          "<div style='font-family:Inter,Arial,sans-serif;max-width:680px;margin:0 auto;color:#0b1b33'>" +
          "<h2>New Research &amp; Contribute Application</h2>" +
          "<p>A new person has applied to contribute to IAYO research. Please review the application in the President Dashboard.</p>" +
          "<hr style='border:0;border-top:1px solid #e5e7eb;margin:20px 0'/>" +
          "<p><strong>Name:</strong> " + escapeHtml(name) + "</p>" +
          "<p><strong>Phone:</strong> " + escapeHtml(phone) + "</p>" +
          "<p><strong>Email:</strong> " + escapeHtml(email) + "</p>" +
          "<p><strong>Field of interest:</strong> " + escapeHtml(fieldOfInterest) + "</p>" +
          "<p><strong>Area:</strong> " + escapeHtml(area) + "</p>" +
          "<p><strong>Education:</strong> " + escapeHtml(education) + "</p>" +
          "<p><strong>Motivation:</strong><br/>" + escapeHtml(motivation).replaceAll("\n", "<br/>") + "</p>" +
          "<p><strong>Oath:</strong> Agreed</p>" +
          "<p><strong>Application ID:</strong> " + escapeHtml(record.id) + "</p>" +
          "</div>",
      });
      $app.newMailClient().send(message);
    } catch (err) {
      // The application remains safely stored in the President review queue.
      $app.logger().error("research application email failed", "err", String(err));
    }
  }

  return e.json(200, { ok: true, application_id: record.id });
});


/* ---------------------------------------------------------------
 * Public contribution intake -> President email notification.
 * Files remain private because the contributions collection is
 * readable only by the President.
 * --------------------------------------------------------------- */
onRecordCreateRequest((e) => {
  if (e.collection.name !== "contributions") {
    e.next();
    return;
  }

  const body = e.requestInfo().body || {};
  const honeypot = String(body.website || e.record.getString("website") || "").trim();
  if (honeypot) {
    throw new BadRequestError("Contribution could not be submitted.");
  }

  if (!e.record.getString("name") || !e.record.getString("email") || !e.record.getString("title")) {
    throw new BadRequestError("Name, email and contribution title are required.");
  }
  if (!e.record.getString("description")) {
    throw new BadRequestError("A description of the contribution is required.");
  }
  if (!e.record.getBool("consent_agreed")) {
    throw new BadRequestError("Contribution confirmation is required.");
  }

  const rawFiles = e.record.get("files");
  const files = Array.isArray(rawFiles) ? rawFiles : (rawFiles ? [rawFiles] : []);
  if (!files.length) {
    throw new BadRequestError("At least one file is required.");
  }

  e.record.set("status", "pending");
  e.next();

  try {
    const president = $app.findFirstRecordByFilter("users", "role = 'president'");
    const to = president.getString("email");
    if (!to) return;

    const name = e.record.getString("name");
    const email = e.record.getString("email");
    const title = e.record.getString("title");
    const type = e.record.getString("contribution_type");
    const area = e.record.getString("area");
    const fileList = files.map((name) => "<li>" + String(name) + "</li>").join("");

    const html =
      "<div style='font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;color:#0b1b33'>" +
      "<h2>New IAYO Contribution</h2>" +
      "<p>A member of the public has submitted research material for Presidential review.</p>" +
      "<ul>" +
      "<li><strong>Title:</strong> " + title + "</li>" +
      "<li><strong>Contributor:</strong> " + name + "</li>" +
      "<li><strong>Email:</strong> " + email + "</li>" +
      "<li><strong>Phone:</strong> " + e.record.getString("phone") + "</li>" +
      "<li><strong>Type:</strong> " + type + "</li>" +
      "<li><strong>Area:</strong> " + area + "</li>" +
      "</ul>" +
      "<p><strong>Description:</strong><br>" + e.record.getString("description") + "</p>" +
      "<p><strong>Attached files:</strong></p><ul>" + fileList + "</ul>" +
      "<p>The submission is private and remains pending until you review it in the President Dashboard.</p>" +
      "</div>";

    const message = new MailerMessage({
      from: { name: "IAYO Contributions" },
      to: [{ address: to }],
      subject: "IAYO: New contribution awaiting review — " + title,
      html,
    });
    $app.newMailClient().send(message);
  } catch (err) {
    $app.logger().error("contribution notification email failed", "err", String(err));
  }
});
