/** Students sign in with their university address only. */
export const STUDENT_EMAIL_DOMAIN = "studbocconi.it";

// Deliberately narrower than RFC 5322: no quoted local parts, no "+" aliases (one account per
// student, otherwise plus-addressing would let one person create unlimited Free accounts).
const EMAIL_RE = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/;

/** Trims and lowercases; returns null if the input is not a single plain email address. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function isStudentEmail(email: string): boolean {
  return email.slice(email.lastIndexOf("@") + 1) === STUDENT_EMAIL_DOMAIN;
}

/**
 * Who may sign in: any @studbocconi.it address (exact domain, no subdomains) or an address on
 * the admin allowlist. `adminEmails` must already be lowercased.
 */
export function isAllowedEmail(raw: unknown, adminEmails: readonly string[]): boolean {
  const email = normalizeEmail(raw);
  if (!email) return false;
  return isStudentEmail(email) || adminEmails.includes(email);
}

export function isAdminEmail(raw: unknown, adminEmails: readonly string[]): boolean {
  const email = normalizeEmail(raw);
  return email !== null && adminEmails.includes(email);
}
