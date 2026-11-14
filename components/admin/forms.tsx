"use client";
import Notice from "./notice";
import { api, apiMessage, queryPath } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useDebounced } from "./ui";
import { Dropdown, DropdownCore, type DropdownOption } from "./dropdown";

/** Full-page form shell: breadcrumb, title, stacked sections, sticky save bar. */
export function FormPage({
  title,
  description,
  backHref,
  backLabel,
  submitLabel,
  onSubmit,
  children,
  aside,
  extraActions,
}: {
  title: string;
  description?: string;
  backHref: string;
  backLabel: string;
  submitLabel: string;
  /** Resolve with a path to open afterwards; throw to show an error. */
  onSubmit: () => Promise<string | void>;
  children: ReactNode;
  aside?: ReactNode;
  extraActions?: ReactNode;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const top = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const next = await onSubmit();
      router.push(next || backHref);
    } catch (e) {
      setError(apiMessage(e));
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setSaving(false);
    }
  }

  return (
    <form className="ac-formpage" onSubmit={submit} noValidate={false}>
      <div ref={top} />
      <Link href={backHref} className="ac-back">
        <ArrowLeft size={15} /> {backLabel}
      </Link>
      <header className="ac-formhead">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </header>
      <Notice message={error} onClose={() => setError("")} />
      <div className={`ac-formgrid${aside ? " has-aside" : ""}`}>
        <div className="ac-formmain">{children}</div>
        {aside && <aside className="ac-formaside">{aside}</aside>}
      </div>
      <div className="ac-formbar">
        <Link href={backHref} className="ac-btn">
          Cancel
        </Link>
        {extraActions}
        <button className="ac-btn primary" disabled={saving}>
          {saving ? (
            <Loader2 size={15} className="ac-spin" />
          ) : (
            <Check size={15} />
          )}
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="ac-formsection">
      <header>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      <div className="ac-formfields">{children}</div>
    </section>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="ac-formrow">{children}</div>;
}

export function Input({
  label,
  hint,
  required,
  ...props
}: {
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="adm-field">
      <span>
        {label}
        {required && <b aria-hidden> *</b>}
      </span>
      <input required={required} {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function TextArea({
  label,
  hint,
  required,
  ...props
}: {
  label: string;
  hint?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="adm-field">
      <span>
        {label}
        {required && <b aria-hidden> *</b>}
      </span>
      <textarea required={required} rows={5} {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Select({
  label,
  hint,
  children,
  ...props
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="adm-field">
      <span>{label}</span>
      <Dropdown {...props}>{children}</Dropdown>
      {hint && <small>{hint}</small>}
    </div>
  );
}
export function Check2({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="ac-check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

export type Option = { id: string; name: string; sub?: string | null };

/** Search-as-you-type picker backed by /admin/lookups/<kind>. */
export function EntityPicker({
  label,
  kind,
  value,
  onChange,
  required,
  hint,
  createHref,
}: {
  label: string;
  kind: "users" | "companies";
  value: Option | null;
  onChange: (value: Option | null) => void;
  required?: boolean;
  hint?: string;
  createHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const q = useDebounced(search, 250);

  useEffect(() => {
    if (!open) return;
    let live = true;
    setLoading(true);
    api<{ id: string; name: string; email?: string; industry?: string }[]>(
      queryPath(`/admin/lookups/${kind}`, { search: q }),
    ).then(
      (rows) => {
        if (!live) return;
        setItems(
          rows.map((r) => ({
            value: r.id,
            label: r.name,
            sub: r.email ?? r.industry,
          })),
        );
        setLoading(false);
      },
      () => live && setLoading(false),
    );
    return () => {
      live = false;
    };
  }, [open, q, kind]);

  const noun = kind === "users" ? "user" : "company";
  return (
    <div className="adm-field">
      <span>
        {label}
        {required && <b aria-hidden> *</b>}
      </span>
      <DropdownCore
        selected={
          value ? { value: value.id, label: value.name, sub: value.sub } : null
        }
        onPick={(o) =>
          onChange(o ? { id: o.value, name: o.label, sub: o.sub } : null)
        }
        options={items}
        loading={loading}
        searchable
        onSearch={setSearch}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setSearch("");
        }}
        placeholder={`Select a ${noun}…`}
        ariaLabel={label}
        required={required}
        clearable
        footer={
          createHref && (
            <Link href={createHref} className="ac-dd-create">
              + Create new {noun}
            </Link>
          )
        }
      />
      {hint && <small>{hint}</small>}
    </div>
  );
}
