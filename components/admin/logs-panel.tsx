"use client";
import { Dropdown } from "./dropdown";
import { api, apiMessage, queryPath } from "@/lib/api";
import { useEffect, useState } from "react";
import { useDebounced, when } from "./ui";
import { InfiniteFooter, useInfiniteList } from "./use-infinite-list";

type Log = {
  id: string;
  recipient: string;
  template: string;
  subject: string;
  status: string;
  errorCode: string | null;
  createdAt: string;
};
const LIMIT = 20;
export default function LogsPanel() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search);
  const feed = useInfiniteList<Log>(
    "/admin/email/logs",
    { status, search: debouncedSearch },
    LIMIT,
  );
  const { data, error } = feed;
  return (
    <div className="adm-card">
      <div className="adm-toolbar">
        <input
          placeholder="Search recipient…"
          value={search}
          onChange={(e) => (setSearch(e.target.value))}
        />
        <Dropdown compact
          value={status}
          onChange={(e) => (setStatus(e.target.value))}
        >
          <option value="">All statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="skipped">Skipped</option>
        </Dropdown>
        <button onClick={feed.reload}>Refresh</button>
      </div>
      {error && <p className="adm-error">{error}</p>}
      <div className="adm-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <th>When</th>
              <th>To</th>
              <th>Template</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((log) => (
              <tr key={log.id}>
                <td>{when(log.createdAt)}</td>
                <td>{log.recipient}</td>
                <td>{log.template}</td>
                <td>{log.subject}</td>
                <td>
                  <span className={`adm-pill ${log.status}`}>{log.status}</span>
                  {log.errorCode && <small> {log.errorCode}</small>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <InfiniteFooter feed={feed} />
    </div>
  );
}
