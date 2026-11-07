"use client";
import { api, apiMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Flag,
  LoaderCircle,
  MessageSquare,
  Minus,
  UserCheck,
  UserPlus,
  Users,
  FileText,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import { AreaChart, Sparkline, type SeriesPoint } from "./charts";
import { Empty, PageHeader, Panel, Segmented } from "./ui";

type Win = { current: number; previous: number };
type Analytics = {
  days: number;
  totals: {
    users: number;
    activeUsers: number;
    suspendedUsers: number;
    activeLast7Days: number;
    posts: number;
    comments: number;
    openReferrals: number;
    messages: number;
    companies: number;
  };
  pending: {
    postReports: number;
    commentReports: number;
    workforceReports: number;
    pendingNotes?: number;
  };
  windows: { users: Win; posts: Win; comments: Win; referrals: Win };
  series: (SeriesPoint & {
    users: number;
    posts: number;
    comments: number;
    referrals: number;
  })[];
  topTopics: { topic: string; total: number }[];
};

function Trend({ win }: { win: Win }) {
  if (!win.previous && !win.current)
    return (
      <span className="ac-trend flat">
        <Minus size={12} /> No change
      </span>
    );
  if (!win.previous)
    return (
      <span className="ac-trend up">
        <ArrowUpRight size={12} /> New
      </span>
    );
  const pct = Math.round(((win.current - win.previous) / win.previous) * 100);
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  return (
    <span className={`ac-trend ${pct > 0 ? "up" : pct < 0 ? "down" : "flat"}`}>
      <Icon size={12} /> {Math.abs(pct)}% vs previous
    </span>
  );
}

export default function Dashboard() {
  const [days, setDays] = useState<"7" | "30" | "90">("30");
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    api<Analytics>(`/admin/analytics?days=${days}`).then(
      (r) => live && (setData(r), setError("")),
      (e) => live && setError(apiMessage(e)),
    );
    return () => {
      live = false;
    };
  }, [days]);

  const kpi = (
    label: string,
    value: number,
    Icon: LucideIcon,
    win: Win | null,
    key: "users" | "posts" | "comments" | "referrals" | null,
    color: string,
  ) => (
    <div className="ac-kpi">
      <div className="ac-kpi-top">
        <span
          className="ac-kpi-icon"
          style={{
            color,
            background: `color-mix(in srgb, ${color} 14%, transparent)`,
          }}
        >
          <Icon size={18} />
        </span>
        {key && data && (
          <Sparkline
            values={data.series.map((row) => row[key])}
            color={color}
          />
        )}
      </div>
      <strong>{value.toLocaleString()}</strong>
      <span className="ac-kpi-label">{label}</span>
      {win ? (
        <Trend win={win} />
      ) : (
        <span className="ac-trend flat">&nbsp;</span>
      )}
    </div>
  );

  const queue = data
    ? [
        {
          href: "/admin/moderation",
          label: "Post reports to review",
          value: data.pending.postReports,
          icon: Flag,
        },
        {
          href: "/admin/moderation",
          label: "Comment reports to review",
          value: data.pending.commentReports,
          icon: MessageSquare,
        },
        {
          href: "/admin/notes",
          label: "Community notes to review",
          value: data.pending.pendingNotes ?? 0,
          icon: FileText,
        },
        {
          href: "/admin/workforce",
          label: "Layoff reports to verify",
          value: data.pending.workforceReports,
          icon: BadgeCheck,
        },
        {
          href: "/admin/referrals",
          label: "Open referrals",
          value: data.totals.openReferrals,
          icon: Briefcase,
        },
      ]
    : [];
  const maxTopic = Math.max(1, ...(data?.topTopics.map((t) => t.total) ?? [1]));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="How the community is growing and what needs your attention."
        actions={
          <Segmented
            value={days}
            onChange={setDays}
            options={[
              { value: "7", label: "7 days" },
              { value: "30", label: "30 days" },
              { value: "90", label: "90 days" },
            ]}
          />
        }
      />
      {error && <p className="adm-error">{error}</p>}
      {!data && !error && <LoaderCircle className="auth-spinner" size={24} />}
      {data && (
        <>
          <div className="ac-kpis">
            {kpi(
              "Total members",
              data.totals.users,
              Users,
              data.windows.users,
              "users",
              "#3159df",
            )}
            {kpi(
              "Posts",
              data.totals.posts,
              FileText,
              data.windows.posts,
              "posts",
              "#7c3aed",
            )}
            {kpi(
              "Comments",
              data.totals.comments,
              MessageSquare,
              data.windows.comments,
              "comments",
              "#0891b2",
            )}
            {kpi(
              "Open referrals",
              data.totals.openReferrals,
              Handshake,
              data.windows.referrals,
              "referrals",
              "#d9822b",
            )}
          </div>

          <div className="ac-grid-2">
            <Panel
              title="Activity"
              description={`Daily new members, posts, comments and referrals · last ${data.days} days`}
            >
              <AreaChart
                data={data.series}
                keys={[
                  { key: "users", label: "Members", color: "#3159df" },
                  { key: "posts", label: "Posts", color: "#7c3aed" },
                  { key: "comments", label: "Comments", color: "#0891b2" },
                  { key: "referrals", label: "Referrals", color: "#d9822b" },
                ]}
              />
            </Panel>
            <Panel
              title="Needs attention"
              description="Work waiting on an admin"
            >
              <ul className="ac-queue">
                {queue.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href}>
                      <span className="ac-queue-icon">
                        <item.icon size={16} />
                      </span>
                      <span>{item.label}</span>
                      <strong className={item.value ? "has" : ""}>
                        {item.value}
                      </strong>
                      <ArrowRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className="ac-grid-3">
            <Panel title="Community health">
              <dl className="ac-facts">
                <div>
                  <dt>
                    <UserCheck size={14} /> Active in last 7 days
                  </dt>
                  <dd>{data.totals.activeLast7Days}</dd>
                </div>
                <div>
                  <dt>
                    <UserPlus size={14} /> Active accounts
                  </dt>
                  <dd>{data.totals.activeUsers}</dd>
                </div>
                <div>
                  <dt>
                    <Flag size={14} /> Suspended / deactivated
                  </dt>
                  <dd>{data.totals.suspendedUsers}</dd>
                </div>
                <div>
                  <dt>
                    <MessageSquare size={14} /> Messages sent
                  </dt>
                  <dd>{data.totals.messages.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>
                    <Handshake size={14} /> Companies
                  </dt>
                  <dd>{data.totals.companies}</dd>
                </div>
              </dl>
            </Panel>
            <Panel
              title="Popular topics"
              description={`Posts in the last ${data.days} days`}
            >
              {data.topTopics.length ? (
                <ul className="ac-bars">
                  {data.topTopics.map((t) => (
                    <li key={t.topic}>
                      <span>{t.topic}</span>
                      <span className="ac-bar">
                        <i
                          style={{ width: `${(t.total / maxTopic) * 100}%` }}
                        />
                      </span>
                      <strong>{t.total}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty title="No posts in this period" />
              )}
            </Panel>
            <Panel title="Quick links">
              <div className="ac-links">
                <Link href="/admin/users">
                  Manage members <ArrowRight size={14} />
                </Link>
                <Link href="/admin/referrals">
                  Browse referrals <ArrowRight size={14} />
                </Link>
                <Link href="/admin/hashtags">
                  Hashtag analytics <ArrowRight size={14} />
                </Link>
                <Link href="/admin/algorithm">
                  Feed algorithm <ArrowRight size={14} />
                </Link>
                <Link href="/admin/email">
                  Email templates <ArrowRight size={14} />
                </Link>
                <Link href="/admin/audit">
                  Audit trail <ArrowRight size={14} />
                </Link>
                <Link href="/admin/system">
                  System health <ArrowRight size={14} />
                </Link>
              </div>
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
