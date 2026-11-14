"use client";
import Notice from "./notice";
import { Dropdown } from "./dropdown";
import { api, apiMessage, queryPath } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Flame,
  Flag,
  Hash,
  Heart,
  Pencil,
  Plus,
  Trash2,
  MessageSquare,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Badge,
  Empty,
  PageHeader,
  Panel,
  Segmented,
  ago,
  useDebounced,
  when,
} from "./ui";
import Link from "next/link";
import { useConfirm } from "@/providers/confirm-provider";
import { tagIcon } from "./tag-icons";
import { InfiniteFooter, useInfiniteList } from "./use-infinite-list";

type Look = {
  emoji?: string;
  iconName?: string;
  accentColor?: string;
  displayName?: string;
  featured?: boolean;
};
type Tag = { tag: string; total: number; lastUsed?: string } & Look;
type CatalogEntry = { tag: string; description?: string } & Look;
type Data = {
  days: number;
  trending: Tag[];
  allTime: Tag[];
  catalog: CatalogEntry[];
};

/** Emoji if set, otherwise the chosen icon (or a plain #), tinted with the accent. */
function TagBadge({ look, size = 16 }: { look: Look; size?: number }) {
  const Icon = tagIcon(look.iconName);
  return (
    <span
      className="ac-tagbadge"
      style={{ ["--tag" as string]: look.accentColor || undefined }}
    >
      {look.emoji ? (
        <span aria-hidden>{look.emoji}</span>
      ) : (
        <Icon size={size} aria-hidden />
      )}
    </span>
  );
}
type Post = {
  id: string;
  excerpt: string;
  topic: string;
  company: string | null;
  isAnonymous: boolean;
  hasPoll: boolean;
  createdAt: string;
  authorName: string;
  comments: number;
  likes: number;
  dislikes: number;
  reports: number;
  images: string[];
};
type Detail = {
  tag: string;
  total: number;
  items: Post[];
  stats: {
    posts: number;
    authors: number;
    firstUsed: string | null;
    lastUsed: string | null;
    last7: number;
    likes: number;
    comments: number;
  };
};

const LIMIT = 10;

