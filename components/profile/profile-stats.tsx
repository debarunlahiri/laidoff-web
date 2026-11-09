import type { ApiProfileStats } from "@/lib/api-types";
import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FileText,
  Handshake,
  UserPlus,
  ThumbsDown,
  ThumbsUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ProfileSection =
  | "posts"
  | "likes"
  | "dislikes"
  | "referrals"
  | "followers"
  | "following"
  | "connections";

export const sectionTitles: Record<ProfileSection, string> = {
  posts: "Posts",
  likes: "Likes received",
  dislikes: "Dislikes received",
  referrals: "Referrals",
  followers: "Followers",
  following: "Following",
  connections: "Connections",
};

// Public activity totals for a member (anonymous posts are never counted).
// Each button opens its list below. Who liked or disliked is private to the member.
export default function ProfileStats({
  stats,
  active,
  onSelect,
  own,
}: {
  stats: ApiProfileStats | null;
  active: ProfileSection;
  onSelect: (section: ProfileSection) => void;
  own: boolean;
}) {
  const items: {
    key: ProfileSection;
    value: number | null | undefined;
    icon: LucideIcon;
    private?: boolean;
  }[] = [
    { key: "posts", value: stats?.posts, icon: FileText },
    {
      key: "likes",
      value: stats?.likesReceived,
      icon: ThumbsUp,
      private: true,
    },
    {
      key: "dislikes",
      value: stats?.dislikesReceived,
      icon: ThumbsDown,
      private: true,
    },
    { key: "referrals", value: stats?.referrals, icon: BriefcaseBusiness },
    { key: "followers", value: stats?.followers, icon: Users },
    { key: "following", value: stats?.following, icon: UserPlus },
    { key: "connections", value: stats?.connections, icon: Handshake },
  ];
  const scroller = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () =>
      setEdges({
        left: el.scrollLeft > 2,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [stats]);
  function scrollBy(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.7,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <div className="pf-activity-wrap">
      {edges.left && (
        <button
          type="button"
          className="pf-activity-arrow left"
          aria-label="Scroll activity left"
          onClick={() => scrollBy(-1)}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
      )}
      {edges.right && (
        <button
          type="button"
          className="pf-activity-arrow right"
          aria-label="Scroll activity right"
          onClick={() => scrollBy(1)}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      )}
      <section
        className="pf-activity"
        aria-label="Community activity"
        ref={scroller}
      >
        {items.map(({ key, value, icon: Icon, private: isPrivate }) => {
          const content = (
            <>
              <span className="pf-stat-icon">
                <Icon size={19} aria-hidden="true" />
              </span>
              <span className="pf-stat-label">{sectionTitles[key]}</span>
              <strong className="pf-stat-value">
                {value === undefined
                  ? "—"
                  : value === null
                    ? "Private"
                    : value.toLocaleString()}
              </strong>
            </>
          );
          // Other members only see the totals for likes and dislikes.
          if ((isPrivate && !own) || value === null)
            return (
              <div className="pf-stat" key={key}>
                {content}
              </div>
            );
          return (
            <button
              type="button"
              key={key}
              className={`pf-stat is-button${active === key ? " selected" : ""}`}
              aria-pressed={active === key}
              aria-label={`${sectionTitles[key]}: ${value === undefined ? "Count unavailable" : value}. View list`}
              onClick={() => onSelect(key)}
            >
              {content}
            </button>
          );
        })}
      </section>
    </div>
  );
}
