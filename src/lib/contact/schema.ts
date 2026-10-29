import { z } from "zod";

/** Shared by the contact form (React Hook Form) and the server action. */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "name").max(120, "name"),
  email: z.email("email").max(254, "email"),
  message: z.string().trim().min(10, "message").max(5000, "messageLong"),
  /** Honeypot: hidden from people, filled in by bots. */
  website: z.string().max(200).optional(),
  /** When the form was rendered (ms); instant submissions are bots. */
  startedAt: z.number(),
});

export type ContactValues = z.input<typeof contactSchema>;

/** Keys into the dictionary's contactPage.errors. */
export type ContactErrorKey = "name" | "email" | "message" | "messageLong";
