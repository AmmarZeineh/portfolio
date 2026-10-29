import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  p: ({ children }) => <p className="max-w-[62ch]">{children}</p>,
  ul: ({ children }) => <ul className="max-w-[62ch] space-y-2">{children}</ul>,
  ol: ({ children }) => <ol className="max-w-[62ch] list-decimal space-y-2 ps-5">{children}</ol>,
  li: ({ children }) => <li className="relative ps-5 [ol_&]:ps-0">{children}</li>,
  h3: ({ children }) => <h3 className="pt-4 font-display text-xl">{children}</h3>,
  h4: ({ children }) => <h4 className="pt-2 font-medium">{children}</h4>,
  a: ({ href, children }) => (
    <a href={href} className="underline decoration-line underline-offset-4 hover:decoration-current" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
  code: ({ children }) => <code className="rounded bg-raised px-1.5 py-0.5 text-[0.9em]">{children}</code>,
  blockquote: ({ children }) => (
    <blockquote className="max-w-[56ch] border-s border-accent ps-5 font-display text-xl text-fg">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm [&_td]:border-b [&_td]:border-line [&_td]:py-2 [&_td]:pe-4 [&_th]:border-b [&_th]:border-line [&_th]:py-2 [&_th]:pe-4 [&_th]:text-start [&_th]:font-medium">
        {children}
      </table>
    </div>
  ),
  // Images belong in the gallery, and raw HTML is never rendered.
  img: () => null,
};

/**
 * Renders case-study Markdown written in the admin. Headings start at h3
 * because each block sits under a section h2. Raw HTML is ignored (the
 * react-markdown default), so stored text can't inject markup.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div dir="auto" className={`space-y-5 text-lg text-muted [&_ul>li]:before:absolute [&_ul>li]:before:start-0 [&_ul>li]:before:top-[0.8em] [&_ul>li]:before:h-px [&_ul>li]:before:w-2.5 [&_ul>li]:before:bg-current ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml
      >
        {/* Shift any h1/h2 written in the editor down to h3. */}
        {children.replace(/^#{1,2}(?!#)\s/gm, "### ")}
      </ReactMarkdown>
    </div>
  );
}
