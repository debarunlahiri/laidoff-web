"use client";
import { api, apiMessage, queryPath } from "@/lib/api";
import { useEffect, useState } from "react";
import { Pager, when } from "./ui";

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
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<{ total: number; items: Log[] }>({
    total: 0,
    items: [],
  });
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setTimeout(
      () =>
        api<{ total: number; items: Log[] }>(
          queryPath("/admin/email/logs", {
            status,
            search,
            limit: LIMIT,
            offset,
          }),
        ).then(
          (r) => (setData(r), setError("")),
          (e) => setError(apiMessage(e)),
        ),
      search ? 300 : 0,
    );
    return () => clearTimeout(timer);
  }, [status, search, offset, tick]);
  return (
    <div className="adm-card">
      <div className="adm-toolbar">
        <input
          placeholder="Search recipient…"
          value={search}
          onChange={(e) => (setOffset(0), setSearch(e.target.value))}
        />
        <select
          value={status}
          onChange={(e) => (setOffset(0), setStatus(e.target.value))}
        >
          <option value="">All statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="skipped">Skipped</option>
        </select>
        <button onClick={() => setTick(tick + 1)}>Refresh</button>
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
      <Pager
        total={data.total}
        offset={offset}
        limit={LIMIT}
        onChange={setOffset}
      />
    </div>
  );
}
