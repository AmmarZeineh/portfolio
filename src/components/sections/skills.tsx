import { Marquee } from "@/components/motion/marquee";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { pick, type SkillGroup } from "@/lib/data/schemas";

/** A marquee of everything for texture, then the same skills grouped for reading. */
export function Skills({ t, locale, groups }: { t: Dictionary; locale: Locale; groups: SkillGroup[] }) {
  if (groups.length === 0) return null;
  const names = groups.flatMap((group) => group.skills.map((skill) => skill.name));

  return (
    <section id="skills" aria-labelledby="skills-title" className="section-space">
      <div className="container-page">
        <h2 id="skills-title" className="font-display text-3xl">
          {t.skills.title}
        </h2>
      </div>

      <Marquee label={t.skills.marqueeLabel} duration={60} className="mt-14 border-y border-line py-6">
        {names.map((name) => (
          <span key={name} className="flex items-center gap-8 pe-8 font-display text-2xl whitespace-nowrap">
            {name}
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          </span>
        ))}
      </Marquee>

      <div className="container-page mt-16 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-5">
        {groups.map((group) => (
          <div key={group.id}>
            <h3 className="border-b border-line pb-3 text-sm text-muted">{pick(group.name, locale)}</h3>
            <ul className="mt-4 space-y-1.5 text-lg">
              {group.skills.map((skill) => (
                <li key={skill.id}>{skill.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
