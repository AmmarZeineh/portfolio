"use client";

import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
};

/** Current time in a given zone, rendered only on the client (it would never match the server). */
export function LocalTime({
  timeZone,
  locale,
  template,
}: {
  timeZone: string;
  locale: string;
  /** Text around the time, with {time} as the placeholder. */
  template: string;
}) {
  const time = useSyncExternalStore(
    subscribe,
    () =>
      new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone }).format(
        new Date(),
      ),
    () => "",
  );

  if (!time) return <span aria-hidden className="invisible">{template.replace("{time}", "00:00")}</span>;
  return <span>{template.replace("{time}", time)}</span>;
}
