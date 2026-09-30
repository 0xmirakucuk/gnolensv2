import { describe, expect, it } from "vitest";
import {
  isAdminEmail,
  isAllowedEmail,
  isStudentEmail,
  normalizeEmail,
} from "@/lib/auth/allowed-email";

const admins = ["owner@gmail.com"];

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Mario.Rossi@StudBocconi.IT ")).toBe("mario.rossi@studbocconi.it");
  });

  it.each([
    ["empty", ""],
    ["no @", "mario.rossi"],
    ["two @", "a@b@studbocconi.it"],
    ["space inside", "mario rossi@studbocconi.it"],
    ["quoted local part", '"mario"@studbocconi.it'],
    ["plus alias", "mario+free2@studbocconi.it"],
    ["no TLD", "mario@studbocconi"],
    ["leading dot", ".mario@studbocconi.it"],
    ["newline injection", "mario@studbocconi.it\nbcc@evil.com"],
    ["non-string", 42],
    ["too long", `${"a".repeat(250)}@studbocconi.it`],
  ])("rejects %s", (_, input) => {
    expect(normalizeEmail(input)).toBeNull();
  });
});

describe("isStudentEmail", () => {
  it("matches the exact domain only", () => {
    expect(isStudentEmail("mario@studbocconi.it")).toBe(true);
    expect(isStudentEmail("mario@unibocconi.it")).toBe(false);
    expect(isStudentEmail("mario@sub.studbocconi.it")).toBe(false);
  });
});

describe("isAllowedEmail", () => {
  it.each(["mario.rossi@studbocconi.it", "MARIO.ROSSI@STUDBOCCONI.IT", " a_b-c@studbocconi.it "])(
    "allows student address %j",
    (email) => {
      expect(isAllowedEmail(email, admins)).toBe(true);
    },
  );

  it.each([
    "mario@gmail.com",
    "mario@unibocconi.it", // staff domain, not students
    "mario@sub.studbocconi.it",
    "mario@studbocconi.it.evil.com",
    "studbocconi.it@evil.com",
    "mario@evilstudbocconi.it",
    "mario@studbocconi.com",
  ])("rejects %j", (email) => {
    expect(isAllowedEmail(email, admins)).toBe(false);
  });

  it("allows allowlisted admins outside the student domain, case-insensitively", () => {
    expect(isAllowedEmail("Owner@Gmail.com", admins)).toBe(true);
    expect(isAllowedEmail("other@gmail.com", admins)).toBe(false);
  });

  it("allows nobody outside the domain when the allowlist is empty", () => {
    expect(isAllowedEmail("owner@gmail.com", [])).toBe(false);
  });
});

describe("isAdminEmail", () => {
  it("is true only for allowlisted addresses", () => {
    expect(isAdminEmail(" OWNER@gmail.com", admins)).toBe(true);
    expect(isAdminEmail("mario@studbocconi.it", admins)).toBe(false);
    expect(isAdminEmail("mario@studbocconi.it", ["mario@studbocconi.it"])).toBe(true);
  });
});
