"use client";
import Dialog from "@/components/ui/dialog";
import Avatar from "@/components/ui/avatar";
import UserLink from "@/components/ui/user-link";
import { useApiList } from "@/hooks/use-api-resource";
import { displayDate, displayTime, initials } from "@/lib/api";
import type { ApiEngagementPerson, EngagementType } from "@/lib/api-types";
import { X } from "lucide-react";
import { useState } from "react";

const tabs: { type: EngagementType; label: string; empty: string }[] = [
  { type: "likes", label: "Likes", empty: "No likes yet." },
  { type: "dislikes", label: "Dislikes", empty: "No dislikes yet." },
  { type: "comments", label: "Comments", empty: "No comments yet." },
  { type: "shares", label: "Shares", empty: "Nobody has shared this yet." },
  { type: "reposts", label: "Reposts", empty: "No reposts yet." },
  { type: "views", label: "Views", empty: "Nobody has viewed this post yet." },
];

// Lists the members behind a post's counts. Opens on the tab that was clicked.
export default function EngagementDialog({
  postId,
  initialType,
  canSeeViews = false,
  onClose,
}: {
  postId: string;
  initialType: EngagementType;
  canSeeViews?: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState(initialType);
  const list = useApiList<ApiEngagementPerson>(
    `/posts/${postId}/engagement?type=${type}`,
  );
  const tab = tabs.find((item) => item.type === type)!;

  return (
    <Dialog label="People who engaged with this post" onClose={onClose}>
      <div className="modal-heading">
        <h2>Post activity</h2>
        <button className="icon-button" aria-label="Close" onClick={onClose}>
          <X size={21} />
        </button>
      </div>
      <div className="engagement-tabs" role="tablist">
        {tabs
          .filter((item) => canSeeViews || item.type !== "views")
          .map((item) => (
            <button
              key={item.type}
              role="tab"
              aria-selected={item.type === type}
              className={item.type === type ? "active" : ""}
              onClick={() => setType(item.type)}
            >
              {item.label}
            </button>
          ))}
      </div>
      <ul className="engagement-list">
        {list.data.map((person) => (
          <li key={person.id}>
            <UserLink id={person.id}>
              <Avatar
                initials={initials(person.name)}
                color="blue"
                src={person.profileImageUrl}
              />
              <span>
                <strong>{person.name}</strong>
                <small>{person.role || "Community member"}</small>
              </span>
            </UserLink>
            <time>
              {type === "comments" && person.count
                ? `${person.count} ${person.count === 1 ? "comment" : "comments"} · `
                : ""}
              {type === "views" ? (
                <>
                  Viewed {person.count} {person.count === 1 ? "time" : "times"}
                  <br />
                  {person.device} ·{" "}
                  {person.source === "feed" ? "feed" : "post page"}
                  <br />
                  First {displayDate(person.firstViewedAt ?? person.at)} · last{" "}
                  {displayDate(person.at)} {displayTime(person.at)}
                </>
              ) : (
                displayDate(person.at)
              )}
            </time>
          </li>
        ))}
      </ul>
      {list.loading && <p role="status">Loading…</p>}
      {list.error && <p role="alert">{list.error}</p>}
      {!list.loading && !list.error && list.data.length === 0 && (
        <p className="subtle-text">{tab.empty}</p>
      )}
      {list.hasMore && (
        <button className="text-button" onClick={() => void list.loadMore()}>
          Show more
        </button>
      )}
    </Dialog>
  );
}
