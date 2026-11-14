"use client";
import Notice from "./notice";
import { Dropdown } from "./dropdown";
import { api, apiMessage, queryPath } from "@/lib/api";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Badge, Empty, PageHeader, Panel, useDebounced, when } from "./ui";
import { InfiniteFooter, useInfiniteList } from "./use-infinite-list";

type Row = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  outcome: string;
  ip: string | null;
  occurredAt: string;
  changes: Record<string, unknown> | null;
  actorName: string | null;
  actorEmail: string | null;
};
const LIMIT = 25;

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [outcome, setOutcome] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const q = useDebounced(search);
  const feed = useInfiniteList<Row>(
    "/admin/audit",
    { search: q, outcome },
    LIMIT,
  );
  const {
    data,
    setData,
    error: message,
    setError: setMessage,
    reload: load,
  } = feed;
  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every change made through the API, who made it, and whether it succeeded."
      />
      <Notice message={message} onClose={() => setMessage("")} />
      <Panel flush>
        <div className="ac-toolbar">
          <label className="ac-search">
            <Search size={16} />
            <input
              placeholder="Search action or resource"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <Dropdown
            compact
            aria-label="Outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          >
            <option value="all">All outcomes</option>
            <option value="succeeded">Succeeded</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </Dropdown>
        </div>
        <div className="ac-scroll">
          <table className="ac-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Outcome</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <Fragment key={r.id}>
                  <tr
                    className="click"
                    onClick={() => setOpen(open === r.id ? null : r.id)}
                  >
                    <td className="nowrap">{when(r.occurredAt)}</td>
                    <td>
                      {r.actorName ?? "System"}
                      <small>{r.actorEmail}</small>
                    </td>
                    <td>
                      <code>{r.action}</code>
                    </td>
                    <td>
                      {r.resourceType}
                      <small>{r.resourceId}</small>
                    </td>
                    <td>
                      <Badge value={r.outcome} />
                    </td>
                    <td className="nowrap">{r.ip ?? "—"}</td>
                  </tr>
                  {open === r.id && (
                    <tr className="detail">
                      <td colSpan={6}>
                        <pre>
                          {r.changes
                            ? JSON.stringify(r.changes, null, 2)
                            : "No request body recorded."}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {!data.items.length && <Empty title="No entries" />}
        </div>
        <InfiniteFooter feed={feed} />
      </Panel>
    </>
  );
}
