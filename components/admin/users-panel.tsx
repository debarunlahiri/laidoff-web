"use client";
import { api, apiMessage, queryPath } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { Pager, when } from "./ui";

type User = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  emailVerifiedAt: string | null;
  accountStatus: string;
  createdAt: string;
  lastLoginAt: string | null;
  reminderCount: number;
  hasPassword: boolean;
};
const LIMIT = 20;
export default function UsersPanel({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState("all");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<{ total: number; items: User[] }>({
    total: 0,
    items: [],
  });
  const [message, setMessage] = useState("");
  const load = useCallback(
    () =>
      api<{ total: number; items: User[] }>(
        queryPath("/admin/users", { search, verified, limit: LIMIT, offset }),
      ).then(setData, (e) => setMessage(apiMessage(e))),
    [search, verified, offset],
  );
  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  async function patch(user: User, body: Record<string, unknown>) {
    setMessage("");
    try {
      const updated = await api<User>(`/admin/users/${user.id}`, {
        method: "PATCH",
        body,
      });
      setData((d) => ({
        ...d,
        items: d.items.map((u) => (u.id === user.id ? updated : u)),
      }));
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  async function send(user: User, kind: "send-verification" | "send-welcome") {
    setMessage("");
    try {
      const r = await api<{ sent: boolean }>(
        `/admin/users/${user.id}/${kind}`,
        { method: "POST", body: {} },
      );
      setMessage(
        r.sent
          ? `Email sent to ${user.email}.`
          : "Email wasn’t sent (check Settings and the Email log).",
      );
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  return (
    <div className="adm-card">
      <div className="adm-toolbar">
        <input
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => (setOffset(0), setSearch(e.target.value))}
        />
        <select
          value={verified}
          onChange={(e) => (setOffset(0), setVerified(e.target.value))}
        >
          <option value="all">All members</option>
          <option value="yes">Verified</option>
          <option value="no">Not verified</option>
        </select>
      </div>
      {message && (
        <p role="status" className="adm-note">
          {message}
        </p>
      )}
      <div className="adm-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Verified</th>
              <th>Status</th>
              <th>Admin</th>
              <th>Reminders</th>
              <th>Joined</th>
              <th>Email actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((user) => {
              const me = user.id === currentUserId;
              return (
                <tr key={user.id}>
                  <td>
                    <input
                      className="adm-inline"
                      defaultValue={user.name}
                      maxLength={100}
                      onBlur={(e) =>
                        e.target.value.trim() &&
                        e.target.value !== user.name &&
                        patch(user, { name: e.target.value.trim() })
                      }
                    />
                    <small>
                      {user.email}
                      {!user.hasPassword && " · Google"}
                    </small>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={Boolean(user.emailVerifiedAt)}
                      title={
                        user.emailVerifiedAt
                          ? when(user.emailVerifiedAt)
                          : "Not verified"
                      }
                      onChange={(e) =>
                        patch(user, { emailVerified: e.target.checked })
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={user.accountStatus}
                      disabled={me}
                      onChange={(e) =>
                        patch(user, { accountStatus: e.target.value })
                      }
                    >
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
                      <option value="deactivated">deactivated</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={user.isAdmin}
                      disabled={me}
                      onChange={(e) =>
                        patch(user, { isAdmin: e.target.checked })
                      }
                    />
                  </td>
                  <td>
                    {user.reminderCount}{" "}
                    <button
                      className="adm-link"
                      onClick={() => patch(user, { reminderCount: 0 })}
                    >
                      reset
                    </button>
                  </td>
                  <td>{when(user.createdAt)}</td>
                  <td className="adm-row-actions">
                    {!user.emailVerifiedAt && (
                      <button onClick={() => send(user, "send-verification")}>
                        Send verification
                      </button>
                    )}
                    <button onClick={() => send(user, "send-welcome")}>
                      Send welcome
                    </button>
                  </td>
                </tr>
              );
            })}
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
