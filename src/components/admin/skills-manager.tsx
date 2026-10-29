"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { deleteSkillGroup, reorderSkillGroups, saveSkillGroup } from "@/lib/admin/actions/content";
import type { AdminSkillGroupRow } from "@/lib/admin/queries";
import { skillGroupFormSchema, type SkillGroupFormValues } from "@/lib/admin/schemas";
import { ConfirmDialog } from "./confirm-button";
import { BilingualField, ListField } from "./fields";
import { SortableList } from "./sortable-list";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useAction } from "./use-action";

const EMPTY: SkillGroupFormValues = { name: { en: "", ar: "" }, skills: [] };

export function SkillsManager({ groups }: { groups: AdminSkillGroupRow[] }) {
  const { run } = useAction();
  const [editing, setEditing] = useState<{ id: string | null; form: SkillGroupFormValues } | null>(null);

  return (
    <div className="space-y-4">
      <Button onClick={() => setEditing({ id: null, form: EMPTY })}>
        <PlusIcon /> Add a group
      </Button>

      <SortableList
        items={groups}
        itemLabel={(group) => group.form.name.en}
        onCommit={(next) => run(() => reorderSkillGroups(next.map((g) => g.id)), "Order saved")}
        renderItem={(group) => (
          <>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{group.form.name.en}</p>
              <p className="truncate text-xs text-muted-foreground">
                {group.form.skills?.map((s) => s.value).join(", ") || "No skills yet"}
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ id: group.id, form: group.form })} aria-label={`Edit ${group.form.name.en}`}>
              <PencilIcon />
            </Button>
            <ConfirmDialog
              title={`Delete ${group.form.name.en}?`}
              description="The group and all its skills are removed from the site."
              onConfirm={() => run(() => deleteSkillGroup(group.id), "Group deleted")}
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label={`Delete ${group.form.name.en}`}>
                  <Trash2Icon />
                </Button>
              }
            />
          </>
        )}
      />

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
          {editing && <SkillGroupForm key={editing.id ?? "new"} id={editing.id} initial={editing.form} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SkillGroupForm({ id, initial, onDone }: { id: string | null; initial: SkillGroupFormValues; onDone: () => void }) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const form = useForm<SkillGroupFormValues>({ resolver: zodResolver(skillGroupFormSchema), defaultValues: initial });

  const onSubmit = form.handleSubmit((values) =>
    startSaving(async () => {
      const result = await saveSkillGroup(id, values);
      if (!result.ok) {
        for (const [name, message] of Object.entries(result.fieldErrors ?? {})) {
          form.setError(name as FieldPath<SkillGroupFormValues>, { message });
        }
        toast.error(result.error);
        return;
      }
      toast.success(id ? "Group saved" : "Group added");
      onDone();
      router.refresh();
    }),
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <DialogHeader>
          <DialogTitle>{id ? "Edit skill group" : "Add a skill group"}</DialogTitle>
          <DialogDescription>Skill names are the same in both languages (Flutter is Flutter).</DialogDescription>
        </DialogHeader>
        <BilingualField<SkillGroupFormValues> name="name" label="Group name" />
        <ListField<SkillGroupFormValues> name="skills" label="Skills" addLabel="Add skill" />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save group"}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}
