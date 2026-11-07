"use client";
import { api, apiMessage } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check2, FormPage, Input, Row, Section, TextArea } from "./forms";
import { EMOJI_SUGGESTIONS, TAG_ICONS, tagIcon } from "./tag-icons";

type Entry = { tag: string; displayName: string; emoji: string; iconName: string; accentColor: string; description: string; featured: boolean };
const blank: Entry = { tag: "", displayName: "", emoji: "", iconName: "", accentColor: "", description: "", featured: false };
const COLORS = ["#2f5bd8", "#0e8f6c", "#d64545", "#d9822b", "#7a4fd1", "#c2437a", "#334155"];

export function HashtagForm() {
  const params = useParams<{ tag?: string }>();
  const existing = params?.tag ? decodeURIComponent(params.tag) : undefined;
  const [f, setF] = useState<Entry>({ ...blank, tag: existing ?? "" });
  const [isNew, setIsNew] = useState(!existing);
  const [ready, setReady] = useState(!existing);
  const [error, setError] = useState("");
  const set = <K extends keyof Entry>(k: K, v: Entry[K]) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!existing) return;
    api<Entry>(`/admin/hashtag-catalog/${encodeURIComponent(existing)}`).then(
      (r) => { setF(r); setIsNew(false); setReady(true); },
      // Not in the catalog yet: this form creates its entry.
      () => { setIsNew(true); setReady(true); },
    );
  }, [existing]);

  if (error) return <p className="adm-error">{error}</p>;
  if (!ready) return <p className="ac-muted">Loading…</p>;
  const Icon = tagIcon(f.iconName);
  const tag = f.tag.replace(/^#/, "");
  const accent = f.accentColor || undefined;
  return (
    <FormPage
      title={existing ? `Edit #${existing}` : "New hashtag"}
      description="Give a hashtag an emoji or icon, a colour and a description. Usage counts still come from posts."
      backHref="/admin/hashtags" backLabel="All hashtags" submitLabel={isNew ? "Add hashtag" : "Save changes"}
      onSubmit={async () => {
        try {
          const body = { ...f, tag };
          await api(isNew ? "/admin/hashtag-catalog" : `/admin/hashtag-catalog/${encodeURIComponent(tag)}`, { method: isNew ? "POST" : "PUT", body });
        } catch (e) { setError(""); throw e; }
      }}
      aside={
        <div className="ac-preview">
          <h3>Preview</h3>
          <div className="ac-tagpreview" style={{ ["--tag" as string]: accent }}>
            <span className="ac-tagpreview-icon">{f.emoji ? f.emoji : <Icon size={18} />}</span>
            <div>
              <strong>#{tag || "hashtag"}</strong>
              <small>{f.displayName || "Display name"}</small>
            </div>
          </div>
          {f.description && <p className="ac-muted">{f.description}</p>}
        </div>
      }
    >
      <Section title="Hashtag">
        <Row>
          <Input label="Tag" required disabled={!!existing} maxLength={51} pattern="#?[A-Za-z][A-Za-z0-9_]{1,49}" value={f.tag} placeholder="techlayoffs"
            hint="Letters, numbers and _. Lowercased automatically." onChange={(e) => set("tag", e.target.value)} />
          <Input label="Display name" maxLength={80} value={f.displayName} placeholder="Tech layoffs" onChange={(e) => set("displayName", e.target.value)} />
        </Row>
        <TextArea label="Description" rows={3} maxLength={300} value={f.description} onChange={(e) => set("description", e.target.value)} />
        <Check2 label="Featured" hint="Pinned to the top of the catalog." checked={f.featured} onChange={(v) => set("featured", v)} />
      </Section>
      <Section title="Emoji" description="Shown instead of the icon when set. Type or paste any emoji.">
        <div className="ac-emojis">
          <input className="ac-plain ac-emoji-input" maxLength={8} placeholder="🔥" value={f.emoji} onChange={(e) => set("emoji", e.target.value)} />
          {EMOJI_SUGGESTIONS.map((em) => (
            <button type="button" key={em} className={f.emoji === em ? "on" : ""} onClick={() => set("emoji", f.emoji === em ? "" : em)}>{em}</button>
          ))}
        </div>
      </Section>
      <Section title="Icon" description="Used when no emoji is set.">
        <div className="ac-icons">
          {Object.entries(TAG_ICONS).map(([name, I]) => (
            <button type="button" key={name} title={name} aria-label={name} className={f.iconName === name ? "on" : ""} onClick={() => set("iconName", f.iconName === name ? "" : name)}>
              <I size={18} />
            </button>
          ))}
        </div>
      </Section>
      <Section title="Accent colour">
        <div className="ac-swatches">
          {COLORS.map((c) => (
            <button type="button" key={c} aria-label={c} className={f.accentColor === c ? "on" : ""} style={{ background: c }} onClick={() => set("accentColor", f.accentColor === c ? "" : c)} />
          ))}
          <input type="color" aria-label="Custom colour" value={f.accentColor || "#2f5bd8"} onChange={(e) => set("accentColor", e.target.value)} />
          {f.accentColor && <button type="button" className="ac-btn sm" onClick={() => set("accentColor", "")}>Clear</button>}
        </div>
      </Section>
    </FormPage>
  );
}
