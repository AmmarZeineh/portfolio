"use client";

import { useState } from "react";
import { MailIcon, MailOpenIcon, ReplyIcon, Trash2Icon } from "lucide-react";
import { deleteMessage, setMessageRead } from "@/lib/admin/actions/content";
import type { Tables } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-button";
import { Button } from "./ui/button";
import { useAction } from "./use-action";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export function MessagesInbox({ messages }: { messages: Tables<"contact_messages">[] }) {
  const { run } = useAction();
  const [open, setOpen] = useState<string | null>(null);

  if (messages.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        No messages yet. They arrive here from the contact form.
      </p>
    );
  }

  return (
    <ul className="divide-y rounded-xl border">
      {messages.map((message) => {
        const expanded = open === message.id;
        return (
          <li key={message.id} className={cn(!message.is_read && "bg-brand/5")}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => {
                setOpen(expanded ? null : message.id);
                if (!message.is_read) run(() => setMessageRead(message.id, true), "Marked as read");
              }}
              className="flex w-full items-start gap-3 px-4 py-3 text-start hover:bg-accent/50"
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", message.is_read ? "bg-transparent" : "bg-brand")} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className={cn("truncate", !message.is_read && "font-semibold")}>{message.name}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(message.created_at)}</span>
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {!message.is_read && <span className="sr-only">Unread. </span>}
                  {message.message}
                </span>
              </span>
            </button>

            {expanded && (
              <div className="space-y-4 px-4 pb-4 ps-9">
                <p className="text-sm text-muted-foreground">{message.email}</p>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <a href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your message")}`}>
                      <ReplyIcon /> Reply by email
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => run(() => setMessageRead(message.id, !message.is_read), message.is_read ? "Marked as unread" : "Marked as read")}>
                    {message.is_read ? <MailIcon /> : <MailOpenIcon />} Mark as {message.is_read ? "unread" : "read"}
                  </Button>
                  <ConfirmDialog
                    title="Delete this message?"
                    description={`From ${message.name}. This can't be undone.`}
                    onConfirm={() => run(() => deleteMessage(message.id), "Message deleted")}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Trash2Icon /> Delete
                      </Button>
                    }
                  />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
