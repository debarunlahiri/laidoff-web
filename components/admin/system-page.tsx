"use client";
import { api, apiMessage } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { Badge, Empty, PageHeader, Panel, ago } from "./ui";

type System = {
  api: {
    requests: number;
    serverErrors: number;
    clientErrors: number;
    avgMs: number;
    p95Ms: number;
  };
  databaseFailures: number;
  slowRoutes: {
    method: string;
    route: string;
    requests: number;
    avgMs: number;
  }[];
  recentErrors: {
    id: string;
    level: string;
    event: string;
    message: string;
    occurredAt: string;
  }[];
  runtime: {
    node: string;
    uptimeSeconds: number;
    memoryMb: number;
    loadAverage: number;
    environment: string;
  };
  smtpConfigured: boolean;
};
const uptime = (s: number) =>
  s > 86400
    ? `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`
    : s > 3600
      ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
      : `${Math.floor(s / 60)}m`;

export default function SystemPage() {
  const [data, setData] = useState<System | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(
    () =>
      api<System>("/admin/system").then(
        (r) => (setData(r), setError("")),
        (e) => setError(apiMessage(e)),
      ),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);
  if (!data)
    return error ? (
      <p className="adm-error">{error}</p>
    ) : (
      <LoaderCircle className="auth-spinner" size={24} />
    );
  const errorRate = data.api.requests
    ? (data.api.serverErrors / data.api.requests) * 100
    : 0;
  const checks = [
    {
      label: "API error rate",
      ok: errorRate < 1,
      detail: `${errorRate.toFixed(2)}% server errors (24h)`,
    },
    {
      label: "Database",
      ok: data.databaseFailures === 0,
      detail: `${data.databaseFailures} failed queries (24h)`,
    },
    {
      label: "Response time",
      ok: data.api.p95Ms < 800,
      detail: `p95 ${data.api.p95Ms} ms`,
    },
    {
      label: "Email delivery",
      ok: data.smtpConfigured,
      detail: data.smtpConfigured ? "SMTP configured" : "SMTP not configured",
    },
  ];
  return (
    <>
      <PageHeader
        title="System health"
        description="API performance, database errors and runtime for the last 24 hours."
        actions={
          <button className="ac-btn" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />
      <div className="ac-health">
        {checks.map((c) => (
          <div key={c.label} className={`ac-check ${c.ok ? "ok" : "bad"}`}>
            {c.ok ? <CheckCircle2 size={20} /> : <TriangleAlert size={20} />}
            <div>
              <strong>{c.label}</strong>
              <span>{c.detail}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="ac-kpis">
        {[
          ["Requests (24h)", data.api.requests.toLocaleString()],
          ["Avg response", `${data.api.avgMs} ms`],
          ["Client errors (4xx)", data.api.clientErrors.toLocaleString()],
          ["Server errors (5xx)", data.api.serverErrors.toLocaleString()],
        ].map(([label, value]) => (
          <div className="ac-kpi" key={label}>
            <strong>{value}</strong>
            <span className="ac-kpi-label">{label}</span>
          </div>
        ))}
      </div>
      <div className="ac-grid-2">
        <Panel
          title="Slowest routes"
          description="Average duration, last 24 hours"
          flush
        >
          {data.slowRoutes.length ? (
            <table className="ac-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th className="num">Requests</th>
                  <th className="num">Avg</th>
                </tr>
              </thead>
              <tbody>
                {data.slowRoutes.map((r) => (
                  <tr key={`${r.method}${r.route}`}>
                    <td>
                      <code>{r.method}</code> {r.route}
                    </td>
                    <td className="num">{r.requests}</td>
                    <td className="num">{r.avgMs} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty title="Not enough traffic yet" />
          )}
        </Panel>
        <Panel title="Runtime">
          <dl className="ac-facts">
            <div>
              <dt>Node.js</dt>
              <dd>{data.runtime.node}</dd>
            </div>
            <div>
              <dt>Environment</dt>
              <dd>{data.runtime.environment}</dd>
            </div>
            <div>
              <dt>Uptime</dt>
              <dd>{uptime(data.runtime.uptimeSeconds)}</dd>
            </div>
            <div>
              <dt>Memory</dt>
              <dd>{data.runtime.memoryMb} MB</dd>
            </div>
            <div>
              <dt>Load average</dt>
              <dd>{data.runtime.loadAverage}</dd>
            </div>
          </dl>
        </Panel>
      </div>
      <Panel
        title="Recent errors"
        description="Latest error and fatal application log entries"
        flush
      >
        {data.recentErrors.length ? (
          <table className="ac-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Level</th>
                <th>Event</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {data.recentErrors.map((e) => (
                <tr key={e.id}>
                  <td className="nowrap">{ago(e.occurredAt)}</td>
                  <td>
                    <Badge value={e.level} />
                  </td>
                  <td>
                    <code>{e.event}</code>
                  </td>
                  <td className="clip">{e.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty title="No errors logged" />
        )}
      </Panel>
    </>
  );
}
