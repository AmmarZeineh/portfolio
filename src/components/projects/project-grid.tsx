"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/motion/tier";
import { ProjectCard, type ProjectCardData } from "./project-card";

type FilterOption = { value: string; label: string };

type ProjectGridProps = {
  projects: ProjectCardData[];
  categories: FilterOption[];
  tags: FilterOption[];
  labels: {
    filters: string;
    type: string;
    technology: string;
    all: string;
    count: string;
    countOne: string;
    empty: string;
    clear: string;
    cursor: string;
  };
};

/**
 * Category and technology filters over a two-column grid. Cards that stay
 * glide to their new places (layout animation); the rest fade out.
 */
export function ProjectGrid({ projects, categories, tags, labels }: ProjectGridProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      projects.filter(
        (p) => (!category || p.category === category) && (!tag || p.tags.some((t) => t.slug === tag)),
      ),
    [projects, category, tag],
  );

  const countLabel =
    visible.length === 1 ? labels.countOne : labels.count.replace("{count}", String(visible.length));
  const clear = () => {
    setCategory(null);
    setTag(null);
  };

  return (
    <div>
      <div role="group" aria-label={labels.filters} className="space-y-5 border-y border-line py-6">
        <FilterRow label={labels.type} allLabel={labels.all} options={categories} value={category} onChange={setCategory} />
        <FilterRow label={labels.technology} allLabel={labels.all} options={tags} value={tag} onChange={setTag} />
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-muted">
        {countLabel}
      </p>

      <motion.ul layout className="mt-10 grid gap-x-[5vw] gap-y-16 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project, i) => (
            <motion.li
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
              // Offset the second column for a staggered, editorial rhythm.
              className="md:even:mt-28"
            >
              <ProjectCard project={project} cursorLabel={labels.cursor} eager={i < 2} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && (
        <div className="py-24 text-center">
          <p className="font-display text-2xl">{labels.empty}</p>
          <button type="button" onClick={clear} className="link-underline mt-6 text-sm">
            {labels.clear}
          </button>
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  allLabel: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  if (options.length === 0) return null;
  const chips: { value: string | null; label: string }[] = [{ value: null, label: allLabel }, ...options];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-6">
      <p className="w-28 shrink-0 text-sm text-muted">{label}</p>
      <ul className="flex flex-wrap gap-2" aria-label={label}>
        {chips.map((chip) => {
          const active = chip.value === value;
          return (
            <li key={chip.value ?? "all"}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onChange(active ? null : chip.value)}
                className={`relative isolate rounded-full border px-4 py-1.5 text-sm transition-colors duration-300 ${
                  active ? "border-fg text-bg" : "border-line hover:border-fg/50"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={`chip-${label}`}
                    aria-hidden
                    className="absolute inset-0 -z-10 rounded-full bg-fg"
                    transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                  />
                )}
                {chip.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
