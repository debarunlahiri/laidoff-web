"use client";
import { api, apiMessage } from "@/lib/api";
import { useConfirm } from "@/providers/confirm-provider";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { Badge, Empty, PageHeader } from "./ui";
import { Check2, FormPage, Input, Row, Section, TextArea } from "./forms";
import { REPORT_ICONS, reportIcon } from "@/lib/report-icons";

type Sub = { id?: string; key: string; label: string; active: boolean };
type Option = { id: string; key: string; label: string; description: string; icon: string; active: boolean; postReports: number; subcategories: Sub[] };

const slug = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export function ReportOptionsPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<Option[] | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(
    () => api<Option[]>("/admin/report-options").then((r) => (setItems(r), setError("")), (e) => setError(apiMessage(e))),
    [],
  );
  useEffect(() => { void load(); }, [load]);

  async function move(index: number, dir: -1 | 1) {
    if (!items) return;
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    try { await api("/admin/report-options/reorder", { method: "POST", body: { ids: next.map((i) => i.id) } }); }
    catch (e) { setError(apiMessage(e)); void load(); }
  }
  async function remove(o: Option) {
    if (!(await confirm({
      title: `Delete “${o.label}”?`,
      message: "Its sub-options are removed too. Reports already filed keep their stored reason.",
      confirmLabel: "Delete option", tone: "danger",
    }))) return;
    try { await api(`/admin/report-options/${o.id}`, { method: "DELETE" }); void load(); }
    catch (e) { setError(apiMessage(e)); }
  }

  return (
    <>
      <PageHeader
        title="Report options"
        description="The reasons members can choose when reporting a post or comment, each with an optional list of sub-options."
        actions={<Link href="/admin/report-options/new" className="ac-btn primary"><Plus size={15} /> New option</Link>}
      />
      {error && <p className="adm-error">{error}</p>}
      {items && !items.length && <Empty title="No report options" hint="Members can't report anything until one exists." />}
      <div className="ac-optioncards">
        {items?.map((o, i) => (
          <article key={o.id} className={`ac-optioncard${o.active ? "" : " off"}`}>
            <header>
              <span className="ac-optionicon">{(() => { const I = reportIcon(o.icon); return <I size={20} />; })()}</span>
              <div>
                <h2>{o.label} {!o.active && <Badge value="muted" label="Hidden" />}</h2>
                <p>{o.description || <em>No description</em>} · <code>{o.key}</code> · {o.postReports} report{o.postReports === 1 ? "" : "s"} filed</p>
              </div>
              <div className="ac-optionactions">
                <button className="ac-btn sm" aria-label="Move up" disabled={i === 0} onClick={() => void move(i, -1)}><ArrowUp size={13} /></button>
                <button className="ac-btn sm" aria-label="Move down" disabled={i === items.length - 1} onClick={() => void move(i, 1)}><ArrowDown size={13} /></button>
                <Link href={`/admin/report-options/${o.id}`} className="ac-btn sm"><Pencil size={13} /> Edit</Link>
                {o.key !== "other" && <button className="ac-btn danger sm" aria-label="Delete" onClick={() => void remove(o)}><Trash2 size={13} /></button>}
              </div>
            </header>
            {o.subcategories.length > 0 ? (
              <ul className="ac-subchips">
                {o.subcategories.map((s) => <li key={s.id} className={s.active ? "" : "off"}>{s.label}</li>)}
              </ul>
            ) : (
              <p className="ac-muted">No sub-options. Members pick this reason directly.</p>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

export function ReportOptionForm() {
  const params = useParams<{ id?: string }>();
  const id = params?.id && params.id !== "new" ? params.id : undefined;
  const [f, setF] = useState({ key: "", label: "", description: "", icon: "", active: true });
  const [subs, setSubs] = useState<Sub[]>([]);
  const [keyTouched, setKeyTouched] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(!id);

  useEffect(() => {
    if (!id) return;
    api<Option>(`/admin/report-options/${id}`).then(
      (o) => { setF({ key: o.key, label: o.label, description: o.description, icon: o.icon, active: o.active }); setSubs(o.subcategories); setKeyTouched(true); setReady(true); },
      (e) => setError(apiMessage(e)),
    );
  }, [id]);

  const setSub = (i: number, patch: Partial<Sub>) => setSubs((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const swap = (i: number, d: -1 | 1) => setSubs((s) => { const n = [...s]; const j = i + d; if (j < 0 || j >= n.length) return s; [n[i], n[j]] = [n[j], n[i]]; return n; });

  if (error && !ready) return <p className="adm-error">{error}</p>;
  if (!ready) return <p className="ac-muted">Loading…</p>;
  return (
    <FormPage
      title={id ? "Edit report option" : "New report option"}
      description="What members see when they choose to report something."
      backHref="/admin/report-options" backLabel="All report options" submitLabel={id ? "Save changes" : "Create option"}
      onSubmit={async () => {
        const body = { ...f, subcategories: subs.map((s) => ({ ...(s.id ? { id: s.id } : {}), key: s.key || slug(s.label), label: s.label, active: s.active })) };
        await api(id ? `/admin/report-options/${id}` : "/admin/report-options", { method: id ? "PUT" : "POST", body });
      }}
      aside={
        <div className="ac-preview">
          <h3>Member preview</h3>
          <div className="ac-preview-card">
            <strong className="ac-previewhead">{(() => { const I = reportIcon(f.icon); return <I size={15} />; })()} {f.label || "Reason"}</strong>
            {subs.filter((s) => s.active).length > 0 && (
              <ul>{subs.filter((s) => s.active).map((s, i) => <li key={i}>{s.label || "Sub-option"}</li>)}</ul>
            )}
          </div>
          <p className="ac-muted">If sub-options exist, members must pick one.</p>
        </div>
      }
    >
      <Section title="Reason">
        <Row>
          <Input label="Label" required maxLength={120} value={f.label}
            onChange={(e) => setF((s) => ({ ...s, label: e.target.value, key: keyTouched ? s.key : slug(e.target.value) }))} />
          <Input label="Key" required maxLength={40} pattern="[a-z0-9_-]+" disabled={!!id} value={f.key}
            hint={id ? "Keys can't change once created." : "Stored with each report. Lowercase letters, numbers, - and _."}
            onChange={(e) => { setKeyTouched(true); setF((s) => ({ ...s, key: e.target.value.toLowerCase() })); }} />
        </Row>
        <TextArea label="Description" rows={2} maxLength={300} value={f.description} onChange={(e) => setF((s) => ({ ...s, description: e.target.value }))} />
        <div className="adm-field">
          <span>Icon</span>
          <div className="ac-icons">
            {Object.entries(REPORT_ICONS).map(([name, I]) => (
              <button type="button" key={name} title={name} aria-label={name} aria-pressed={f.icon === name}
                className={f.icon === name ? "on" : ""} onClick={() => setF((s) => ({ ...s, icon: f.icon === name ? "" : name }))}>
                <I size={18} />
              </button>
            ))}
          </div>
        </div>
        <Check2 label="Visible to members" hint="Hidden options stay in the list for admins but can't be chosen." checked={f.active} onChange={(v) => setF((s) => ({ ...s, active: v }))} />
      </Section>
      <Section title="Sub-options" description="Optional. Narrow the reason down, e.g. “Harassment” → “Threats”, “Hate speech”.">
        {subs.map((s, i) => (
          <div key={s.id ?? i} className="ac-subrow">
            <input className="ac-plain" placeholder="Sub-option label" required maxLength={160} value={s.label}
              onChange={(e) => setSub(i, { label: e.target.value, key: s.id ? s.key : slug(e.target.value) })} />
            <label className="ac-check inline"><input type="checkbox" checked={s.active} onChange={(e) => setSub(i, { active: e.target.checked })} /> Visible</label>
            <button type="button" className="ac-btn sm" aria-label="Move up" disabled={i === 0} onClick={() => swap(i, -1)}><ArrowUp size={13} /></button>
            <button type="button" className="ac-btn sm" aria-label="Move down" disabled={i === subs.length - 1} onClick={() => swap(i, 1)}><ArrowDown size={13} /></button>
            <button type="button" className="ac-btn danger sm" aria-label="Remove" onClick={() => setSubs((x) => x.filter((_, j) => j !== i))}><X size={13} /></button>
          </div>
        ))}
        <div><button type="button" className="ac-btn sm" onClick={() => setSubs((s) => [...s, { key: "", label: "", active: true }])}><Plus size={13} /> Add sub-option</button></div>
      </Section>
    </FormPage>
  );
}
