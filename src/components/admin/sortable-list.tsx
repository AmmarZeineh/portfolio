"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Reorder, useDragControls } from "motion/react";
import { GripVerticalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoveButtons } from "./fields";

type SortableListProps<T extends { id: string }> = {
  items: T[];
  /** Called once a drag ends (or after an up/down move) with the new order. */
  onCommit: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  itemLabel: (item: T) => string;
  disabled?: boolean;
  className?: string;
};

/**
 * Drag to reorder by the grip handle (Motion's Reorder), with up/down buttons
 * for keyboard and screen-reader users. Local order updates instantly while
 * dragging; onCommit fires only when the drop settles.
 */
export function SortableList<T extends { id: string }>({
  items,
  onCommit,
  renderItem,
  itemLabel,
  disabled = false,
  className,
}: SortableListProps<T>) {
  const [order, setOrder] = useState(items);

  // Server data changed (save, delete, refresh): take it as the new truth.
  const [source, setSource] = useState(items);
  if (source !== items) {
    setSource(items);
    setOrder(items);
  }

  const commitIfChanged = () => {
    if (order.some((item, i) => item.id !== items[i]?.id)) onCommit(order);
  };

  const move = (from: number, to: number) => {
    const next = [...order];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    setOrder(next);
    onCommit(next);
  };

  return (
    <Reorder.Group as="ul" axis="y" values={order} onReorder={setOrder} className={cn("space-y-2", className)}>
      {order.map((item, i) => (
        <SortableRow key={item.id} item={item} disabled={disabled} onDragEnd={commitIfChanged}>
          {renderItem(item, i)}
          {!disabled && <MoveButtons index={i} count={order.length} onMove={move} label={itemLabel(item)} />}
        </SortableRow>
      ))}
    </Reorder.Group>
  );
}

function SortableRow<T>({
  item,
  disabled,
  onDragEnd,
  children,
}: {
  item: T;
  disabled: boolean;
  onDragEnd: () => void;
  children: ReactNode;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.userSelect = "";
    };
  }, [dragging]);

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => {
        setDragging(false);
        onDragEnd();
      }}
      className={cn(
        "relative flex items-center gap-2 rounded-lg border bg-card px-2 py-2",
        dragging && "z-10 shadow-lg",
      )}
    >
      {!disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onPointerDown={(event) => controls.start(event)}
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-accent active:cursor-grabbing"
        >
          <GripVerticalIcon className="size-4" />
        </button>
      )}
      {children}
    </Reorder.Item>
  );
}
