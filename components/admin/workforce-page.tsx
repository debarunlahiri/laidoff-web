"use client";
import Link from "next/link";
import { api, apiMessage, queryPath } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { Plus, BadgeCheck, ExternalLink, Undo2 } from "lucide-react";
import { Badge, Empty, PageHeader, Panel, Segmented, ago } from "./ui";
import { InfiniteFooter, useInfiniteList } from "./use-infinite-list";
import { usePending } from "./shell";

type Item = {
  id: string;
  company: string;
  eventDate: string;
  rolesAffected: number;
  headcount: number | null;
  sourceUrl: string;
  status: "user_reported" | "verified";
  summary: string | null;
  createdAt: string;
  reporterName: string;
};
const LIMIT = 15;

export default function WorkforcePage() {
  const { refresh } = usePending();
  const [status, setStatus] = useState<"all" | "user_reported" | "verified">(
    "user_reported",
  );
  const feed = useInfiniteList<Item>("/admin/workforce", { status }, LIMIT);
  const { data, setData, error: message, setError: setMessage, reload: load } = feed;
  async function set(item: Item, next: Item["status"]) {
    try {
      await api(`/admin/workforce/${item.id}`, {
        method: "PATCH",
        body: {
          status: next,
          summary:
            next === "verified"
              ? "Source confirmed by an administrator."
              : undefined,
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
        title="Layoff reports"
        description="Member-submitted layoff events. Verify the source before they count as confirmed in Insights."
      actions={<Link href="/admin/workforce/new" className="ac-btn primary"><Plus size={15} /> Add report</Link>}
      />
      {message && <p className="adm-error">{message}</p>}
      <Panel flush>
        <div className="ac-toolbar">
          <Segmented
            value={status}
            onChange={(v) => (setStatus(v))}
            options={[
              { value: "user_reported", label: "Awaiting verification" },
              { value: "verified", label: "Verified" },
              { value: "all", label: "All" },
            ]}
          />
        </div>
        <div className="ac-scroll">
          <table className="ac-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Event date</th>
                <th className="num">Roles</th>
                <th className="num">Headcount</th>
                <th>Reported by</th>
                <th>Source</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((i) => (
                <tr key={i.id}>
                  <td>
                    <strong>{i.company}</strong>
                  </td>
                  <td className="nowrap">{i.eventDate.slice(0, 10)}</td>
                  <td className="num">{i.rolesAffected.toLocaleString()}</td>
                  <td className="num">
                    {i.headcount?.toLocaleString() ?? "—"}
                  </td>
                  <td>
                    {i.reporterName}
                    <small>{ago(i.createdAt)}</small>
                  </td>
                  <td>
                    <a
                      className="ac-ext"
                      href={i.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      Open <ExternalLink size={12} />
                    </a>
                  </td>
                  <td>
                    <Badge
                      value={i.status}
                      label={
                        i.status === "verified" ? "Verified" : "Unverified"
                      }
                    />
                  </td>
                  <td className="act">
                    {i.status === "user_reported" ? (
                      <button
                        className="ac-btn sm"
                        onClick={() => set(i, "verified")}
                      >
                        <BadgeCheck size={14} /> Verify
                      </button>
                    ) : (
                      <button
                        className="ac-btn sm"
                        onClick={() => set(i, "user_reported")}
                      >
                        <Undo2 size={14} /> Unverify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.items.length && (
            <Empty
              title="Nothing here"
              hint="No layoff reports match this filter."
            />
          )}
        </div>
        <InfiniteFooter feed={feed} />
      </Panel>
    </>
  );
}
