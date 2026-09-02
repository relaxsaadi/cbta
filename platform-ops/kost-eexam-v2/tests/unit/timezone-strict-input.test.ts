import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { parseAlgeriaLocalDateTimeToUtc } from "../../lib/timezone";

describe("datetime-local strict civil-date validation", () => {
  test("rejects impossible February 31 instead of normalizing into March", () => {
    assert.throws(() => parseAlgeriaLocalDateTimeToUtc("2026-02-31T11:30"));
  });

  test("rejects February 29 in a non-leap year", () => {
    assert.throws(() => parseAlgeriaLocalDateTimeToUtc("2026-02-29T11:30"));
  });

  test("rejects 24:00 instead of normalizing to the next day", () => {
    assert.throws(() => parseAlgeriaLocalDateTimeToUtc("2026-09-02T24:00"));
  });

  test("rejects an invalid hour beyond datetime-local range", () => {
    assert.throws(() => parseAlgeriaLocalDateTimeToUtc("2026-09-02T25:00"));
  });

  test("accepts a real leap-day value and preserves the Algeria-to-UTC conversion", () => {
    assert.equal(
      parseAlgeriaLocalDateTimeToUtc("2028-02-29T11:30"),
      "2028-02-29T10:30:00.000Z"
    );
  });
});
