"use client";
import { Dropdown } from "./dropdown";
import Link from "next/link";
import { api, apiMessage, queryPath } from "@/lib/api";
import Avatar from "@/components/ui/avatar";
import { useConfirm } from "@/providers/confirm-provider";
import { useAuth } from "@/providers/auth-provider";
import { useCallback, useEffect, useState } from "react";
import { Plus,
  Mail,
  MailCheck,
  Search,
  ShieldCheck,
  ShieldOff,
  UserX,
  UserCheck,
  LogOut,
} from "lucide-react";
import {
  Badge,
  Drawer,
  Empty,
  PageHeader,
  Panel,
  ago,
  initials,
  useDebounced,
  when,
} from "./ui";
import { InfiniteFooter, useInfiniteList } from "./use-infinite-list";

type User = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  emailVerifiedAt: string | null;
  accountStatus: string;
  createdAt: string;
  lastLoginAt: string | null;
};
type Detail = User & {
  headline: string;
  location: string;
  profileImageUrl: string | null;
  openToWork: boolean;
  posts: number;
  comments: number;
  referrals: number;
  followers: number;
  reportsAgainst: number;
  activeSessions: number;
  recentPosts: { id: string; excerpt: string; createdAt: string }[];
};
const LIMIT = 20;

export default function UsersPage() {
  const { user: me } = useAuth();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [verified, setVerified] = useState("all");
  const [role, setRole] = useState("all");
  const [detail, setDetail] = useState<Detail | null>(null);
  const q = useDebounced(search);

  const feed = useInfiniteList<User>("/admin/users", { search: q, status, verified, role }, LIMIT);
  const { data, setData, error: message, setError: setMessage, reload: load, loading } = feed;

  async function open(id: string) {
    try {
      setDetail(await api<Detail>(`/admin/users/${id}`));
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  async function patch(
    target: User,
    body: Record<string, unknown>,
    ask?: Parameters<typeof confirm>[0],
  ) {
    if (ask && !(await confirm(ask))) return;
    try {
      const updated = await api<User>(`/admin/users/${target.id}`, {
        method: "PATCH",
        body,
      });
      setData((d) => ({
        ...d,
        items: d.items.map((u) => (u.id === target.id ? updated : u)),
      }));
      setDetail((d) => (d && d.id === target.id ? { ...d, ...updated } : d));
      setMessage("");
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  async function post(target: User, path: string, done: string) {
    try {
      await api(`/admin/users/${target.id}/${path}`, {
        method: "POST",
        body: {},
      });
      setMessage(done);
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  const suspend = (u: User) =>
    patch(
      u,
      { accountStatus: u.accountStatus === "active" ? "suspended" : "active" },
      u.accountStatus === "active"
        ? {
            title: `Suspend ${u.name}?`,
            message:
              "They will be signed out and unable to log in until reactivated.",
            confirmLabel: "Suspend",
            tone: "danger",
          }
        : undefined,
    );
  const toggleAdmin = (u: User) =>
    patch(
      u,
      { isAdmin: !u.isAdmin },
      {
        title: u.isAdmin
          ? `Remove admin access from ${u.name}?`
          : `Make ${u.name} an administrator?`,
        message: u.isAdmin
          ? "They will lose access to this console."
          : "They will get full access to this console, including other members' data.",
        confirmLabel: u.isAdmin ? "Remove admin" : "Make admin",
        tone: u.isAdmin ? "danger" : "default",
      },
    );

  const filters = [
    {
      label: "Status",
      value: status,
      set: setStatus,
      options: [
        ["all", "All statuses"],
        ["active", "Active"],
        ["suspended", "Suspended"],
        ["deactivated", "Deactivated"],
      ],
    },
    {
      label: "Email",
      value: verified,
      set: setVerified,
      options: [
        ["all", "Any email state"],
        ["yes", "Verified"],
        ["no", "Not verified"],
      ],
    },
    {
      label: "Role",
      value: role,
      set: setRole,
      options: [
        ["all", "All roles"],
        ["admin", "Admins"],
        ["member", "Members"],
      ],
    },
  ] as const;

  return (
    <>
      <PageHeader
        title="Users"
        description="Search members, review accounts and manage access."
      actions={<Link href="/admin/users/new" className="ac-btn primary"><Plus size={15} /> New user</Link>}
      />
      {message && (
        <p className={/sent|revoked/i.test(message) ? "adm-ok" : "adm-error"}>
          {message}
        </p>
      )}
      <Panel flush>
        <div className="ac-toolbar">
          <label className="ac-search">
            <Search size={16} />
            <input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => (setSearch(e.target.value))}
            />
          </label>
          {filters.map((f) => (
            <Dropdown compact
              key={f.label}
              aria-label={f.label}
              value={f.value}
              onChange={(e) => (f.set(e.target.value))}
            >
              {f.options.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Dropdown>
          ))}
        </div>
        <div className="ac-scroll">
          <table className="ac-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Status</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Last active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u.id} className="click" onClick={() => open(u.id)}>
                  <td>
                    <div className="ac-person">
                      <Avatar initials={initials(u.name)} small />
                      <div>
                        <strong>{u.name}</strong>
                        <small>{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge value={u.accountStatus} />
                  </td>
                  <td>
                    <Badge
                      value={u.emailVerifiedAt ? "verified" : "pending"}
                      label={u.emailVerifiedAt ? "Verified" : "Unverified"}
                    />
                  </td>
                  <td>
                    {u.isAdmin ? (
                      <Badge value="open" label="Admin" />
                    ) : (
                      "Member"
                    )}
                  </td>
                  <td className="nowrap">{when(u.createdAt).split(",")[0]}</td>
                  <td className="nowrap">{ago(u.lastLoginAt)}</td>
                  <td className="act" onClick={(e) => e.stopPropagation()}>
                    {u.id !== me?.id && (
                      <button className="ac-btn sm" onClick={() => suspend(u)}>
                        {u.accountStatus === "active"
                          ? "Suspend"
                          : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !data.items.length && (
            <Empty
              title="No members match"
              hint="Try a different search or clear the filters."
            />
          )}
        </div>
        <InfiniteFooter feed={feed} />
      </Panel>

      {detail && (
        <Drawer title="Member details" onClose={() => setDetail(null)}>
          <div className="ac-profile">
            <Avatar
              initials={initials(detail.name)}
              src={detail.profileImageUrl}
            />
            <div>
              <h3>{detail.name}</h3>
              <p>{detail.headline || "No headline"}</p>
              <div className="ac-badges">
                <Badge value={detail.accountStatus} />
                <Badge
                  value={detail.emailVerifiedAt ? "verified" : "pending"}
                  label={
                    detail.emailVerifiedAt
                      ? "Email verified"
                      : "Email unverified"
                  }
                />
                {detail.isAdmin && <Badge value="open" label="Admin" />}
              </div>
            </div>
          </div>
          <dl className="ac-facts">
            <div>
              <dt>Email</dt>
              <dd>{detail.email}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{detail.location || "—"}</dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{when(detail.createdAt)}</dd>
            </div>
            <div>
              <dt>Last login</dt>
              <dd>{when(detail.lastLoginAt)}</dd>
            </div>
            <div>
              <dt>Active sessions</dt>
              <dd>{detail.activeSessions}</dd>
            </div>
          </dl>
          <div className="ac-mini">
            {[
              ["Posts", detail.posts],
              ["Comments", detail.comments],
              ["Referrals", detail.referrals],
              ["Followers", detail.followers],
              ["Reports against", detail.reportsAgainst],
            ].map(([l, v]) => (
              <div key={l}>
                <strong>{v}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
          {detail.recentPosts.length > 0 && (
            <>
              <h4>Recent posts</h4>
              <ul className="ac-recent">
                {detail.recentPosts.map((p) => (
                  <li key={p.id}>
                    <span>{p.excerpt}</span>
                    <small>{ago(p.createdAt)}</small>
                  </li>
                ))}
              </ul>
            </>
          )}
          <h4>Actions</h4>
          <div className="ac-actions">
            {!detail.emailVerifiedAt && (
              <>
                <button
                  className="ac-btn"
                  onClick={() =>
                    post(
                      detail,
                      "send-verification",
                      `Verification email sent to ${detail.email}.`,
                    )
                  }
                >
                  <Mail size={15} /> Resend verification
                </button>
                <button
                  className="ac-btn"
                  onClick={() =>
                    patch(
                      detail,
                      { emailVerified: true },
                      {
                        title: "Mark email as verified?",
                        message: `${detail.email} will be treated as confirmed without clicking a link.`,
                        confirmLabel: "Mark verified",
                      },
                    )
                  }
                >
                  <MailCheck size={15} /> Mark verified
                </button>
              </>
            )}
            <button
              className="ac-btn"
              onClick={() =>
                post(
                  detail,
                  "send-welcome",
                  `Welcome email sent to ${detail.email}.`,
                )
              }
            >
              <Mail size={15} /> Send welcome email
            </button>
            {detail.id !== me?.id && (
              <>
                <button className="ac-btn" onClick={() => suspend(detail)}>
                  {detail.accountStatus === "active" ? (
                    <>
                      <UserX size={15} /> Suspend
                    </>
                  ) : (
                    <>
                      <UserCheck size={15} /> Reactivate
                    </>
                  )}
                </button>
                <button className="ac-btn" onClick={() => toggleAdmin(detail)}>
                  {detail.isAdmin ? (
                    <>
                      <ShieldOff size={15} /> Remove admin
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} /> Make admin
                    </>
                  )}
                </button>
                <button
                  className="ac-btn danger"
                  onClick={async () => {
                    if (
                      !(await confirm({
                        title: `Sign ${detail.name} out everywhere?`,
                        message:
                          "All their active sessions will end immediately.",
                        confirmLabel: "Sign out",
                        tone: "danger",
                      }))
                    )
                      return;
                    await post(detail, "revoke-sessions", "Sessions revoked.");
                    void open(detail.id);
                  }}
                >
                  <LogOut size={15} /> Revoke sessions
                </button>
              </>
            )}
          </div>
        </Drawer>
      )}
    </>
  );
}