/** Highlights the selected hashtag inside a post's text. */
function Highlight({ text, tag }: { text: string; tag: string }) {
  const parts = text.split(new RegExp(`(#${tag}(?![A-Za-z0-9_]))`, "i"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === `#${tag}` ? (
          <mark key={i} className="ac-tag-mark">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function TagDetail({ tag, onBack }: { tag: string; onBack: () => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const q = useDebounced(search);
  const feed = useInfiniteList<Post>(
    `/admin/hashtags/${encodeURIComponent(tag)}/posts`,
    { search: q, filter, sort },
    LIMIT,
  );
  const { data, error, setError, loading } = feed;
  // The endpoint also returns `stats`; keep the latest copy alongside the rows.
  const [stats, setStats] = useState<Detail["stats"] | null>(null);
  useEffect(() => {
    let live = true;
    api<Detail>(
      queryPath(`/admin/hashtags/${encodeURIComponent(tag)}/posts`, {
        limit: 1,
      }),
    ).then(
      (r) => live && setStats(r.stats),
      () => {},
    );
    return () => {
      live = false;
    };
  }, [tag]);

  const s = stats;
  return (
    <>
      <button className="ac-back" onClick={onBack}>
        <ArrowLeft size={15} /> All hashtags
      </button>
      <PageHeader
        title={`#${tag}`}
        description="Every post that uses this hashtag, with engagement and moderation signals."
        actions={
          <Link
            href={`/admin/hashtags/${encodeURIComponent(tag)}/edit`}
            className="ac-btn"
          >
            <Pencil size={14} /> Edit emoji & icon
          </Link>
        }
      />
      <Notice message={error} onClose={() => setError("")} />

      <div className="ac-tagstats">
        <div>
          <span>
            <Hash size={14} /> Posts
          </span>
          <strong>{s?.posts ?? "–"}</strong>
        </div>
        <div>
          <span>
            <Users size={14} /> Authors
          </span>
          <strong>{s?.authors ?? "–"}</strong>
        </div>
        <div>
          <span>
            <Flame size={14} /> Last 7 days
          </span>
          <strong>{s?.last7 ?? "–"}</strong>
        </div>
        <div>
          <span>
            <Heart size={14} /> Likes
          </span>
          <strong>{s?.likes ?? "–"}</strong>
        </div>
        <div>
          <span>
            <MessageSquare size={14} /> Comments
          </span>
          <strong>{s?.comments ?? "–"}</strong>
        </div>
        <div>
          <span>
            <CalendarDays size={14} /> First used
          </span>
          <strong className="sm">
            {s?.firstUsed ? ago(s.firstUsed) : "–"}
          </strong>
        </div>
      </div>

      <Panel flush>
        <div className="ac-toolbar ac-toolbar-wrap">
          <label className="ac-search">
            <Search size={16} />
            <input
              placeholder="Search post text or author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <Dropdown
            compact
            value={sort}
            aria-label="Sort posts"
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="likes">Most liked</option>
            <option value="comments">Most commented</option>
            <option value="reports">Most reported</option>
          </Dropdown>
          <Segmented
            value={filter}
            onChange={(v) => setFilter(v)}
            options={[
              { value: "all", label: "All" },
              { value: "reported", label: "Reported" },
              { value: "poll", label: "Polls" },
              { value: "images", label: "With photos" },
              { value: "anonymous", label: "Anonymous" },
            ]}
          />
        </div>

        <div className="ac-tagposts" aria-busy={loading}>
          {data.items.map((p) => (
            <article key={p.id} className="ac-tagpost">
              <header>
                <strong>{p.isAnonymous ? "Anonymous" : p.authorName}</strong>
                <span>· {ago(p.createdAt)}</span>
                <Badge value="muted" label={p.topic} />
                {p.company && <Badge value="muted" label={p.company} />}
                {p.hasPoll && <Badge value="muted" label="Poll" />}
                {p.images?.length > 0 && (
                  <Badge
                    value="muted"
                    label={`${p.images.length} photo${p.images.length > 1 ? "s" : ""}`}
                  />
                )}
                {p.reports > 0 && (
                  <Badge
                    value="bad"
                    label={`${p.reports} report${p.reports > 1 ? "s" : ""}`}
                  />
                )}
              </header>
              <p title={when(p.createdAt)}>
                <Highlight text={p.excerpt} tag={tag} />
              </p>
              <footer>
                <span>
                  <Heart size={13} /> {p.likes}
                </span>
                <span>
                  <MessageSquare size={13} /> {p.comments}
                </span>
                <span className={p.reports ? "bad" : ""}>
                  <Flag size={13} /> {p.reports}
                </span>
              </footer>
            </article>
          ))}
        </div>
        {!loading && !data.items.length && (
          <Empty
            title="No posts match"
            hint="Try a different search or filter."
          />
        )}
        <InfiniteFooter feed={feed} />
      </Panel>
    </>
  );
}

export default function HashtagsPage() {
  const [days, setDays] = useState<"7" | "30" | "90">("30");
  const [view, setView] = useState<"trending" | "alltime" | "catalog">(
    "trending",
  );
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const confirm = useConfirm();

  async function removeEntry(tag: string) {
    if (
      !(await confirm({
        title: `Remove #${tag} from the catalog?`,
        message:
          "Its emoji and icon are cleared. Posts using the hashtag are not affected.",
        confirmLabel: "Remove",
        tone: "danger",
      }))
    )
      return;
    try {
      await api(`/admin/hashtag-catalog/${encodeURIComponent(tag)}`, {
        method: "DELETE",
      });
      setTick((t) => t + 1);
    } catch (e) {
      setError(apiMessage(e));
    }
  }

  useEffect(() => {
    let live = true;
    api<Data>(`/admin/hashtags?days=${days}`).then(
      (r) => live && (setData(r), setError("")),
      (e) => live && setError(apiMessage(e)),
    );
    return () => {
      live = false;
    };
  }, [days, tick]);

  const all =
    view === "catalog"
      ? []
      : view === "trending"
        ? (data?.trending ?? [])
        : (data?.allTime ?? []);
  const tags = useMemo(
    () =>
      all.filter((t) =>
        t.tag.includes(filter.trim().replace(/^#/, "").toLowerCase()),
      ),
    [all, filter],
  );
  const max = Math.max(1, ...all.map((t) => t.total));
  const totalUses = all.reduce((sum, t) => sum + t.total, 0);

  if (selected)
    return <TagDetail tag={selected} onBack={() => setSelected(null)} />;

  return (
    <>
      <PageHeader
        title="Hashtags"
        description="Trending and all-time hashtags extracted from post content. Select one to explore its posts."
        actions={
          <>
            <Segmented
              value={days}
              onChange={setDays}
              options={[
                { value: "7", label: "7 days" },
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
              ]}
            />
            <Link href="/admin/hashtags/new" className="ac-btn primary">
              <Plus size={15} /> New hashtag
            </Link>
          </>
        }
      />
      <Notice message={error} onClose={() => setError("")} />

      {data && (
        <div className="ac-tagstats">
          <div>
            <span>
              <Hash size={14} /> Distinct tags
            </span>
            <strong>{all.length}</strong>
          </div>
          <div>
            <span>
              <TrendingUp size={14} /> Total uses
            </span>
            <strong>{totalUses.toLocaleString()}</strong>
          </div>
          <div>
            <span>
              <Flame size={14} /> Top hashtag
            </span>
            <strong className="sm">{all[0] ? `#${all[0].tag}` : "–"}</strong>
          </div>
        </div>
      )}

      {data && data.trending.length > 0 && (
        <div className="ac-tagcloud" aria-label="Trending now">
          <span className="ac-tagcloud-label">
            <TrendingUp size={13} /> Trending now
          </span>
          {data.trending.slice(0, 10).map((t) => (
            <button
              key={t.tag}
              className="ac-tag-chip"
              onClick={() => setSelected(t.tag)}
            >
              <TagBadge look={t} size={12} />#{t.tag}
              <em>{t.total}</em>
            </button>
          ))}
        </div>
      )}

      <Panel
        title={
          view === "trending"
            ? `Trending · last ${days} days`
            : view === "alltime"
              ? "All-time top hashtags"
              : "Hashtag catalog"
        }
        actions={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "trending", label: "Trending" },
              { value: "alltime", label: "All time" },
              { value: "catalog", label: "Catalog" },
            ]}
          />
        }
      >
        <label className="ac-search ac-tagfilter">
          <Search size={15} />
          <input
            placeholder="Filter hashtags…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </label>
        {view === "catalog" && data && (
          <ul className="ac-hashtag-list">
            {data.catalog
              .filter((c) =>
                c.tag.includes(filter.trim().replace(/^#/, "").toLowerCase()),
              )
              .map((c) => (
                <li key={c.tag} className="ac-catalogrow">
                  <TagBadge look={c} />
                  <div>
                    <strong>#{c.tag}</strong>
                    <small>
                      {[c.displayName, c.description]
                        .filter(Boolean)
                        .join(" · ") || "No details"}
                    </small>
                  </div>
                  {c.featured && <Badge value="warn" label="Featured" />}
                  <Link
                    href={`/admin/hashtags/${encodeURIComponent(c.tag)}/edit`}
                    className="ac-btn sm"
                  >
                    <Pencil size={13} /> Edit
                  </Link>
                  <button
                    className="ac-btn danger sm"
                    aria-label="Remove from catalog"
                    onClick={() => void removeEntry(c.tag)}
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            {!data.catalog.length && (
              <Empty
                title="Catalog is empty"
                hint="Add a hashtag with an emoji or icon to feature it here."
              />
            )}
          </ul>
        )}
        {view !== "catalog" && tags.length === 0 && !error && (
          <Empty
            title={filter ? "No matching hashtags" : "No hashtags found"}
            hint="Posts using #hashtags will appear here."
          />
        )}
        {view !== "catalog" && tags.length > 0 && (
          <ul className="ac-hashtag-list">
            {tags.map((tag, i) => (
              <li key={tag.tag}>
                <button
                  className="ac-hashtag-row"
                  onClick={() => setSelected(tag.tag)}
                >
                  <span
                    className={`ac-hashtag-rank${i < 3 && !filter ? " top" : ""}`}
                  >
                    {i + 1}
                  </span>
                  <span className="ac-hashtag-name">
                    <TagBadge look={tag} />#{tag.tag}
                    {tag.displayName && <em>{tag.displayName}</em>}
                  </span>
                  <span className="ac-hashtag-bar" aria-hidden>
                    <i
                      style={{
                        width: `${Math.max(4, (tag.total / max) * 100)}%`,
                      }}
                    />
                  </span>
                  <strong className="ac-hashtag-count">
                    {tag.total.toLocaleString()}
                    <small>{tag.total === 1 ? "post" : "posts"}</small>
                  </strong>
                  <span className="ac-hashtag-time">
                    {tag.lastUsed && (
                      <>
                        <Clock size={11} /> {ago(tag.lastUsed)}
                      </>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
