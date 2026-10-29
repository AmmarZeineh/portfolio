import type { z } from "zod";

/** What every admin server action returns; the UI turns it into a toast or field errors. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });

export function fail(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/** Flattens Zod issues to { "title.en": "Required" } for React Hook Form's setError. */
export function invalid(error: z.ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    fieldErrors[key] ??= issue.message;
  }
  return fail("Some fields need attention.", fieldErrors);
}

/** Postgres unique violation, e.g. a slug that's already taken. */
export const isUniqueViolation = (error: { code?: string } | null) => error?.code === "23505";
