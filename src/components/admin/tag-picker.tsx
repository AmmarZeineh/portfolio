"use client";

import { useId, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { PlusIcon, XIcon } from "lucide-react";
import { createTag } from "@/lib/admin/actions/projects";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Tag = { id: string; name: string; slug: string };

/**
 * Selected tags as removable chips (in display order), a search box that
 * suggests existing tags, and "Create" for a new one.
 */
export function TagPicker({
  allTags,
  value,
  onChange,
}: {
  allTags: Tag[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [tags, setTags] = useState(allTags);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const listId = useId();

  const byId = useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);
  const q = query.trim().toLowerCase();
  const suggestions = tags.filter((tag) => !value.includes(tag.id) && (!q || tag.name.toLowerCase().includes(q))).slice(0, 12);
  const exact = tags.some((tag) => tag.name.toLowerCase() === q);

  const add = (id: string) => {
    onChange([...value, id]);
    setQuery("");
  };

  const create = () =>
    startTransition(async () => {
      const result = await createTag(query);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setTags((current) => (current.some((t) => t.id === result.data.id) ? current : [...current, result.data]));
      if (!value.includes(result.data.id)) add(result.data.id);
      else setQuery("");
    });

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-1.5" aria-label="Selected tags">
        {value.length === 0 && <li className="text-sm text-muted-foreground">No tags yet.</li>}
        {value.map((id) => (
          <li key={id}>
            <Badge variant="secondary" className="gap-1 py-1 ps-2.5 pe-1">
              {byId.get(id)?.name ?? "Unknown"}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== id))}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                aria-label={`Remove ${byId.get(id)?.name ?? "tag"}`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            const match = suggestions.find((tag) => tag.name.toLowerCase() === q) ?? (suggestions.length === 1 ? suggestions[0] : undefined);
            if (match) add(match.id);
            else if (q && !exact) create();
          }}
          placeholder="Search or create a tag"
          aria-label="Search or create a tag"
          aria-controls={listId}
        />
        {q && !exact && (
          <Button type="button" variant="outline" onClick={create} disabled={pending}>
            <PlusIcon /> Create “{query.trim()}”
          </Button>
        )}
      </div>

      <ul id={listId} className="flex flex-wrap gap-1.5" aria-label="Available tags">
        {suggestions.map((tag) => (
          <li key={tag.id}>
            <button
              type="button"
              onClick={() => add(tag.id)}
              className="rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent"
            >
              + {tag.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
