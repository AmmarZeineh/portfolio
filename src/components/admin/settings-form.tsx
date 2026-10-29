"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useFieldArray, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusIcon, XIcon } from "lucide-react";
import { saveSettings } from "@/lib/admin/actions/content";
import { settingsFormSchema, type SettingsFormValues } from "@/lib/admin/schemas";
import { BilingualField, FormSection, ListField, MoveButtons, TextField } from "./fields";
import { FileField } from "./file-field";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const form = useForm<SettingsFormValues>({ resolver: zodResolver(settingsFormSchema), defaultValues: initial, mode: "onTouched" });
  const { control, register, formState, handleSubmit, reset, setError } = form;
  const stats = useFieldArray({ control, name: "stats" });

  useEffect(() => {
    if (!formState.isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [formState.isDirty]);

  const onSubmit = handleSubmit(
    (values) =>
      startSaving(async () => {
        const result = await saveSettings(values);
        if (!result.ok) {
          for (const [name, message] of Object.entries(result.fieldErrors ?? {})) {
            setError(name as FieldPath<SettingsFormValues>, { message });
          }
          toast.error(result.error, { duration: 10_000 });
          return;
        }
        toast.success("Settings saved");
        reset(values);
        router.refresh();
      }),
    () => toast.error("Some fields need attention."),
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <FormSection title="You">
          <BilingualField<SettingsFormValues> name="role" label="Title" hint="Shown under your name in the hero, e.g. Flutter / Mobile Engineer." />
          <BilingualField<SettingsFormValues> name="location" label="Based in" />
          <BilingualField<SettingsFormValues> name="education" label="Education" />
          <div className="grid gap-6 md:grid-cols-2">
            <ListField<SettingsFormValues> name="languages.en" label="Languages (English)" addLabel="Add language" />
            <ListField<SettingsFormValues> name="languages.ar" label="Languages (Arabic)" addLabel="Add language" dir="rtl" />
          </div>
          <Controller
            control={control}
            name="photo_path"
            render={({ field }) => (
              <FileField label="Portrait" hint="Portrait orientation (4:5) works best." value={field.value} onChange={field.onChange} accept="image/*" bucket="media" folder="profile" kind="image" />
            )}
          />
          <Controller
            control={control}
            name="cv_path"
            render={({ field }) => (
              <FileField label="CV (PDF)" hint="Adds a Download CV button to the hero and About section." value={field.value} onChange={field.onChange} accept="application/pdf" bucket="cv" folder="cv" kind="file" />
            )}
          />
        </FormSection>

        <FormSection title="Hero" description="Wrap a word in *asterisks* to set it in italics.">
          <BilingualField<SettingsFormValues> name="hero_headline" label="Headline" />
          <BilingualField<SettingsFormValues> name="hero_sub" label="Supporting line" multiline rows={2} />
        </FormSection>

        <FormSection title="About" description="Leave a blank line between paragraphs. The first paragraph is shown larger.">
          <BilingualField<SettingsFormValues> name="about" label="About you" multiline rows={10} />
        </FormSection>

        <FormSection title="Contact & socials" description="Empty links are hidden on the site.">
          <TextField<SettingsFormValues> name="email" label="Email" type="email" />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField<SettingsFormValues> name="socials.github" label="GitHub" type="url" placeholder="https://github.com/…" />
            <TextField<SettingsFormValues> name="socials.linkedin" label="LinkedIn" type="url" placeholder="https://linkedin.com/in/…" />
            <TextField<SettingsFormValues> name="socials.whatsapp" label="WhatsApp" type="url" placeholder="https://wa.me/963…" />
            <TextField<SettingsFormValues> name="socials.x" label="X" type="url" placeholder="https://x.com/…" />
          </div>
        </FormSection>

        <FormSection title="Numbers" description="Up to six. They count up when scrolled into view. Use facts you can back up in an interview.">
          <ul className="space-y-3">
            {stats.fields.map((field, i) => (
              <li key={field.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start">
                <div className="flex gap-2">
                  <Input type="number" className="w-24" aria-label={`Number ${i + 1} value`} {...register(`stats.${i}.value`)} />
                  <Input className="w-16" placeholder="+" aria-label={`Number ${i + 1} suffix`} {...register(`stats.${i}.suffix`)} />
                </div>
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <Input placeholder="Label (English)" aria-label={`Number ${i + 1} label, English`} {...register(`stats.${i}.label.en`)} />
                  <Input dir="rtl" placeholder="Label (Arabic)" aria-label={`Number ${i + 1} label, Arabic`} {...register(`stats.${i}.label.ar`)} />
                </div>
                <div className="flex">
                  <MoveButtons index={i} count={stats.fields.length} onMove={stats.move} label="Number" />
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => stats.remove(i)} aria-label={`Remove number ${i + 1}`}>
                    <XIcon />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {formState.errors.stats?.message && <p className="text-xs text-destructive">{formState.errors.stats.message}</p>}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={stats.fields.length >= 6}
            onClick={() => stats.append({ value: 0, suffix: "", label: { en: "", ar: "" } })}
          >
            <PlusIcon /> Add number
          </Button>
        </FormSection>

        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t bg-background/90 px-4 py-3 backdrop-blur md:-mx-10 md:px-10">
          {formState.isDirty && <p className="me-auto text-xs text-muted-foreground">Unsaved changes</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
