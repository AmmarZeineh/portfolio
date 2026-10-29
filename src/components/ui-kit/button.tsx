import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "solid" | "outline";

type BaseProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonAsLink = BaseProps & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;
type ButtonAsButton = BaseProps & { href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">;

const VARIANTS: Record<Variant, { shell: string; fill: string }> = {
  solid: {
    shell: "bg-fg text-bg hover:text-accent-ink focus-visible:text-accent-ink",
    fill: "bg-accent",
  },
  outline: {
    shell: "border border-line text-fg hover:text-bg focus-visible:text-bg",
    fill: "bg-fg",
  },
};

/**
 * Pill button. On hover a fill rises from the bottom edge as a circle and the
 * label rolls up to a duplicate of itself. CSS only, so it works in server
 * components; wrap in <Magnetic> for the pointer pull.
 */
export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { children, variant = "solid", className } = props;
  const styles = VARIANTS[variant];
  const classes = `group/button relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full px-8 text-base font-medium transition-colors duration-500 ease-[var(--ease-out-expo)] disabled:pointer-events-none disabled:opacity-50 ${styles.shell} ${className ?? ""}`;

  const inner = (
    <>
      <span
        aria-hidden
        className={`absolute top-full left-1/2 aspect-square w-[160%] -translate-x-1/2 rounded-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/button:-translate-y-[60%] group-focus-visible/button:-translate-y-[60%] motion-reduce:transition-none ${styles.fill}`}
      />
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/button:-translate-y-full motion-reduce:transition-none">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/button:translate-y-0 motion-reduce:transition-none"
        >
          {children}
        </span>
      </span>
    </>
  );

  if (props.href !== undefined) {
    const { children: _c, variant: _v, className: _cn, href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {inner}
      </Link>
    );
  }

  const { children: _c, variant: _v, className: _cn, href: _h, type = "button", ...rest } = props;
  return (
    <button type={type} className={classes} {...rest}>
      {inner}
    </button>
  );
}
