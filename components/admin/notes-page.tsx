"use client";
import { api, apiMessage } from "@/lib/api";
import { useConfirm } from "@/providers/confirm-provider";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { Badge, Drawer, Empty, PageHeader, Panel, Segmented, ago, when } from "./ui";
import { InfiniteFooter, useInfiniteList } from "./use-infinite-list";
import { usePending } from "./shell";

type Note = {
  id: string;
  content: string;
  sourceUrl: string;
  status: "pending" | "approved" | "rejected";
  reason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  postExcerpt: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  reviewerName: string | null;
};

const LIMIT = 20;

function stripMd(text: string) {
  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

export default function NotesPage() {
  const confirm = useConfirm();
  const { refresh } = usePending();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selected, setSelected] = useState<Note | null>(null);
  const [reason, setReason] = useState("");

  const feed = useInfiniteList<Note>("/admin/notes", { status }, LIMIT);
  const { data, setData, error: message, setError: setMessage, reload: load } = feed;

  async function decide(note: Note, decision: "approved" | "rejected") {
    if (decision === "rejected" && !reason.trim()) {
      setMessage("Please enter a reason for rejecting this note.");
      return;
    }
    if (!(await confirm({
      title: `${decision === "approved" ? "Approve" : "Reject"} community note?`,
      message: decision === "approved"
        ? "This note will be shown on the post."
        : `This note will be hidden. Reason: "${reason}"`,
      confirmLabel: decision === "approved" ? "Approve" : "Reject",
      tone: decision === "approved" ? "default" : "danger",
    }))) return;
    try {
      await api(`/admin/notes/${note.id}`, {
        method: "PATCH",
        body: { status: decision, reason: reason.trim() || undefined },
      });
      setSelected(null);
      setReason("");
      void load();
      refresh();
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Community notes"
        description="Review user-submitted fact-checks and corrections. Approved notes appear below their post."
      />
      {message && <p className="adm-error">{message}</p>}

      <Panel flush>
        <div className="ac-toolbar">
          <Segmented
            value={status}
            onChange={(v) => (setStatus(v))}
            options={[
              { value: "pending", label: "Pending review" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "all", label: "All" },
            ]}
          />
        </div>

        <table className="ac-table">
          <thead>
            <tr>
              <th>Post excerpt</th>
              <th>Note</th>
              <th>Submitted by</th>
              <th>Status</th>
              <th>Age</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((n) => (
              <tr key={n.id} className="ac-row-click" onClick={() => { setSelected(n); setReason(""); }}>
                <td style={{ maxWidth: 220 }}>
                  <div className="ac-cell-primary">{stripMd(n.postExcerpt).slice(0, 80)}</div>
                </td>
                <td style={{ maxWidth: 300 }}>
                  <div className="ac-cell-primary">{n.content.slice(0, 100)}</div>
                </td>
                <td>
                  <div className="ac-cell-primary">{n.authorName}</div>
                  <div className="ac-cell-sub">{n.authorEmail}</div>
                </td>
                <td><Badge value={n.status} /></td>
                <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{ago(n.createdAt)}</td>
                <td>
                  {n.status === "pending" && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="ac-btn sm"
                        style={{ color: "var(--green)" }}
                        onClick={(e) => { e.stopPropagation(); setSelected(n); setReason(""); }}
                      >
                        <CheckCircle size={13} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!data.items.length && (
          <Empty
            title={status === "pending" ? "No notes pending review" : "No notes found"}
            hint={status === "pending" ? "All community notes have been reviewed." : undefined}
          />
        )}
        <InfiniteFooter feed={feed} />
      </Panel>

      {selected && (
        <Drawer title="Community note" onClose={() => { setSelected(null); setReason(""); }}>
          <div className="ac-detail-section">
            <h3>Original post excerpt</h3>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--muted)" }}>
              {stripMd(selected.postExcerpt)}
            </p>
          </div>
          <div className="ac-detail-section">
            <h3>Note content</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>{selected.content}</p>
          </div>
          <div className="ac-detail-section">
            <h3>Source</h3>
            <a
              href={selected.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ac-link"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
            >
              <ExternalLink size={13} /> {selected.sourceUrl}
            </a>
          </div>
          <div className="ac-detail-section">
            <h3>Submitted by</h3>
            <div className="ac-facts">
              <div><dt>Name</dt><dd>{selected.authorName}</dd></div>
              <div><dt>Email</dt><dd>{selected.authorEmail}</dd></div>
              <div><dt>Submitted</dt><dd>{when(selected.createdAt)}</dd></div>
              <div><dt>Status</dt><dd><Badge value={selected.status} /></dd></div>
              {selected.reviewerName && <div><dt>Reviewed by</dt><dd>{selected.reviewerName}</dd></div>}
              {selected.reviewedAt && <div><dt>Reviewed at</dt><dd>{when(selected.reviewedAt)}</dd></div>}
              {selected.reason && <div><dt>Review reason</dt><dd>{selected.reason}</dd></div>}
            </div>
          </div>
          {selected.status === "pending" && (
            <>
              <div className="ac-detail-section">
                <label className="adm-field">
                  <span>Rejection reason (required when rejecting)</span>
                  <textarea
                    rows={3}
                    placeholder="Explain why this note is being rejected…"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ resize: "vertical" }}
                  />
                </label>
              </div>
              <div className="ac-drawer-actions">
                <button className="ac-btn" style={{ color: "var(--green)" }} onClick={() => void decide(selected, "approved")}>
                  <CheckCircle size={15} /> Approve
                </button>
                <button className="ac-btn danger" onClick={() => void decide(selected, "rejected")}>
                  <XCircle size={15} /> Reject
                </button>
              </div>
            </>
          )}
        </Drawer>
      )}
    </>
  );
}
