/// <reference path="../pb_data/types.d.ts" />

/*
 * Security hardening: two custom routes added in president-access.pb.js had
 * no dedicated rate limit, relying only on the generic "/api" 200-per-5-min
 * rule from 1769164585_set_rate_limits.js:
 *
 *  - GET /api/admin/resolve?admin_id=... returns a distinct 404 vs 200,
 *    which lets a caller enumerate valid Admin IDs by brute force.
 *  - POST /api/president-alert requires no authentication and sends an
 *    email to the President for any caller-supplied identifier, so it can
 *    be used to flood the President's inbox.
 *
 * This does not change how either route behaves for a legitimate caller
 * (the admin login screen resolves its own ID a handful of times at most;
 * the alert route fires once per failed president-login attempt) — it only
 * caps abusive repeated calls, matching the same pattern already used for
 * the OTP and password-reset routes.
 */
migrate((app) => {
  const settings = app.settings();
  const rules = settings.rateLimits.rules || [];

  const existingLabels = new Set(rules.map((rule) => rule.label));

  if (!existingLabels.has("GET /api/admin/resolve")) {
    rules.push({
      label: "GET /api/admin/resolve",
      audience: "",
      duration: 60 * 60, // 1 hour
      maxRequests: 20,
    });
  }

  if (!existingLabels.has("POST /api/president-alert")) {
    rules.push({
      label: "POST /api/president-alert",
      audience: "",
      duration: 60 * 60, // 1 hour
      maxRequests: 5,
    });
  }

  settings.rateLimits.rules = rules;
  app.save(settings);
});
