"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export default function Popover({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    root.current
      ?.querySelector<HTMLElement>(
        ".control-popover-panel button, .control-popover-panel select",
      )
      ?.focus();
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div
      className="control-popover"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="icon-button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
      >
        {icon}
      </button>
      {open && (
        <div
          id={id}
          className="control-popover-panel"
          role="region"
          aria-label={label}
        >
          {children(() => {
            setOpen(false);
            trigger.current?.focus();
          })}
        </div>
      )}
    </div>
  );
}
