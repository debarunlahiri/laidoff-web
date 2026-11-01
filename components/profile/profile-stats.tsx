import type { ApiProfileStats } from "@/lib/api-types";
import {
  BriefcaseBusiness,
  FileText,
  Handshake,
  ThumbsDown,
  ThumbsUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ProfileSection =
  "posts" | "likes" | "dislikes" | "referrals" | "followers" | "connections";

export const sectionTitles: Record<ProfileSection, string> = {
  posts: "Posts",
  likes: "Likes received",
  dislikes: "Dislikes received",
  referrals: "Referrals",
  followers: "Followers",
  connections: "Connections",
};

// Public activity totals for a member (anonymous posts are never counted).
// Each tile opens its list below. Who liked or disliked is private to the member.
export default function ProfileStats({
  stats,
  active,
  onSelect,
  own,
}: {
  stats: ApiProfileStats;
  active: ProfileSection;
  onSelect: (section: ProfileSection) => void;
  own: boolean;
}) {
  const items: {
    key: ProfileSection;
    value: number;
    icon: LucideIcon;
    private?: boolean;
  }[] = [
    { key: "posts", value: stats.posts, icon: FileText },
    { key: "likes", value: stats.likesReceived, icon: ThumbsUp, private: true },
    {
      key: "dislikes",
      value: stats.dislikesReceived,
      icon: ThumbsDown,
      private: true,
    },
    { key: "referrals", value: stats.referrals, icon: BriefcaseBusiness },
    { key: "followers", value: stats.followers, icon: Users },
    { key: "connections", value: stats.connections, icon: Handshake },
  ];
  return (
    <section className="pf-activity card" aria-label="Activity">
      {items.map(({ key, value, icon: Icon, private: isPrivate }) => {
        const content = (
          <>
            <Icon size={16} aria-hidden="true" />
            <strong>{value.toLocaleString()}</strong>
            <span>{sectionTitles[key]}</span>
          </>
        );
        // Other members only see the totals for likes and dislikes.
        if (isPrivate && !own)
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
            aria-label={`${sectionTitles[key]}: ${value}. View list`}
            onClick={() => onSelect(key)}
          >
            {content}
          </button>
        );
      })}
    </section>
  );
}
