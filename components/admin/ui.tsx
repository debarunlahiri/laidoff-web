"use client";
import { type ReactNode } from "react";

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="adm-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export const when = (value: string | null) =>
  value
    ? new Date(
        /[zZ]$/.test(value) ? value : `${value.replace(" ", "T")}Z`,
      ).toLocaleString()
    : "—";

// ---------- Console building blocks ----------
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="ac-pagehead">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="ac-pagehead-actions">{actions}</div>}
    </div>
  );
}
export function Panel({
  title,
  description,
  actions,
  children,
  flush,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className="ac-panel">
      {(title || actions) && (
        <header>
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={flush ? "ac-panel-flush" : "ac-panel-body"}>
        {children}
      </div>
    </section>
  );
}
const toneOf: Record<string, string> = {
  active: "good",
  sent: "good",
  verified: "good",
  resolved: "good",
  succeeded: "good",
  open: "warn",
  pending: "warn",
  warning: "warn",
  reviewing: "warn",
  user_reported: "warn",
  skipped: "warn",
  rejected: "warn",
  suspended: "bad",
  failed: "bad",
  deactivated: "bad",
  fatal: "bad",
  error: "bad",
  dismissed: "muted",
};
export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span className={`ac-badge ${toneOf[value] ?? "muted"}`}>
      {label ?? value.replace(/_/g, " ")}
    </span>
  );
}
export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="ac-empty">
      <strong>{title}</strong>
      {hint && <span>{hint}</span>}
    </div>
  );
}
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="ac-segmented" role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={option.value === value}
          className={option.value === value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count ? <em>{option.count}</em> : null}
        </button>
      ))}
    </div>
  );
}
export function Drawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="ac-drawer-backdrop" onClick={onClose}>
      <aside
        className="ac-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="ac-drawer-body">{children}</div>
      </aside>
    </div>
  );
}
export function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
export const ago = (value: string | null) => {
  if (!value) return "Never";
  const iso = /[zZ]$/.test(value) ? value : `${value.replace(" ", "T")}Z`;
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units: [number, string][] = [
    [60, "m"],
    [3600, "h"],
    [86400, "d"],
  ];
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 30) return `${Math.floor(seconds / 86400)}d ago`;
  void units;
  return new Date(iso).toLocaleDateString();
};
