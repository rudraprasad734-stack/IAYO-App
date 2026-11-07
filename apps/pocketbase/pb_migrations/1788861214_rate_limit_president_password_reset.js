/// <reference path="../pb_data/types.d.ts" />

/*
 * Rate limit the new President password-reset routes, matching the same
 * pattern used for every other custom route in this app (admin/resolve,
 * president-alert): the request route sends an email per call, and the
 * confirm route accepts a guessable 6-digit code, so both need their own
 * caps independent of the generic "/api" rule.
 */
migrate((app) => {
  const settings = app.settings();
  const rules = settings.rateLimits.rules || [];

  const existingLabels = new Set(rules.map((rule) => rule.label));

  if (!existingLabels.has("POST /api/president/password-reset/request")) {
    rules.push({
      label: "POST /api/president/password-reset/request",
      audience: "",
      duration: 60 * 60, // 1 hour
      maxRequests: 5,
    });
  }

  if (!existingLabels.has("POST /api/president/password-reset/confirm")) {
    rules.push({
      label: "POST /api/president/password-reset/confirm",
      audience: "",
      duration: 60 * 60, // 1 hour
      maxRequests: 20,
    });
  }

  settings.rateLimits.rules = rules;
  app.save(settings);
});
