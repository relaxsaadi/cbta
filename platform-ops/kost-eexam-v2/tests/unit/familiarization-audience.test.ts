import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  FAMILIARIZATION_AUDIENCES,
  familiarizationAudienceIncludesCandidates,
  parseFamiliarizationAudience,
} from "../../lib/familiarization-audience";

describe("Familiarisation audience policy", () => {
  test("accepts only the shared candidates/personnel/mixed taxonomy", () => {
    assert.deepEqual(FAMILIARIZATION_AUDIENCES.map((entry) => entry.value), ["candidats", "personnel", "mixte"]);
    assert.equal(parseFamiliarizationAudience("candidats"), "candidats");
    assert.equal(parseFamiliarizationAudience("personnel"), "personnel");
    assert.equal(parseFamiliarizationAudience("mixte"), "mixte");
  });

  test("rejects forged and empty FormData values", () => {
    assert.equal(parseFamiliarizationAudience("security"), null);
    assert.equal(parseFamiliarizationAudience("external"), null);
    assert.equal(parseFamiliarizationAudience(""), null);
    assert.equal(parseFamiliarizationAudience(null), null);
  });

  test("candidate notifications are disabled for personnel-only sessions", () => {
    assert.equal(familiarizationAudienceIncludesCandidates("personnel"), false);
    assert.equal(familiarizationAudienceIncludesCandidates("candidats"), true);
    assert.equal(familiarizationAudienceIncludesCandidates("mixte"), true);
  });
});
