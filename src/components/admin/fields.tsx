"use client";

import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { get, useFieldArray, useFormContext, useWatch, type ArrayPath, type FieldValues, type Path } from "react-hook-form";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

/** Label, control, hint and the field's error message, wired up for screen readers. */
export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function useFieldError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext();
  return (get(errors, name) as { message?: string } | undefined)?.message;
}

const described = (id: string, error?: string, hint?: ReactNode) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

export function TextField<T extends FieldValues>({
  name,
  label,
  hint,
  type = "text",
  multiline = false,
  rows = 4,
  dir,
  placeholder,
  className,
}: {
  name: Path<T>;
  label: ReactNode;
  hint?: ReactNode;
  type?: string;
  multiline?: boolean;
  rows?: number;
  dir?: "rtl" | "ltr";
  placeholder?: string;
  className?: string;
}) {
  const { register } = useFormContext<T>();
  const error = useFieldError(name);
  const id = `field-${name}`;
  const common = {
    id,
    dir,
    placeholder,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": described(id, error, hint),
    ...register(name),
  };
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      {multiline ? <Textarea rows={rows} {...common} /> : <Input type={type} {...common} />}
    </Field>
  );
}

/**
 * English and Arabic side by side for one { en, ar } value. Arabic is optional
 * everywhere: when it's empty the site shows the English text.
 */
export function BilingualField<T extends FieldValues>({
  name,
  label,
  hint,
  multiline = false,
  rows = 4,
}: {
  name: Path<T>;
  label: string;
  hint?: ReactNode;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        <TextField<T> name={`${name}.en` as Path<T>} label={<span className="text-xs text-muted-foreground">English</span>} multiline={multiline} rows={rows} />
        <TextField<T>
          name={`${name}.ar` as Path<T>}
          label={<span className="text-xs text-muted-foreground">Arabic (optional)</span>}
          multiline={multiline}
          rows={rows}
          dir="rtl"
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </fieldset>
  );
}

/** Markdown with a Write / Preview switch per language. */
export function MarkdownField<T extends FieldValues>({ name, label, hint }: { name: Path<T>; label: string; hint?: string }) {
  const { register, control } = useFormContext<T>();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [preview, setPreview] = useState(false);
  const fieldName = `${name}.${lang}` as Path<T>;
  const value = (useWatch({ control, name: fieldName }) as string | undefined) ?? "";
  const error = useFieldError(fieldName);
  const id = `field-${fieldName}`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex gap-1 text-xs">
          <Segmented options={[{ value: "en", label: "English" }, { value: "ar", label: "Arabic" }]} value={lang} onChange={setLang} />
          <Segmented options={[{ value: "write", label: "Write" }, { value: "preview", label: "Preview" }]} value={preview ? "preview" : "write"} onChange={(v) => setPreview(v === "preview")} />
        </div>
      </div>
      {preview ? (
        <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-32 rounded-md border bg-muted/30 px-4 py-3">
          {value.trim() ? <MarkdownPreview text={value} /> : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
        </div>
      ) : (
        <Textarea
          key={fieldName}
          id={id}
          rows={8}
          dir={lang === "ar" ? "rtl" : "ltr"}
          className="font-mono text-[13px] leading-relaxed"
          aria-invalid={error ? true : undefined}
          {...register(fieldName)}
        />
      )}
      <p className="text-xs text-muted-foreground">
        {hint ?? "Markdown: **bold**, *italic*, - lists, [links](https://…). Leave empty to hide this section."}
      </p>
    </div>
  );
}

export function MarkdownPreview({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed [&_a]:underline [&_h3]:font-semibold [&_li]:ms-5 [&_ol]:list-decimal [&_ul]:list-disc">
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
        {text}
      </ReactMarkdown>
    </div>
  );
}

function Segmented<V extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
}) {
  return (
    <div className="inline-flex rounded-md border p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded px-2 py-0.5 transition-colors",
            option.value === value ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** An ordered list of short strings ({ value }[]), e.g. features or highlights. */
export function ListField<T extends FieldValues>({
  name,
  label,
  addLabel = "Add item",
  dir,
  placeholder,
}: {
  name: ArrayPath<T>;
  label: string;
  addLabel?: string;
  dir?: "rtl" | "ltr";
  placeholder?: string;
}) {
  const { control, register } = useFormContext<T>();
  const { fields, append, remove, move } = useFieldArray({ control, name });

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <ul className="space-y-2">
        {fields.map((field, i) => (
          <li key={field.id} className="flex items-center gap-1.5">
            <Input
              dir={dir}
              aria-label={`${label} ${i + 1}`}
              placeholder={placeholder}
              {...register(`${name}.${i}.value` as Path<T>)}
            />
            <MoveButtons index={i} count={fields.length} onMove={move} label={label} />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}>
              <XIcon />
            </Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" } as never)}>
        <PlusIcon /> {addLabel}
      </Button>
    </fieldset>
  );
}

/** Keyboard-accessible alternative to dragging. */
export function MoveButtons({
  index,
  count,
  onMove,
  label,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  label: string;
}) {
  return (
    <>
      <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Move ${label.toLowerCase()} ${index + 1} up`}>
        <ArrowUpIcon />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={`Move ${label.toLowerCase()} ${index + 1} down`}>
        <ArrowDownIcon />
      </Button>
    </>
  );
}

/** A titled group of fields inside a long form. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-5 rounded-xl border bg-card p-5 md:p-6">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}
