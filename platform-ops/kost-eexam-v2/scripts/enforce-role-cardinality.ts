import { closeDb } from "../lib/db";
import { enforceSinglePersistedRolePerUser } from "../lib/role-cardinality-storage";

try {
  enforceSinglePersistedRolePerUser();
  console.log("Contrainte persistée appliquée : exactement un rôle au maximum par user_id.");
} finally {
  closeDb();
}
