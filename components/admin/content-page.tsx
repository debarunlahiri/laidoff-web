"use client";
import { Dropdown } from "./dropdown";
import { api, apiMessage, mediaUrl, queryPath } from "@/lib/api";
import { useConfirm } from "@/providers/confirm-provider";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Plus,
  BookOpen,
  Check,
  Copy,
  MoreHorizontal,
  ShieldOff,
  ShieldCheck,
  LogOut,
  X,
  ExternalLink,
  Eye,
  Flag,
  Hash,
  Heart,
  ImageIcon,
  MessageSquare,
  Search,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
} from "lucide-react";
import {
  Badge,
  Drawer,
  Empty,
  PageHeader,
  Panel,
  Segmented,
  ago,
  useDebounced,
  when,
} from "./ui";
import { InfiniteFooter, useInfiniteList } from "./use-infinite-list";

type Post = {
  id: string;
  excerpt: string;
  topic: string;
  company: string | null;
  isAnonymous: boolean;
  hasReferral: boolean;
  hasPoll: boolean;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  comments: number;
  likes: number;
  dislikes: number;
  reposts: number;
  shares: number;
  reports: number;
  images: string[];
};

type Detail = {
  id: string;
  text: string;
  topic: string;
  updatedAt: string;
  authorId: string;
  authorStatus: string;
  authorIsAdmin: boolean;
  reports: { id: string; category: string; reason: string; status: string; resolutionSummary: string | null; createdAt: string; reporterName: string }[];
  comments: { id: string; text: string; parentId: string | null; createdAt: string; authorName: string }[];
};
const TOPICS = ["Personal experience", "Offering referrals", "Career advice", "Layoff updates", "Hiring", "General discussion"];
const LIMIT = 20;

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

