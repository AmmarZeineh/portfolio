"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui-kit/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sendContactMessage } from "@/lib/contact/action";
import { contactSchema, type ContactErrorKey, type ContactValues } from "@/lib/contact/schema";
import { EASE_OUT_EXPO } from "@/lib/motion/tier";

type Labels = Dictionary["contactPage"];

/**
 * Contact form: validated in the browser and again on the server, saved to
 * Supabase, with an optional email notification. On success the form gives
 * way to a confirmation that repeats who'll get the reply.
 */
export function ContactForm({ labels }: { labels: Labels }) {
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "", website: "", startedAt: 0 },
    mode: "onTouched",
  });
  const { register, handleSubmit, formState, setError, setValue, reset } = form;

  // When the visitor started filling the form; instant submissions are treated as bots.
  useEffect(() => {
    if (!sent) setValue("startedAt", Date.now());
  }, [sent, setValue]);
  const errorText = (key: string | undefined) => (key ? labels.errors[key as ContactErrorKey] ?? key : undefined);

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await sendContactMessage(values);
      if (result.ok) {
        setSent({ name: values.name, email: values.email });
        return;
      }
      if (result.reason === "invalid") {
        for (const [field, key] of Object.entries(result.fields)) {
          setError(field as "name" | "email" | "message", { message: key });
        }
        return;
      }
      setFormError(labels.errors[result.reason]);
    });
  });

  return (
    <div aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className="py-10"
          >
            <p className="font-display text-3xl">{labels.sentTitle}</p>
            <p className="mt-4 max-w-[40ch] text-lg text-muted">
              {labels.sentBody.replace("{name}", sent.name).replace("{email}", sent.email)}
            </p>
            <button
              type="button"
              className="link-underline mt-8 text-sm"
              onClick={() => {
                reset();
                setSent(null);
              }}
            >
              {labels.sendAnother}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            className="space-y-10"
          >
            <div className="grid gap-10 sm:grid-cols-2">
              <Input id="contact-name" label={labels.name} autoComplete="name" error={errorText(formState.errors.name?.message)} registration={register("name")} />
              <Input id="contact-email" label={labels.email} type="email" autoComplete="email" error={errorText(formState.errors.email?.message)} registration={register("email")} />
            </div>
            <Input
              id="contact-message"
              label={labels.message}
              hint={labels.messageHint}
              multiline
              error={errorText(formState.errors.message?.message)}
              registration={register("message")}
            />

            {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
            </div>

            {formError && (
              <p role="alert" className="text-sm text-danger">
                {formError}
              </p>
            )}

            <Button type="submit" disabled={pending}>
              {pending ? labels.sending : labels.send}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

type InputProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
  type?: string;
  autoComplete?: string;
  registration: UseFormRegisterReturn;
};

/** Underlined field in the site's style; the line turns accent on focus and red on error. */
function Input({ id, label, hint, error, multiline = false, type = "text", autoComplete, registration }: InputProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const common = {
    id,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: `block w-full border-0 border-b bg-transparent px-0 py-3 text-lg transition-[border-color,box-shadow] outline-none focus-visible:outline-none focus:shadow-[0_1px_0_var(--accent)] ${
      error ? "border-danger focus:border-danger" : "border-line focus:border-accent"
    }`,
    ...registration,
  };

  return (
    <div>
      <label htmlFor={id} className="text-sm text-muted">
        {label}
      </label>
      {multiline ? <textarea rows={5} {...common} className={`${common.className} resize-y`} /> : <input type={type} {...common} />}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-2 text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
