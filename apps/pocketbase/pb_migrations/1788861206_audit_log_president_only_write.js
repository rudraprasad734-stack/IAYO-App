/// <reference path="../pb_data/types.d.ts" />

/*
 * Security fix: audit_log tamper vector.
 *
 * 1788861100_president_super_admin_and_audit.js granted both President and
 * Admin ("staff") the ability to create and delete audit_log records
 * directly through the REST API. In practice every legitimate audit entry
 * is written internally by pb_hooks/audit-log.pb.js via $app.save(), which
 * runs with superuser privileges and does not go through this collection's
 * API rules at all — so the createRule/deleteRule only ever gate direct
 * client calls. The only direct client caller is logAudit() in
 * apps/web/src/lib/data.js, which is exclusively invoked from
 * PresidentDashboard.jsx (never from AdminDashboard.jsx).
 *
 * Leaving Admin in createRule/deleteRule serves no legitimate use case and
 * lets a malicious or compromised Admin forge fake audit entries or delete
 * real ones to cover their tracks, contradicting this collection's intended
 * append-only design. Restrict both to President only; listRule/viewRule
 * stay staff so Admins can still read the audit trail.
 */
migrate(
  (app) => {
    const auditLog = app.findCollectionByNameOrId("audit_log");
    auditLog.createRule = "@request.auth.role = 'president'";
    auditLog.deleteRule = "@request.auth.role = 'president'";
    app.save(auditLog);
  },
  (app) => {
    const auditLog = app.findCollectionByNameOrId("audit_log");
    const staff = "@request.auth.role = 'president' || @request.auth.role = 'admin'";
    auditLog.createRule = staff;
    auditLog.deleteRule = staff;
    app.save(auditLog);
  },
);
