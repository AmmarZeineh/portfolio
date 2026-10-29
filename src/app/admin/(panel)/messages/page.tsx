import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/admin-shell";
import { MessagesInbox } from "@/components/admin/messages-inbox";
import { requireAdmin } from "@/lib/admin/auth";
import { listMessages } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const { supabase } = await requireAdmin();
  const messages = await listMessages(supabase);
  return (
    <>
      <PageHeader title="Messages" description="Sent from the contact form. Opening a message marks it as read." />
      <MessagesInbox messages={messages} />
    </>
  );
}
