"use client";
import { api, apiMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import { Field, Toggle } from "./ui";

type Settings = {
  emailsEnabled: boolean;
  welcomeEnabled: boolean;
  verificationRequired: boolean;
  verificationGraceHours: number;
  fromName: string;
  verificationHours: number;
  remindersEnabled: boolean;
  reminderAfterHours: number;
  reminderIntervalHours: number;
  reminderMax: number;
};
type Response = {
  settings: Settings;
  smtpConfigured: boolean;
  smtpHost: string;
  smtpUser: string;
};

export default function SettingsPanel() {
  const [data, setData] = useState<Response | null>(null);
  const [form, setForm] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    api<Response>("/admin/email/settings").then(
      (r) => (setData(r), setForm(r.settings)),
      (e) => setMessage(apiMessage(e)),
    );
  }, []);
  if (!form || !data) return <p>{message || "Loading…"}</p>;
  const num = (key: keyof Settings) => (
    <input
      type="number"
      min={0}
      value={form[key] as number}
      onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
    />
  );
  async function save() {
    setMessage("");
    try {
      const r = await api<{ settings: Settings }>("/admin/email/settings", {
        method: "PUT",
        body: form,
      });
      setForm(r.settings);
      setMessage("Saved.");
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  async function reset() {
    try {
      const r = await api<{ settings: Settings }>("/admin/email/settings", {
        method: "DELETE",
      });
      setForm(r.settings);
      setMessage("Reset to defaults.");
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  return (
    <div className="adm-card">
      <p className={data.smtpConfigured ? "adm-ok" : "adm-warn"}>
        {data.smtpConfigured
          ? `SMTP connected: ${data.smtpUser} via ${data.smtpHost}. Credentials are set in the server .env and can’t be changed here.`
          : "SMTP isn’t configured on the server."}
      </p>
      <h3>Sending</h3>
      <Toggle
        label="Send emails"
        hint="Master switch. When off, nothing is sent (it is still logged as skipped)."
        checked={form.emailsEnabled}
        onChange={(v) => setForm({ ...form, emailsEnabled: v })}
      />
      <Toggle
        label="Send welcome email"
        checked={form.welcomeEnabled}
        onChange={(v) => setForm({ ...form, welcomeEnabled: v })}
      />
      <Field label="Sender name">
        <input
          value={form.fromName}
          maxLength={80}
          onChange={(e) => setForm({ ...form, fromName: e.target.value })}
        />
      </Field>
      <h3>Verification</h3>
      <Toggle
        label="Require email verification"
        hint="Unverified members can only view the portal during the preview window, then see the verification screen. Admins are exempt."
        checked={form.verificationRequired}
        onChange={(v) => setForm({ ...form, verificationRequired: v })}
      />
      <Field
        label="Preview window after sign-up (hours)"
        hint="How long unverified members can browse (read-only). Default 24."
      >
        {num("verificationGraceHours")}
      </Field>
      <Field label="Link valid for (hours)">{num("verificationHours")}</Field>
      <Toggle
        label="Remind unverified members"
        checked={form.remindersEnabled}
        onChange={(v) => setForm({ ...form, remindersEnabled: v })}
      />
      <Field label="First reminder after (hours)">
        {num("reminderAfterHours")}
      </Field>
      <Field label="Then every (hours)">{num("reminderIntervalHours")}</Field>
      <Field label="Maximum reminders per member" hint="0 turns reminders off.">
        {num("reminderMax")}
      </Field>
      <div className="adm-actions">
        <button className="primary" onClick={save}>
          Save settings
        </button>
        <button onClick={reset}>Reset to defaults</button>
        {message && <span role="status">{message}</span>}
      </div>
    </div>
  );
}
