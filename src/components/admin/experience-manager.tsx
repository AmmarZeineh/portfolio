"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { deleteExperience, reorderExperience, saveExperience } from "@/lib/admin/actions/content";
import type { AdminExperienceRow } from "@/lib/admin/queries";
import { experienceFormSchema, type ExperienceFormValues } from "@/lib/admin/schemas";
import { ConfirmDialog } from "./confirm-button";
import { BilingualField, ListField, TextField } from "./fields";
import { SortableList } from "./sortable-list";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { useAction } from "./use-action";

const EMPTY: ExperienceFormValues = {
  company: "",
  role: { en: "", ar: "" },
  location: { en: "", ar: "" },
  employment_type: { en: "", ar: "" },
  start_date: "",
  end_date: "",
  description: { en: "", ar: "" },
  highlights: { en: [], ar: [] },
  is_confidential: false,
};

export function ExperienceManager({ rows }: { rows: AdminExperienceRow[] }) {
  const { run } = useAction();
  const [editing, setEditing] = useState<{ id: string | null; form: ExperienceFormValues } | null>(null);

  return (
    <div className="space-y-4">
      <Button onClick={() => setEditing({ id: null, form: EMPTY })}>
        <PlusIcon /> Add a role
      </Button>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No roles yet.</p>
      ) : (
        <SortableList
          items={rows}
          itemLabel={(row) => row.summary}
          onCommit={(next) => run(() => reorderExperience(next.map((r) => r.id)), "Order saved")}
          renderItem={(row) => (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{row.summary}</p>
                <p className="text-xs text-muted-foreground">{row.dates}</p>
              </div>
              {row.form.is_confidential && <Badge variant="secondary">NDA</Badge>}
              <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ id: row.id, form: row.form })} aria-label={`Edit ${row.summary}`}>
                <PencilIcon />
              </Button>
              <ConfirmDialog
                title={`Delete ${row.summary}?`}
                description="It disappears from the experience timeline. This can't be undone."
                onConfirm={() => run(() => deleteExperience(row.id), "Role deleted")}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label={`Delete ${row.summary}`}>
                    <Trash2Icon />
                  </Button>
                }
              />
            </>
          )}
        />
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
          {editing && <ExperienceForm key={editing.id ?? "new"} id={editing.id} initial={editing.form} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExperienceForm({ id, initial, onDone }: { id: string | null; initial: ExperienceFormValues; onDone: () => void }) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const form = useForm<ExperienceFormValues>({ resolver: zodResolver(experienceFormSchema), defaultValues: initial });

  const onSubmit = form.handleSubmit((values) =>
    startSaving(async () => {
      const result = await saveExperience(id, values);
      if (!result.ok) {
        for (const [name, message] of Object.entries(result.fieldErrors ?? {})) {
          form.setError(name as FieldPath<ExperienceFormValues>, { message });
        }
        toast.error(result.error);
        return;
      }
      toast.success(id ? "Role saved" : "Role added");
      onDone();
      router.refresh();
    }),
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <DialogHeader>
          <DialogTitle>{id ? "Edit role" : "Add a role"}</DialogTitle>
          <DialogDescription>Shown on the home page timeline, newest first by the order you set.</DialogDescription>
        </DialogHeader>
        <TextField<ExperienceFormValues> name="company" label="Company or client" />
        <BilingualField<ExperienceFormValues> name="role" label="Role" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField<ExperienceFormValues> name="start_date" label="Start" type="date" />
          <TextField<ExperienceFormValues> name="end_date" label="End" type="date" hint="Leave empty if you're still there." />
        </div>
        <BilingualField<ExperienceFormValues> name="employment_type" label="Type" hint="For example: Full-time, Freelance." />
        <BilingualField<ExperienceFormValues> name="location" label="Location" />
        <BilingualField<ExperienceFormValues> name="description" label="Summary" multiline rows={3} />
        <ListField<ExperienceFormValues> name="highlights.en" label="Highlights (English)" addLabel="Add highlight" />
        <ListField<ExperienceFormValues> name="highlights.ar" label="Highlights (Arabic)" addLabel="Add highlight" dir="rtl" />
        <Controller
          control={form.control}
          name="is_confidential"
          render={({ field }) => (
            <label className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm">
              <span>
                <span className="block font-medium">Under NDA</span>
                <span className="block text-xs text-muted-foreground">Adds a note that product details are confidential.</span>
              </span>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </label>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : id ? "Save role" : "Add role"}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}
