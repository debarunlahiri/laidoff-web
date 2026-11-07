"use client";
import { Dropdown } from "./dropdown";
import { api, apiMessage, queryPath } from "@/lib/api";
import { useConfirm } from "@/providers/confirm-provider";
import { useCallback, useEffect, useState } from "react";
import { Check, Eye, Trash2, X } from "lucide-react";
import { Badge, Empty, PageHeader, Panel, Segmented, ago } from "./ui";
import { InfiniteFooter, useInfiniteList } from "./use-infinite-list";
import { usePending } from "./shell";

type Report = {
  id: string;
  kind: "post" | "comment";
  category: string;
  reason: string;
  status: string;
  resolutionSummary: string | null;
  createdAt: string;
  contentId: string;
  excerpt: string;
  authorName: string;
  reporterName: string;
};
const LIMIT = 10;

export default function ModerationPage() {
  const confirm = useConfirm();
  const { pending, refresh } = usePending();
  const [kind, setKind] = useState<"post" | "comment">("post");
  const [status, setStatus] = useState("open");
  const feed = useInfiniteList<Report>("/admin/reports", { kind, status }, LIMIT);
  const { data, setData, error: message, setError: setMessage, reload: load } = feed;

  async function act(
    report: Report,
    next: "reviewing" | "resolved" | "dismissed",
    removeContent = false,
  ) {
    if (
      removeContent &&
      !(await confirm({
        title: `Remove this ${report.kind}?`,
        message: `The ${report.kind} by ${report.authorName} will be permanently deleted and the report resolved.`,
        confirmLabel: `Remove ${report.kind}`,
        tone: "danger",
      }))
    )
      return;
    try {
      await api(`/admin/reports/${report.kind}/${report.id}`, {
        method: "PATCH",
        body: {
          status: next,
          removeContent,
          ...(report.kind === "post"
            ? {
                resolutionSummary: removeContent
                  ? "Content removed by an administrator."
                  : next === "dismissed"
                    ? "No violation found."
                    : next === "resolved"
                      ? "Reviewed by an administrator."
                      : "Under review.",
              }
            : {}),
        },
      });
      void load();
      refresh();
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  return (
    <>
      <PageHeader
        title="Moderation"
        description="Review what members have reported and decide what stays."
      />
      {message && <p className="adm-error">{message}</p>}
      <Panel flush>
        <div className="ac-toolbar">
          <Segmented
            value={kind}
            onChange={(v) => (setKind(v))}
            options={[
              { value: "post", label: "Posts", count: pending.postReports },
              {
                value: "comment",
                label: "Comments",
                count: pending.commentReports,
              },
            ]}
          />
          <Dropdown compact
            aria-label="Status"
            value={status}
            onChange={(e) => (setStatus(e.target.value))}
          >
            <option value="open">Needs review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
            <option value="all">All</option>
          </Dropdown>
        </div>
        <ul className="ac-cases">
          {data.items.map((r) => (
            <li key={r.id}>
              <div className="ac-case-head">
                <Badge value={r.status} />
                <Badge value="muted" label={r.category} />
                <small>
                  Reported by {r.reporterName} · {ago(r.createdAt)}
                </small>
              </div>
              <blockquote>
                <strong>{r.authorName}</strong>
                <p>{r.excerpt}</p>
              </blockquote>
              <p className="ac-reason">
                <b>Reason:</b> {r.reason}
              </p>
              {r.resolutionSummary && (
                <p className="ac-reason">
                  <b>Outcome:</b> {r.resolutionSummary}
                </p>
              )}
              {(r.status === "pending" || r.status === "reviewing") && (
                <div className="ac-actions">
                  {r.status === "pending" && (
                    <button
                      className="ac-btn sm"
                      onClick={() => act(r, "reviewing")}
                    >
                      <Eye size={14} /> Mark reviewing
                    </button>
                  )}
                  <button
                    className="ac-btn sm"
                    onClick={() => act(r, "dismissed")}
                  >
                    <X size={14} /> Dismiss
                  </button>
                  <button
                    className="ac-btn sm"
                    onClick={() => act(r, "resolved")}
                  >
                    <Check size={14} /> Resolve
                  </button>
                  <button
                    className="ac-btn danger sm"
                    onClick={() => act(r, "resolved", true)}
                  >
                    <Trash2 size={14} /> Remove {r.kind}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {!data.items.length && (
          <Empty
            title="Queue is clear"
            hint="Nothing matches this filter right now."
          />
        )}
        <InfiniteFooter feed={feed} />
      </Panel>
    </>
  );
}