function RowMenu({ items }: { items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div className="ac-rowmenu" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button className="ac-btn sm" aria-label="Post actions" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div className="ac-rowmenu-list" role="menu">
          {items.map((item) => (
            <button key={item.label} role="menuitem" className={item.danger ? "danger" : ""} onClick={() => { setOpen(false); item.onClick(); }}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function stripMd(text: string) {
  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[>-]\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

export default function ContentPage() {
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "reported" | "referral" | "poll" | "anonymous">("all");
  const [topicFilter, setTopicFilter] = useState("");
  const [preview, setPreview] = useState<Post | null>(null);
  const q = useDebounced(search);

  const reported = filter === "reported" ? "yes" : "all";
  const extraParams: Record<string, string> = {};
  if (filter === "referral") extraParams.referral = "yes";
  if (filter === "poll") extraParams.poll = "yes";
  if (filter === "anonymous") extraParams.anonymous = "yes";
  if (topicFilter.trim()) extraParams.topic = topicFilter.trim();

  const feed = useInfiniteList<Post>("/admin/posts", { search: q, reported, ...extraParams }, LIMIT);
  const { data, setData, error: message, setError: setMessage, reload: load } = feed;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);
  const flash = (text: string) => { setNotice(text); setTimeout(() => setNotice(""), 2800); };

  // Selection and detail belong to the current result set.
  const queryKey = JSON.stringify([q, filter, topicFilter]);
  useEffect(() => { setSelected(new Set()); }, [queryKey]);

  useEffect(() => {
    setDetail(null);
    if (!preview) return;
    let live = true;
    api<Detail>(`/admin/posts/${preview.id}`).then(
      (r) => live && setDetail(r),
      (e) => live && setMessage(apiMessage(e)),
    );
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview?.id]);

  async function act(fn: () => Promise<unknown>, done?: string) {
    setBusy(true);
    try { await fn(); if (done) flash(done); } catch (e) { setMessage(apiMessage(e)); } finally { setBusy(false); }
  }
  const patchRow = (id: string, patch: Partial<Post>) =>
    setData((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const dropRows = (ids: string[]) =>
    setData((d) => ({ total: Math.max(0, d.total - ids.length), items: d.items.filter((i) => !ids.includes(i.id)) }));

  async function remove(post: Post, suspendAuthor = false) {
    const name = post.isAnonymous ? "Anonymous" : post.authorName;
    if (!(await confirm({
      title: suspendAuthor ? "Delete post and suspend author?" : "Delete this post?",
      message: suspendAuthor
        ? `This permanently removes the post by ${name} and suspends their account.`
        : `This permanently removes the post by ${name}, along with its comments and reactions.`,
      confirmLabel: suspendAuthor ? "Delete & suspend" : "Delete post",
      tone: "danger",
    }))) return;
    await act(async () => {
      await api(`/admin/posts/${post.id}`, { method: "DELETE" });
      if (suspendAuthor) await api(`/admin/users/${post.authorId}`, { method: "PATCH", body: { accountStatus: "suspended" } });
      setPreview(null);
      dropRows([post.id]);
      setSelected((s) => { const n = new Set(s); n.delete(post.id); return n; });
    }, suspendAuthor ? "Post deleted, author suspended" : "Post deleted");
  }

  async function removeSelected() {
    const ids = [...selected];
    if (!(await confirm({
      title: `Delete ${ids.length} post${ids.length > 1 ? "s" : ""}?`,
      message: "They will be permanently removed along with their comments and reactions.",
      confirmLabel: "Delete posts",
      tone: "danger",
    }))) return;
    await act(async () => {
      await api("/admin/posts/bulk-delete", { method: "POST", body: { ids } });
      dropRows(ids);
      setSelected(new Set());
    }, `${ids.length} post${ids.length > 1 ? "s" : ""} deleted`);
  }

  const toggle = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = data.items.length > 0 && data.items.every((i) => selected.has(i.id));

  const changeTopic = (topic: string) => act(async () => {
    if (!preview) return;
    await api(`/admin/posts/${preview.id}`, { method: "PATCH", body: { topic } });
    setDetail((d) => d && { ...d, topic });
    patchRow(preview.id, { topic });
    setPreview((p) => p && { ...p, topic });
  }, "Topic updated");

  const resolveReports = (status: "resolved" | "dismissed") => act(async () => {
    if (!preview) return;
    await api(`/admin/posts/${preview.id}/reports/resolve`, { method: "POST", body: { status } });
    setDetail((d) => d && { ...d, reports: d.reports.map((r) => (["pending", "reviewing"].includes(r.status) ? { ...r, status } : r)) });
  }, status === "resolved" ? "Reports resolved" : "Reports dismissed");

  async function removeComment(id: string) {
    if (!(await confirm({ title: "Delete this comment?", message: "The comment and its replies will be permanently removed.", confirmLabel: "Delete comment", tone: "danger" }))) return;
    await act(async () => {
      await api(`/admin/comments/${id}`, { method: "DELETE" });
      setDetail((d) => d && { ...d, comments: d.comments.filter((c) => c.id !== id && c.parentId !== id) });
      if (preview) patchRow(preview.id, { comments: Math.max(0, preview.comments - 1) });
    }, "Comment deleted");
  }

  async function setAuthorStatus(status: "suspended" | "active") {
    if (!preview || !detail) return;
    if (status === "suspended" && !(await confirm({
      title: "Suspend this author?",
      message: `${preview.authorName} will be signed out and unable to use their account.`,
      confirmLabel: "Suspend author",
      tone: "danger",
    }))) return;
    await act(async () => {
      await api(`/admin/users/${detail.authorId}`, { method: "PATCH", body: { accountStatus: status } });
      setDetail((d) => d && { ...d, authorStatus: status });
    }, status === "suspended" ? "Author suspended" : "Author reactivated");
  }

  const revokeAuthor = () => act(async () => {
    if (detail) await api(`/admin/users/${detail.authorId}/revoke-sessions`, { method: "POST" });
  }, "Author signed out everywhere");

  const copyText = async (text: string, label: string) => flash((await copy(text)) ? `${label} copied` : "Copy failed");

  return (
    <>
      <PageHeader
        title="Content"
        description="Browse every post on the platform, inspect engagement metrics and remove anything that breaks the rules."
      actions={<Link href="/admin/content/new" className="ac-btn primary"><Plus size={15} /> New post</Link>}
      />
      {message && <p className="adm-error">{message}</p>}
      {notice && <p className="ac-notice" role="status"><Check size={14} /> {notice}</p>}

      <Panel flush>
        <div className="ac-toolbar ac-toolbar-wrap">
          <label className="ac-search" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} />
            <input
              placeholder="Search post text, author name or email…"
              value={search}
              onChange={(e) => (setSearch(e.target.value))}
            />
          </label>
          <label className="ac-search" style={{ width: 180 }}>
            <Tag size={15} />
            <input
              placeholder="Filter by topic…"
              value={topicFilter}
              onChange={(e) => (setTopicFilter(e.target.value))}
            />
          </label>
          <Segmented
            value={filter}
            onChange={(v) => (setFilter(v))}
            options={[
              { value: "all", label: "All" },
              { value: "reported", label: "Reported" },
              { value: "referral", label: "Referrals" },
              { value: "poll", label: "Polls" },
              { value: "anonymous", label: "Anonymous" },
            ]}
          />
        </div>

        {selected.size > 0 && (
          <div className="ac-bulkbar" role="region" aria-label="Bulk actions">
            <strong>{selected.size} selected</strong>
            <button className="ac-btn danger sm" disabled={busy} onClick={() => void removeSelected()}><Trash2 size={13} /> Delete</button>
            <button className="ac-btn sm" onClick={() => setSelected(new Set())}><X size={13} /> Clear</button>
          </div>
        )}
        <table className="ac-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" aria-label="Select all loaded posts" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(data.items.map((i) => i.id)))} />
              </th>
              <th>Post</th>
              <th>Author</th>
              <th>Topic</th>
              <th style={{ textAlign: "right" }}>Engagement</th>
              <th>Age</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id} className="ac-row-click" onClick={() => setPreview(p)}>
                <td onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" aria-label="Select post" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                </td>
                <td style={{ maxWidth: 380 }}>
                  <div className="ac-cell-primary">{stripMd(p.excerpt).slice(0, 120) || "(empty)"}</div>
                  <div className="ac-cell-badges">
                    {p.isAnonymous && <Badge value="muted" label="Anonymous" />}
                    {p.hasReferral && <Badge value="warn" label="Referral" />}
                    {p.hasPoll && <Badge value="muted" label="Poll" />}
                    {p.images?.length > 0 && <Badge value="muted" label={`${p.images.length} photo${p.images.length > 1 ? "s" : ""}`} />}
                    {p.reports > 0 && <Badge value="bad" label={`${p.reports} report${p.reports > 1 ? "s" : ""}`} />}
                  </div>
                </td>
                <td>
                  <div className="ac-cell-primary">{p.isAnonymous ? "Anonymous" : p.authorName}</div>
                  {!p.isAnonymous && <div className="ac-cell-sub">{p.authorEmail}</div>}
                </td>
                <td><Badge value="muted" label={p.topic} /></td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <span className="ac-inline-stats">
                    <ThumbsUp size={12} /> {p.likes}
                    <ThumbsDown size={12} /> {p.dislikes}
                    <MessageSquare size={12} /> {p.comments}
                    <Flag size={12} style={{ opacity: p.reports > 0 ? 1 : 0.3 }} /> {p.reports}
                  </span>
                </td>
                <td style={{ whiteSpace: "nowrap", color: "var(--muted)" }}>{ago(p.createdAt)}</td>
                <td>
                  <RowMenu items={[
                    { label: "View details", icon: <Eye size={14} />, onClick: () => setPreview(p) },
                    { label: "Copy text", icon: <Copy size={14} />, onClick: () => void copyText(p.excerpt, "Text") },
                    { label: "Copy post ID", icon: <Copy size={14} />, onClick: () => void copyText(p.id, "Post ID") },
                    { label: "Delete post", icon: <Trash2 size={14} />, danger: true, onClick: () => void remove(p) },
                    ...(p.isAnonymous ? [] : [{ label: "Delete & suspend author", icon: <ShieldOff size={14} />, danger: true, onClick: () => void remove(p, true) }]),
                  ]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!data.items.length && <Empty title="No posts found" hint="Try adjusting your search or filters." />}
        <InfiniteFooter feed={feed} />
      </Panel>

      {preview && (
        <Drawer title="Post detail" onClose={() => setPreview(null)}>
          <div className="ac-detail-section">
            <h3>Author</h3>
            {preview.isAnonymous ? (
              <p className="ac-muted">Posted anonymously</p>
            ) : (
              <div className="ac-facts">
                <div><dt><User size={13} /> Name</dt><dd>{preview.authorName}</dd></div>
                <div><dt>Email</dt><dd>{preview.authorEmail}</dd></div>
              </div>
            )}
          </div>
          <div className="ac-detail-section">
            <h3>Post</h3>
            <div className="ac-post-preview">
              <p className="ac-cell-badges" style={{ marginBottom: 8 }}>
                <Badge value="muted" label={preview.topic} />
                {preview.company && <Badge value="muted" label={preview.company} />}
                {preview.isAnonymous && <Badge value="muted" label="Anonymous" />}
                {preview.hasReferral && <Badge value="warn" label="Referral" />}
                {preview.hasPoll && <Badge value="muted" label="Poll" />}
              </p>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: 14 }}>
                {detail?.text ?? preview.excerpt}
              </p>
            </div>
          </div>
          {preview.images?.length > 0 && (
            <div className="ac-detail-section">
              <h3><ImageIcon size={12} style={{ display: "inline", marginRight: 4 }} />Images ({preview.images.length})</h3>
              <div className="ac-image-grid">
                {preview.images.map((file, i) => (
                  <a
                    key={file}
                    href={mediaUrl(file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ac-image-thumb"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(file)} alt={`Image ${i + 1}`} />
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="ac-detail-section">
            <h3>Engagement</h3>
            <div className="ac-facts">
              <div><dt><ThumbsUp size={13} /> Likes</dt><dd>{preview.likes}</dd></div>
              <div><dt><ThumbsDown size={13} /> Dislikes</dt><dd>{preview.dislikes}</dd></div>
              <div><dt><MessageSquare size={13} /> Comments</dt><dd>{preview.comments}</dd></div>
              <div><dt><BookOpen size={13} /> Reposts</dt><dd>{preview.reposts}</dd></div>
              <div><dt><ExternalLink size={13} /> Shares</dt><dd>{preview.shares}</dd></div>
              <div><dt><Eye size={13} /> Reports</dt><dd style={{ color: preview.reports > 0 ? "var(--red, #e53)" : undefined }}>{preview.reports}</dd></div>
            </div>
          </div>
          <div className="ac-detail-section">
            <h3>Metadata</h3>
            <div className="ac-facts">
              <div><dt>Created</dt><dd>{when(preview.createdAt)}</dd></div>
            </div>
          </div>
          <div className="ac-detail-section">
            <h3>Moderation</h3>
            <label className="ac-inline-field">
              <span>Topic</span>
              <Dropdown compact value={detail?.topic ?? preview.topic} disabled={busy || !detail} onChange={(e) => void changeTopic(e.target.value)}>
                {[...new Set([detail?.topic ?? preview.topic, ...TOPICS])].map((t) => <option key={t}>{t}</option>)}
              </Dropdown>
            </label>
            {detail && detail.reports.length > 0 && (
              <div className="ac-reportlist">
                {detail.reports.map((r) => (
                  <div key={r.id} className="ac-reportitem">
                    <div><Badge value={r.status} /> <Badge value="muted" label={r.category} /> <span className="ac-cell-sub">by {r.reporterName} · {ago(r.createdAt)}</span></div>
                    <p>{r.reason}</p>
                  </div>
                ))}
                {detail.reports.some((r) => ["pending", "reviewing"].includes(r.status)) && (
                  <div className="ac-row-actions">
                    <button className="ac-btn sm" disabled={busy} onClick={() => void resolveReports("resolved")}><Check size={13} /> Resolve reports</button>
                    <button className="ac-btn sm" disabled={busy} onClick={() => void resolveReports("dismissed")}><X size={13} /> Dismiss reports</button>
                  </div>
                )}
              </div>
            )}
          </div>
          {!preview.isAnonymous && detail && (
            <div className="ac-detail-section">
              <h3>Author actions</h3>
              <p className="ac-cell-sub" style={{ marginBottom: 8 }}>Account status: <Badge value={detail.authorStatus} /></p>
              <div className="ac-row-actions">
                {detail.authorStatus === "suspended" ? (
                  <button className="ac-btn sm" disabled={busy} onClick={() => void setAuthorStatus("active")}><ShieldCheck size={13} /> Reactivate</button>
                ) : (
                  !detail.authorIsAdmin && <button className="ac-btn danger sm" disabled={busy} onClick={() => void setAuthorStatus("suspended")}><ShieldOff size={13} /> Suspend author</button>
                )}
                <button className="ac-btn sm" disabled={busy} onClick={() => void revokeAuthor()}><LogOut size={13} /> Sign out everywhere</button>
              </div>
            </div>
          )}
          <div className="ac-detail-section">
            <h3>Comments {detail ? `(${detail.comments.length})` : ""}</h3>
            {!detail && <p className="ac-muted">Loading…</p>}
            {detail && !detail.comments.length && <p className="ac-muted">No comments.</p>}
            {detail?.comments.map((c) => (
              <div key={c.id} className="ac-commentitem" style={{ marginLeft: c.parentId ? 16 : 0 }}>
                <div>
                  <strong>{c.authorName}</strong> <span className="ac-cell-sub">{ago(c.createdAt)}</span>
                  <p>{c.text}</p>
                </div>
                <button className="ac-btn danger sm" aria-label="Delete comment" disabled={busy} onClick={() => void removeComment(c.id)}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <div className="ac-drawer-actions">
            <button className="ac-btn" onClick={() => void copyText(detail?.text ?? preview.excerpt, "Text")}><Copy size={15} /> Copy text</button>
            <button className="ac-btn" onClick={() => void copyText(preview.id, "Post ID")}><Copy size={15} /> Copy ID</button>
            <button className="ac-btn danger" disabled={busy} onClick={() => void remove(preview)}><Trash2 size={15} /> Delete post</button>
            {!preview.isAnonymous && <button className="ac-btn danger" disabled={busy} onClick={() => void remove(preview, true)}><ShieldOff size={15} /> Delete & suspend</button>}
          </div>
        </Drawer>
      )}
    </>
  );
}
