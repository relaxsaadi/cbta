import assert from "node:assert/strict";
import { test } from "node:test";
import { buildMoodleRestRequest } from "../lib/moodle-request.mjs";

test("Moodle Web Service token and function parameters stay out of the URL", () => {
  const token = "secret-token-that-must-never-reach-the-uri";
  const request = buildMoodleRestRequest(
    "http://moodle.internal/",
    token,
    "core_user_get_users",
    {
      "criteria[0][key]": "email",
      "criteria[0][value]": "candidate@example.invalid",
    },
  );

  const parsed = new URL(request.url);
  assert.equal(parsed.pathname, "/webservice/rest/server.php");
  assert.equal(parsed.search, "");
  assert.equal(request.url.includes(token), false);
  assert.equal(request.url.includes("candidate@example.invalid"), false);

  assert.equal(request.body.get("wstoken"), token);
  assert.equal(request.body.get("wsfunction"), "core_user_get_users");
  assert.equal(request.body.get("moodlewsrestformat"), "json");
  assert.equal(request.body.get("criteria[0][key]"), "email");
  assert.equal(request.body.get("criteria[0][value]"), "candidate@example.invalid");
});

test("Moodle request builder normalizes only trailing base URL slashes", () => {
  const request = buildMoodleRestRequest(
    "https://example.invalid/moodle///",
    "token",
    "core_webservice_get_site_info",
  );

  assert.equal(
    request.url,
    "https://example.invalid/moodle/webservice/rest/server.php",
  );
  assert.equal(new URL(request.url).search, "");
});
