import { expect, test, type Page } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { loginAs } from "./helpers";

const dbPath = resolve(import.meta.dirname, "../../data/e2e-test.db");

function withDb<T>(fn: (db: DatabaseSync) => T): T {
  const db = new DatabaseSync(dbPath);
  try {
    return fn(db);
  } finally {
    db.close();
  }
}

function snapshotSideEffects() {
  return withDb((db) => ({
    sessions: Number((db.prepare(`SELECT COUNT(*) AS count FROM familiarization_sessions`).get() as { count: number }).count),
    candidateInvitations: Number(
      (
        db
          .prepare(`SELECT COUNT(*) AS count FROM notification_log WHERE event_type = 'FAMILIARIZATION_INVITATION'`)
          .get() as { count: number }
      ).count
    ),
  }));
}

async function fillRequiredSessionFields(page: Page) {
  await page.locator("#groupId").selectOption({ index: 1 });
  await page.locator("#functionCode").selectOption("7.1");
  await page.locator("#heldAt").fill("2026-09-20T09:30");
  await page.locator("#location").fill("Salle E2E — audience boundary");
}

test.describe.serial("Familiarisation — real Server Action audience boundary (#10)", () => {
  test("a forged audience is rejected before persistence or candidate notification outbox", async ({ page }) => {
    await loginAs(page, "responsable.demo");
    await page.goto("/familiarisation");
    await fillRequiredSessionFields(page);

    const before = snapshotSideEffects();
    const audience = page.locator("#audience");
    await audience.evaluate((select) => {
      const option = document.createElement("option");
      option.value = "forged-external-audience";
      option.textContent = "Forged external audience";
      (select as HTMLSelectElement).append(option);
    });
    await audience.selectOption("forged-external-audience");

    await page.getByRole("button", { name: "Créer la session de familiarisation" }).click();
    await expect(page.getByText("Public visé invalide.")).toBeVisible();

    const after = snapshotSideEffects();
    expect(after.sessions).toBe(before.sessions);
    expect(after.candidateInvitations).toBe(before.candidateInvitations);
  });

  test("personnel-only creates the session but no candidate attendance or candidate invitation outbox", async ({ page }) => {
    await loginAs(page, "responsable.demo");
    await page.goto("/familiarisation");
    await fillRequiredSessionFields(page);
    await page.locator("#audience").selectOption("personnel");

    const before = snapshotSideEffects();
    await page.getByRole("button", { name: "Créer la session de familiarisation" }).click();
    await page.waitForURL(/\/familiarisation\/\d+$/);

    const sessionId = Number(page.url().match(/\/familiarisation\/(\d+)$/)?.[1]);
    expect(Number.isInteger(sessionId) && sessionId > 0).toBe(true);

    const persisted = withDb((db) => {
      const session = db.prepare(`SELECT audience FROM familiarization_sessions WHERE id = ?`).get(sessionId) as { audience: string } | undefined;
      const attendance = db.prepare(`SELECT COUNT(*) AS count FROM familiarization_attendance WHERE session_id = ?`).get(sessionId) as { count: number };
      const invitations = db
        .prepare(`SELECT COUNT(*) AS count FROM notification_log WHERE event_type = 'FAMILIARIZATION_INVITATION'`)
        .get() as { count: number };
      const totalSessions = db.prepare(`SELECT COUNT(*) AS count FROM familiarization_sessions`).get() as { count: number };
      return {
        audience: session?.audience,
        attendance: Number(attendance.count),
        candidateInvitations: Number(invitations.count),
        sessions: Number(totalSessions.count),
      };
    });

    expect(persisted.sessions).toBe(before.sessions + 1);
    expect(persisted.audience).toBe("personnel");
    expect(persisted.attendance).toBe(0);
    expect(persisted.candidateInvitations).toBe(before.candidateInvitations);
  });
});
