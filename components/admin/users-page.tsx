"use client";
import Notice from "./notice";
import { Dropdown } from "./dropdown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, apiMessage, queryPath } from "@/lib/api";
import PasswordField from "@/components/ui/password-field";
import PasswordStrength from "@/components/auth/password-strength";
import { checkPassword } from "@/lib/password-strength";
import Dialog from "@/components/ui/dialog";
import Avatar from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/verified-badge";
import { useConfirm } from "@/providers/confirm-provider";
import { useAuth } from "@/providers/auth-provider";
import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  Plus,
  Mail,
  MailCheck,
  Search,
  ShieldCheck,
  ShieldOff,
  UserX,
  UserCheck,
  LogOut,
  Trash2,
  Skull,
  KeyRound,
} from "lucide-react";
import {
  Badge,
  DetailPage,
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
  badge?: "blue" | "gold" | null;
  emailVerifiedAt: string | null;
  accountStatus: string;
  warningCount?: number;
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

export default function UsersPage({ id }: { id?: string }) {
  const router = useRouter();
  const { user: me } = useAuth();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [verified, setVerified] = useState("all");
  const [role, setRole] = useState("all");
  const [badge, setBadge] = useState("all");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwShow, setPwShow] = useState(false);
  const [pwError, setPwError] = useState("");
  const closePw = () => {
    setPwOpen(false);
    setPw("");
    setPw2("");
    setPwShow(false);
    setPwError("");
  };
  const q = useDebounced(search);

  const feed = useInfiniteList<User>(
    "/admin/users",
    { search: q, status, verified, role, badge },
    LIMIT,
  );
  const {
    data,
    setData,
    error: message,
    setError: setMessage,
    reload: load,
    loading,
  } = feed;

  async function open(id: string) {
    try {
      setDetail(await api<Detail>(`/admin/users/${id}`));
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  useEffect(() => {
    if (id) void open(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
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
  async function post(
    target: User,
    path: string,
    done: string,
    ask?: Parameters<typeof confirm>[0],
  ) {
    if (ask && !(await confirm(ask))) return;
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
  async function setPassword(u: User) {
    if (!checkPassword(pw, { name: u.name, email: u.email }).strong)
      return setPwError("Please choose a stronger password.");
    if (pw !== pw2) return setPwError("The two passwords do not match.");
    try {
      await api(`/admin/users/${u.id}/set-password`, {
        method: "POST",
        body: { password: pw, confirmPassword: pw2 },
      });
      closePw();
      setMessage("Password updated. Sessions revoked.");
      void open(u.id);
    } catch (e) {
      setPwError(apiMessage(e));
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

  // Soft-delete: deactivates the account and hides all their content from the feed.
  const softDelete = (u: User) =>
    patch(
      u,
      { accountStatus: "deactivated" },
      {
        title: `Delete ${u.name}'s account?`,
        message:
          "Their account will be deactivated and all their posts will be hidden from the platform. The data is kept and can be restored.",
        confirmLabel: "Delete account",
        tone: "danger",
      },
    );

  // Hard-delete: permanently removes the user and all related data from the database.
  async function forceDelete(u: User) {
    if (
      !(await confirm({
        title: `Permanently delete ${u.name}?`,
        message:
          "This cannot be undone. The account, all posts, comments, referrals, messages and uploaded files will be erased from the database immediately.",
        confirmLabel: "Force delete",
        tone: "danger",
      }))
    )
      return;
    try {
      await api(`/admin/users/${u.id}`, { method: "DELETE" });
      setData((d) => ({
        ...d,
        items: d.items.filter((item) => item.id !== u.id),
      }));
      setDetail(null);
      setMessage("Account permanently deleted.");
      router.push("/admin/users");
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }

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
    {
      label: "Badge",
      value: badge,
      set: setBadge,
      options: [
        ["all", "Any badge"],
        ["blue", "Blue (member)"],
        ["gold", "Gold (company)"],
        ["none", "No badge"],
      ],
    },
  ] as const;

  return (
    <>
      {!id && (
        <>
          <PageHeader
            title="Users"
            description="Search members, review accounts and manage access."
            actions={
              <Link href="/admin/users/new" className="ac-btn primary">
                <Plus size={15} /> New user
              </Link>
            }
          />
          <Notice message={message} onClose={() => setMessage("")} />
          <Panel flush>
            <div className="ac-toolbar">
              <label className="ac-search">
                <Search size={16} />
                <input
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              {filters.map((f) => (
                <Dropdown
                  compact
                  key={f.label}
                  aria-label={f.label}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
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
                    <tr
                      key={u.id}
                      className="click"
                      onClick={() => router.push(`/admin/users/${u.id}`)}
                    >
                      <td>
                        <div className="ac-person">
                          <Avatar initials={initials(u.name)} small />
                          <div>
                            <strong>
                              {u.name}
                              <VerifiedBadge type={u.badge} />
                            </strong>
                            <small>{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge value={u.accountStatus} />
                        {!!u.warningCount && (
                          <small style={{ display: "block", marginTop: 4 }}>
                            {u.warningCount} warning
                            {u.warningCount === 1 ? "" : "s"}
                          </small>
                        )}
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
                      <td className="nowrap">
                        {when(u.createdAt).split(",")[0]}
                      </td>
                      <td className="nowrap">{ago(u.lastLoginAt)}</td>
                      <td className="act" onClick={(e) => e.stopPropagation()}>
                        {u.id !== me?.id && (
                          <button
                            className="ac-btn sm"
                            onClick={() => suspend(u)}
                          >
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
        </>
      )}
      {id && message && <p className="adm-error">{message}</p>}
      {id && !detail && !message && <p className="ac-muted">Loading…</p>}
      {id && detail && (
        <DetailPage
          backHref="/admin/users"
          backLabel="All users"
          hero={
            <>
              <div className="ac-hero-id">
                <Avatar
                  initials={initials(detail.name)}
                  src={detail.profileImageUrl}
                />
                <div>
                  <h1>
                    {detail.name}
                    <VerifiedBadge type={detail.badge} size={22} />
                  </h1>
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
                    {!!detail.warningCount && (
                      <Badge
                        value="warning"
                        label={`${detail.warningCount} warning${detail.warningCount === 1 ? "" : "s"}`}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="ac-hero-stats">
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
            </>
          }
          aside={
            <>
              <section className="ac-card">
                <h3>Account</h3>
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
              </section>
              <section className="ac-card">
                <h3>Actions</h3>
                <div className="ac-side-actions">
                  {detail.badge !== "blue" && (
                    <button
                      className="ac-btn"
                      onClick={() =>
                        patch(
                          detail,
                          { badge: "blue" },
                          {
                            title: "Give the blue badge?",
                            message: `${detail.name} will show a blue verified tick next to their name.`,
                            confirmLabel: "Give blue badge",
                          },
                        )
                      }
                    >
                      <BadgeCheck size={15} /> Blue badge (member)
                    </button>
                  )}
                  {detail.badge !== "gold" && (
                    <button
                      className="ac-btn"
                      onClick={() =>
                        patch(
                          detail,
                          { badge: "gold" },
                          {
                            title: "Give the gold badge?",
                            message: `${detail.name} will show a gold verified tick as a company or official account.`,
                            confirmLabel: "Give gold badge",
                          },
                        )
                      }
                    >
                      <BadgeCheck size={15} /> Gold badge (company)
                    </button>
                  )}
                  {detail.badge && (
                    <button
                      className="ac-btn"
                      onClick={() =>
                        patch(
                          detail,
                          { badge: null },
                          {
                            title: "Remove the badge?",
                            message: `${detail.name} will no longer show a verified tick.`,
                            confirmLabel: "Remove badge",
                          },
                        )
                      }
                    >
                      <BadgeCheck size={15} /> Remove badge
                    </button>
                  )}
                  {!detail.emailVerifiedAt && (
                    <>
                      <button
                        className="ac-btn"
                        onClick={() =>
                          post(
                            detail,
                            "send-verification",
                            `Verification email sent to ${detail.email}.`,
                            {
                              title: "Resend verification email?",
                              message: `A new verification link will be sent to ${detail.email}.`,
                              confirmLabel: "Send email",
                            },
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
                        {
                          title: "Send welcome email?",
                          message: `A welcome message will be sent to ${detail.email}.`,
                          confirmLabel: "Send email",
                        },
                      )
                    }
                  >
                    <Mail size={15} /> Send welcome email
                  </button>
                  {detail.id !== me?.id && (
                    <>
                      <button
                        className="ac-btn"
                        onClick={() => suspend(detail)}
                      >
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
                      <button
                        className="ac-btn"
                        onClick={() => toggleAdmin(detail)}
                      >
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
                        className="ac-btn"
                        onClick={() => setPwOpen(true)}
                      >
                        <KeyRound size={15} /> Change password
                      </button>
                      {pwOpen && (
                        <Dialog
                          label={`Change password for ${detail.name}`}
                          className="confirm-dialog"
                          onClose={closePw}
                        >
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              void setPassword(detail);
                            }}
                          >
                            <h2 className="confirm-title">
                              Change password for {detail.name}
                            </h2>
                            <p className="subtle-text">
                              Their current password stops working and they are
                              signed out everywhere.
                            </p>
                            <div className="pw-form">
                              <PasswordField
                                label="New password"
                                value={pw}
                                onChange={(v) => {
                                  setPw(v);
                                  setPwError("");
                                }}
                                autoComplete="new-password"
                                autoFocus
                                placeholder="At least 12 characters"
                                visible={pwShow}
                                onToggle={() => setPwShow(!pwShow)}
                              />
                              <PasswordStrength
                                password={pw}
                                name={detail.name}
                                email={detail.email}
                              />
                              <PasswordField
                                label="Confirm new password"
                                value={pw2}
                                onChange={(v) => {
                                  setPw2(v);
                                  setPwError("");
                                }}
                                autoComplete="new-password"
                                placeholder="Enter the password again"
                                visible={pwShow}
                                showToggle={false}
                              />
                              {pwError && (
                                <p className="auth-error" role="alert">
                                  {pwError}
                                </p>
                              )}
                            </div>
                            <div className="confirm-actions">
                              <button
                                type="button"
                                className="secondary"
                                onClick={closePw}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="primary"
                                disabled={!pw || !pw2}
                              >
                                Set password
                              </button>
                            </div>
                          </form>
                        </Dialog>
                      )}
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
                          await post(
                            detail,
                            "revoke-sessions",
                            "Sessions revoked.",
                          );
                          void open(detail.id);
                        }}
                      >
                        <LogOut size={15} /> Revoke sessions
                      </button>
                    </>
                  )}
                  {detail.id !== me?.id && (
                    <>
                      <hr className="ac-divider" />
                      {detail.accountStatus !== "deactivated" && (
                        <button
                          className="ac-btn danger"
                          onClick={() => void softDelete(detail)}
                        >
                          <Trash2 size={15} /> Delete account
                        </button>
                      )}
                      <button
                        className="ac-btn danger"
                        onClick={() => void forceDelete(detail)}
                      >
                        <Skull size={15} /> Force delete
                      </button>
                    </>
                  )}
                </div>
              </section>
            </>
          }
        >
          <section className="ac-card">
            <h3>Recent posts</h3>
            {detail.recentPosts.length === 0 ? (
              <p className="ac-muted">No posts yet.</p>
            ) : (
              <ul className="ac-recent">
                {detail.recentPosts.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/content/${p.id}`}>
                      <span>{p.excerpt}</span>
                      <small>{ago(p.createdAt)}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </DetailPage>
      )}
    </>
  );
}
