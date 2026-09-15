import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";

let adminId = 0;

before(async () => {
  setupTestDb();
  const { createUser } = await import("../../lib/users");
  adminId = createUser({
    username: "admin.platform.atomicity",
    password: "x".repeat(12),
    fullName: "Admin Platform Atomicity",
    role: "administrator",
  });
});

function auditCount(action: string): number {
  const row = getDb().prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = ?`).get(action) as { n: number };
  return Number(row.n);
}

function latestAudit(action: string) {
  return getDb()
    .prepare(`SELECT actor_user_id, actor_role, metadata_json FROM audit_logs WHERE action = ? ORDER BY id DESC LIMIT 1`)
    .get(action) as { actor_user_id: number | null; actor_role: string | null; metadata_json: string | null } | undefined;
}

function installAuditFailureTrigger(triggerName: string, action: string): void {
  getDb().exec(`
    CREATE TEMP TRIGGER ${triggerName}
    BEFORE INSERT ON audit_logs
    WHEN NEW.action = '${action}'
    BEGIN
      SELECT RAISE(ABORT, 'injected platform-setting audit failure');
    END;
  `);
}

function dropTrigger(triggerName: string): void {
  getDb().exec(`DROP TRIGGER IF EXISTS ${triggerName}`);
}

describe("Platform stop-control mutation + audit atomicity (#71)", () => {
  test("enable + injected audit failure rolls the stop-control back", async () => {
    const { getPlatformSetting, setPlatformSetting } = await import("../../lib/platform-settings");
    const action = "platform_setting_block_new_attempts_enabled";
    const trigger = "fail_platform_attempts_enable_audit";

    assert.equal(getPlatformSetting("block_new_attempts"), false);
    const beforeAudits = auditCount(action);
    installAuditFailureTrigger(trigger, action);
    try {
      assert.throws(
        () => setPlatformSetting("block_new_attempts", true, { id: adminId, role: "administrator" }),
        /injected platform-setting audit failure/
      );
    } finally {
      dropTrigger(trigger);
    }

    assert.equal(getPlatformSetting("block_new_attempts"), false, "failed success-audit must roll the enable mutation back");
    assert.equal(auditCount(action), beforeAudits, "no success audit may survive the failed transaction");
  });

  test("disable + injected audit failure cannot reopen a protected control", async () => {
    const { getPlatformSetting, setPlatformSetting } = await import("../../lib/platform-settings");
    const disableAction = "platform_setting_block_new_logins_disabled";
    const trigger = "fail_platform_logins_disable_audit";

    setPlatformSetting("block_new_logins", true, { id: adminId, role: "administrator" });
    assert.equal(getPlatformSetting("block_new_logins"), true);
    const beforeDisableAudits = auditCount(disableAction);

    installAuditFailureTrigger(trigger, disableAction);
    try {
      assert.throws(
        () => setPlatformSetting("block_new_logins", false, { id: adminId, role: "administrator" }),
        /injected platform-setting audit failure/
      );
    } finally {
      dropTrigger(trigger);
    }

    assert.equal(getPlatformSetting("block_new_logins"), true, "failed disable audit must keep the protection enabled");
    assert.equal(auditCount(disableAction), beforeDisableAudits);

    // Nettoyage après la preuve, hors injection de panne.
    setPlatformSetting("block_new_logins", false, { id: adminId, role: "administrator" });
  });

  test("successful enable/disable records the exact truthful transition and actor", async () => {
    const { getPlatformSetting, setPlatformSetting } = await import("../../lib/platform-settings");
    const enableAction = "platform_setting_maintenance_mode_enabled";
    const disableAction = "platform_setting_maintenance_mode_disabled";
    const beforeEnable = auditCount(enableAction);
    const beforeDisable = auditCount(disableAction);

    const enabled = setPlatformSetting("maintenance_mode", true, { id: adminId, role: "administrator" });
    assert.deepEqual(enabled, {
      key: "maintenance_mode",
      previousValue: false,
      value: true,
      changed: true,
    });
    assert.equal(getPlatformSetting("maintenance_mode"), true);
    assert.equal(auditCount(enableAction), beforeEnable + 1);

    const enableAudit = latestAudit(enableAction);
    assert.ok(enableAudit);
    assert.equal(enableAudit.actor_user_id, adminId);
    assert.equal(enableAudit.actor_role, "administrator");
    assert.deepEqual(JSON.parse(enableAudit.metadata_json ?? "{}"), {
      key: "maintenance_mode",
      label: "Mode maintenance",
      previousValue: false,
      value: true,
      changed: true,
    });

    const disabled = setPlatformSetting("maintenance_mode", false, { id: adminId, role: "administrator" });
    assert.deepEqual(disabled, {
      key: "maintenance_mode",
      previousValue: true,
      value: false,
      changed: true,
    });
    assert.equal(getPlatformSetting("maintenance_mode"), false);
    assert.equal(auditCount(disableAction), beforeDisable + 1);

    const disableAudit = latestAudit(disableAction);
    assert.ok(disableAudit);
    assert.deepEqual(JSON.parse(disableAudit.metadata_json ?? "{}"), {
      key: "maintenance_mode",
      label: "Mode maintenance",
      previousValue: true,
      value: false,
      changed: true,
    });
  });

  test("same-value requests are explicit no-op evidence, never fake transitions", async () => {
    const { getPlatformSetting, setPlatformSetting } = await import("../../lib/platform-settings");
    const noopAction = "platform_setting_block_new_attempts_noop";
    const enabledAction = "platform_setting_block_new_attempts_enabled";
    const disabledAction = "platform_setting_block_new_attempts_disabled";
    const beforeNoop = auditCount(noopAction);
    const beforeEnabled = auditCount(enabledAction);
    const beforeDisabled = auditCount(disabledAction);

    assert.equal(getPlatformSetting("block_new_attempts"), false);
    const result = setPlatformSetting("block_new_attempts", false, { id: adminId, role: "administrator" });

    assert.deepEqual(result, {
      key: "block_new_attempts",
      previousValue: false,
      value: false,
      changed: false,
    });
    assert.equal(getPlatformSetting("block_new_attempts"), false);
    assert.equal(auditCount(noopAction), beforeNoop + 1);
    assert.equal(auditCount(enabledAction), beforeEnabled, "no-op must not fabricate an enable transition");
    assert.equal(auditCount(disabledAction), beforeDisabled, "no-op must not fabricate a disable transition");

    const noopAudit = latestAudit(noopAction);
    assert.ok(noopAudit);
    assert.deepEqual(JSON.parse(noopAudit.metadata_json ?? "{}"), {
      key: "block_new_attempts",
      label: "Blocage des nouvelles tentatives",
      previousValue: false,
      value: false,
      changed: false,
    });
  });

  test("unknown future keys fail closed before any setting/audit write", async () => {
    const { setPlatformSetting } = await import("../../lib/platform-settings");
    const unknownKey = "future_emergency_switch";

    assert.throws(
      () => setPlatformSetting(unknownKey as never, true, { id: adminId, role: "administrator" }),
      /Clé de paramètre plateforme non prise en charge/
    );
    const row = getDb().prepare(`SELECT key FROM platform_settings WHERE key = ?`).get(unknownKey);
    assert.equal(row, undefined);
    const auditRow = getDb().prepare(`SELECT id FROM audit_logs WHERE metadata_json LIKE ? LIMIT 1`).get(`%${unknownKey}%`);
    assert.equal(auditRow, undefined);
  });
});
