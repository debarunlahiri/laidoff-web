"use client";

import { useAuth } from "@/providers/auth-provider";
import { api, apiMessage } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import TemplatesPanel from "./templates-panel";
import SettingsPanel from "./settings-panel";
import LogsPanel from "./logs-panel";
import UsersPanel from "./users-panel";

type Overview = {
  users: { total: number; verified: number; unverified: number };
  smtpConfigured: boolean;
  emailsLast7Days: { sent: number; failed: number; skipped: number };
  sentByTemplate: { template: string; total: number }[];
};
const tabs = [
  "Overview",
  "Templates",
  "Settings",
  "Email log",
  "Users",
] as const;
type Tab = (typeof tabs)[number];

function OverviewPanel() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<Overview>("/admin/overview").then(setData, (e) =>
      setError(apiMessage(e)),
    );
  }, []);
  if (error) return <p className="adm-error">{error}</p>;
  if (!data) return <LoaderCircle className="auth-spinner" size={22} />;
  const stat = (label: string, value: number, tone = "") => (
    <div className={`adm-stat ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
  return (
    <>
      {!data.smtpConfigured && (
        <p className="adm-warn">
          SMTP isn’t configured on the server, so emails are being skipped. Set
          SMTP_HOST, SMTP_USER and SMTP_PASSWORD in the backend .env.
        </p>
      )}
      <div className="adm-stats">
        {stat("Members", data.users.total)}
        {stat("Email verified", data.users.verified, "good")}
        {stat(
          "Not verified",
          data.users.unverified,
          data.users.unverified ? "warn" : "",
        )}
        {stat("Emails sent (7 days)", data.emailsLast7Days.sent, "good")}
        {stat(
          "Failed (7 days)",
          data.emailsLast7Days.failed,
          data.emailsLast7Days.failed ? "bad" : "",
        )}
        {stat("Skipped (7 days)", data.emailsLast7Days.skipped)}
      </div>
      <h3>Sent in the last 7 days, by template</h3>
      <ul className="adm-list">
        {data.sentByTemplate.length ? (
          data.sentByTemplate.map((row) => (
            <li key={row.template}>
              <span>{row.template}</span>
              <strong>{row.total}</strong>
            </li>
          ))
        ) : (
          <li>Nothing sent yet.</li>
        )}
      </ul>
    </>
  );
}

export default function AdminApp() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("Overview");
  if (loading)
    return (
      <div className="auth-loading" role="status">
        <LoaderCircle className="auth-spinner" size={26} />
      </div>
    );
  // Same page non-admins get for any unknown URL.
  if (!user?.isAdmin) notFound();
  return (
    <div className="adm-page">
      <header className="adm-head">
        <Link href="/" className="adm-back">
          <ArrowLeft size={16} /> Back to LayoffCircle
        </Link>
        <h1>Admin</h1>
        <nav className="adm-tabs" aria-label="Admin sections">
          {tabs.map((name) => (
            <button
              key={name}
              className={name === tab ? "active" : ""}
              onClick={() => setTab(name)}
            >
              {name}
            </button>
          ))}
        </nav>
      </header>
      <main className="adm-body">
        {tab === "Overview" && <OverviewPanel />}
        {tab === "Templates" && <TemplatesPanel />}
        {tab === "Settings" && <SettingsPanel />}
        {tab === "Email log" && <LogsPanel />}
        {tab === "Users" && <UsersPanel currentUserId={user.id} />}
      </main>
    </div>
  );
}
