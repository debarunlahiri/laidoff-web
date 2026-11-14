"use client";
import Notice from "./notice";
import { api, apiMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Clock,
  Flame,
  Hash,
  Settings2,
  TrendingUp,
  Users,
} from "lucide-react";
import { Empty, PageHeader, Panel } from "./ui";
import { Toggle } from "./ui";

type TopicStat = { topic: string; total: number; pct: number };
type FeedStats = {
  totalPosts: number;
  totalComments: number;
  topTopics: TopicStat[];
  recentHashtags: { tag: string; total: number }[];
  activeLast7: number;
  postsLast7: number;
  avgEngagement: number;
};

export default function AlgorithmPage() {
  const [stats, setStats] = useState<FeedStats | null>(null);
  const [error, setError] = useState("");
  const [showAnon, setShowAnon] = useState(true);
  const [boostReferrals, setBoostReferrals] = useState(true);
  const [decayDays, setDecayDays] = useState(3);

  useEffect(() => {
    let live = true;
    Promise.all([
      api<{
        totals: { posts: number; comments: number };
        topTopics: { topic: string; total: number }[];
        series: { users: number; posts: number }[];
      }>("/admin/analytics?days=30"),
      api<{ days: number; trending: { tag: string; total: number }[] }>(
        "/admin/hashtags?days=7",
      ),
    ]).then(
      ([analytics, hashtags]) => {
        if (!live) return;
        const totalPosts = analytics.totals.posts;
        const topTopics: TopicStat[] = analytics.topTopics.map((t) => ({
          topic: t.topic,
          total: t.total,
          pct: totalPosts ? Math.round((t.total / totalPosts) * 100) : 0,
        }));
        setStats({
          totalPosts,
          totalComments: analytics.totals.comments,
          topTopics,
          recentHashtags: hashtags.trending.slice(0, 10),
          activeLast7: analytics.series.reduce((s, r) => s + r.users, 0),
          postsLast7: analytics.series.reduce((s, r) => s + r.posts, 0),
          avgEngagement: totalPosts
            ? Math.round((analytics.totals.comments / totalPosts) * 10) / 10
            : 0,
        });
        setError("");
      },
      (e) => live && setError(apiMessage(e)),
    );
    return () => {
      live = false;
    };
  }, []);

  const maxTopic = Math.max(
    1,
    ...(stats?.topTopics.map((t) => t.total) ?? [1]),
  );

  return (
    <>
      <PageHeader
        title="Feed algorithm"
        description="Content distribution settings and engagement signal overview. Changes here are stored locally and applied on next deploy."
      />
      <Notice message={error} onClose={() => setError("")} />

      {stats && (
        <div className="ac-kpis" style={{ marginBottom: 20 }}>
          <div className="ac-kpi">
            <div className="ac-kpi-top">
              <span
                className="ac-kpi-icon"
                style={{
                  color: "#3159df",
                  background: "color-mix(in srgb, #3159df 14%, transparent)",
                }}
              >
                <BarChart3 size={18} />
              </span>
            </div>
            <strong>{stats.totalPosts.toLocaleString()}</strong>
            <span className="ac-kpi-label">Total posts</span>
            <span className="ac-trend flat">&nbsp;</span>
          </div>
          <div className="ac-kpi">
            <div className="ac-kpi-top">
              <span
                className="ac-kpi-icon"
                style={{
                  color: "#7c3aed",
                  background: "color-mix(in srgb, #7c3aed 14%, transparent)",
                }}
              >
                <TrendingUp size={18} />
              </span>
            </div>
            <strong>{stats.postsLast7.toLocaleString()}</strong>
            <span className="ac-kpi-label">Posts last 7 days</span>
            <span className="ac-trend flat">&nbsp;</span>
          </div>
          <div className="ac-kpi">
            <div className="ac-kpi-top">
              <span
                className="ac-kpi-icon"
                style={{
                  color: "#16a34a",
                  background: "color-mix(in srgb, #16a34a 14%, transparent)",
                }}
              >
                <Users size={18} />
              </span>
            </div>
            <strong>{stats.avgEngagement}</strong>
            <span className="ac-kpi-label">Avg comments / post</span>
            <span className="ac-trend flat">&nbsp;</span>
          </div>
        </div>
      )}

      <div className="ac-grid-2">
        <Panel
          title="Feed settings"
          description="Controls applied to the community feed ranking"
        >
          <div className="ac-settings-group">
            <Toggle
              label="Show anonymous posts"
              checked={showAnon}
              onChange={setShowAnon}
              hint="When off, anonymous posts are suppressed from the main feed."
            />
            <Toggle
              label="Boost referral posts"
              checked={boostReferrals}
              onChange={setBoostReferrals}
              hint="Referral posts get a ranking boost to increase visibility."
            />
            <div className="ac-setting-row">
              <div>
                <strong>Content freshness decay (days)</strong>
                <small>
                  Posts older than this many days score lower in the feed.
                </small>
              </div>
              <div className="ac-setting-control">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={decayDays}
                  onChange={(e) => setDecayDays(Number(e.target.value))}
                  style={{ width: 64, textAlign: "center" }}
                />
              </div>
            </div>
          </div>
          <div className="ac-settings-note">
            <Settings2 size={13} />
            These settings are informational. Wire them to your feed query to
            activate ranking changes.
          </div>
        </Panel>

        <Panel
          title="Engagement signals"
          description="How the community is responding to content"
        >
          <ul className="ac-signal-list">
            <li>
              <span>
                <Flame size={14} /> High-engagement topics
              </span>
              <div
                className="ac-cell-badges"
                style={{ flexWrap: "wrap", gap: 6, marginTop: 4 }}
              >
                {stats?.topTopics.slice(0, 4).map((t) => (
                  <span key={t.topic} className="ac-tag-chip">
                    {t.topic} <em>{t.pct}%</em>
                  </span>
                ))}
              </div>
            </li>
            <li>
              <span>
                <Hash size={14} /> Trending hashtags (7 days)
              </span>
              <div
                className="ac-cell-badges"
                style={{ flexWrap: "wrap", gap: 6, marginTop: 4 }}
              >
                {stats?.recentHashtags.slice(0, 6).map((t) => (
                  <span key={t.tag} className="ac-tag-chip">
                    #{t.tag} <em>{t.total}</em>
                  </span>
                ))}
                {!stats?.recentHashtags.length && (
                  <span className="ac-muted">No hashtags yet</span>
                )}
              </div>
            </li>
            <li>
              <span>
                <Clock size={14} /> Peak posting window
              </span>
              <span className="ac-muted" style={{ fontSize: 13 }}>
                Requires hourly breakdown data
              </span>
            </li>
          </ul>
        </Panel>
      </div>

      {stats && (
        <Panel
          title="Topic distribution"
          description="Share of posts per topic"
        >
          {stats.topTopics.length ? (
            <ul className="ac-bars">
              {stats.topTopics.map((t) => (
                <li key={t.topic}>
                  <span style={{ minWidth: 160 }}>{t.topic}</span>
                  <span className="ac-bar">
                    <i style={{ width: `${(t.total / maxTopic) * 100}%` }} />
                  </span>
                  <strong>{t.total}</strong>
                  <small style={{ color: "var(--muted)" }}>{t.pct}%</small>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No posts yet" />
          )}
        </Panel>
      )}
    </>
  );
}
