"use client";
import Dialog from "@/components/ui/dialog";
import { api, apiMessage } from "@/lib/api";
import { useConfirm } from "@/providers/confirm-provider";
import { Check, Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Notice from "./notice";
import { Badge, Empty, PageHeader, Panel, ago } from "./ui";

type Key = {
  id: string;
  name: string;
  hint: string;
  account: string;
  writesPerHour: number;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};
type Created = {
  name: string;
  account: string;
  accountName: string;
  writesPerHour: number;
  apiKey: string;
};

export default function AgentKeysPage() {
  const confirm = useConfirm();
  const [keys, setKeys] = useState<Key[] | null>(null);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("news@laidoffcircle.com");
  const [writes, setWrites] = useState("60");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(
    () =>
      api<{ items: Key[] }>("/admin/agent-keys").then(
        (r) => setKeys(r.items),
        (e) => {
          setKeys((k) => k ?? []);
          setMessage(apiMessage(e));
        },
      ),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);

  function closeForm() {
    setCreating(false);
    setName("");
    setAccount("news@laidoffcircle.com");
    setWrites("60");
    setFormError("");
  }
  async function create() {
    const n = Number(writes);
    if (!name.trim()) return setFormError("Give the key a name.");
    if (!Number.isInteger(n) || n < 1 || n > 1000)
      return setFormError(
        "Writes per hour must be a whole number from 1 to 1000.",
      );
    setBusy(true);
    try {
      const result = await api<Created>("/admin/agent-keys", {
        method: "POST",
        body: { name: name.trim(), account: account.trim(), writesPerHour: n },
      });
      closeForm();
      setCreated(result);
      void load();
    } catch (e) {
      setFormError(apiMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Could not copy. Select the key and copy it manually.");
    }
  }
  async function revoke(k: Key) {
    if (
      !(await confirm({
        title: `Revoke "${k.name}"?`,
        message:
          "Any agent using this key stops working on its next request. This cannot be undone.",
        confirmLabel: "Revoke",
        tone: "danger",
      }))
    )
      return;
    try {
      await api(`/admin/agent-keys/${k.id}/revoke`, {
        method: "POST",
        body: {},
      });
      setMessage(`Key "${k.name}" revoked.`);
      void load();
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Agent API keys"
        description="Keys let trusted AI agents (like Grok) publish layoff updates through the agent API. Each key posts as one member account."
        actions={
          <button className="ac-btn primary" onClick={() => setCreating(true)}>
            <Plus size={15} /> New key
          </button>
        }
      />
      <Notice message={message} onClose={() => setMessage("")} />
      <Panel flush>
        {keys && keys.length === 0 ? (
          <Empty
            title="No agent keys yet"
            hint="Create one to let an agent publish as LaidOff News."
          />
        ) : (
          <div className="adm-scroll">
            <table className="ac-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Posts as</th>
                  <th>Limit</th>
                  <th>Last used</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(keys ?? []).map((k) => (
                  <tr key={k.id}>
                    <td>
                      <strong>{k.name}</strong>
                    </td>
                    <td>
                      <code>{k.hint}…</code>
                    </td>
                    <td>{k.account}</td>
                    <td>{k.writesPerHour}/hour</td>
                    <td>{k.lastUsedAt ? ago(k.lastUsedAt) : "Never"}</td>
                    <td>
                      <Badge
                        value={k.revokedAt ? "failed" : "active"}
                        label={k.revokedAt ? "Revoked" : "Active"}
                      />
                    </td>
                    <td>
                      {!k.revokedAt && (
                        <button
                          className="ac-btn sm danger"
                          onClick={() => void revoke(k)}
                        >
                          <Trash2 size={13} /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {creating && (
        <Dialog
          label="New agent API key"
          className="confirm-dialog"
          onClose={closeForm}
        >
          <form
            className="pw-form"
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
          >
            <h2 className="confirm-title">New agent API key</h2>
            <p className="subtle-text">
              The key is shown once after you create it.
            </p>
            <label>
              Name
              <input
                autoFocus
                maxLength={80}
                placeholder="e.g. grok"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError("");
                }}
              />
            </label>
            <label>
              Posts as (member email)
              <input
                type="email"
                value={account}
                onChange={(e) => {
                  setAccount(e.target.value);
                  setFormError("");
                }}
              />
            </label>
            <label>
              Writes per hour
              <input
                inputMode="numeric"
                value={writes}
                onChange={(e) => {
                  setWrites(e.target.value);
                  setFormError("");
                }}
              />
            </label>
            {formError && (
              <p className="auth-error" role="alert">
                {formError}
              </p>
            )}
            <div className="confirm-actions">
              <button type="button" className="secondary" onClick={closeForm}>
                Cancel
              </button>
              <button
                type="submit"
                className="primary"
                disabled={busy || !name.trim()}
              >
                {busy ? "Creating…" : "Create key"}
              </button>
            </div>
          </form>
        </Dialog>
      )}

      {created && (
        <Dialog
          label="Your new API key"
          className="confirm-dialog"
          onClose={() => setCreated(null)}
        >
          <h2 className="confirm-title">
            <KeyRound
              size={20}
              aria-hidden="true"
              style={{ verticalAlign: "-3px", marginRight: 8 }}
            />
            Copy your API key now
          </h2>
          <p className="subtle-text">
            This is the only time it is shown. It posts as{" "}
            <strong>{created.accountName}</strong> ({created.account}), up to{" "}
            {created.writesPerHour} writes per hour.
          </p>
          <code
            style={{
              display: "block",
              margin: "14px 0",
              padding: "12px",
              borderRadius: 9,
              border: "1px solid var(--line)",
              overflowWrap: "anywhere",
              userSelect: "all",
            }}
          >
            {created.apiKey}
          </code>
          <div className="confirm-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => void copy(created.apiKey)}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
              {copied ? "Copied" : "Copy key"}
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => setCreated(null)}
            >
              I have saved it
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
