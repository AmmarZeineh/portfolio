"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/admin/result";

/** Runs a server action, toasts the outcome and refreshes the page's server data. */
export function useAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = <T,>(action: () => Promise<ActionResult<T>>, success: string, onOk?: (data: T) => void) =>
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(success);
      onOk?.(result.data);
      router.refresh();
    });

  return { run, pending };
}
