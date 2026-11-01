"use client";
import MemberPosts from "@/components/profile/member-posts";
import {
  MemberPeople,
  MemberReactions,
} from "@/components/profile/member-people";
import MemberReferrals from "@/components/profile/member-referrals";
import ProfileStats, {
  sectionTitles,
  type ProfileSection,
} from "@/components/profile/profile-stats";
import type { ApiProfileStats } from "@/lib/api-types";
import { useRef, useState } from "react";

// The activity tiles double as the tabs: picking one shows its list below.
export default function ProfileTabs({
  id,
  stats,
  own = false,
}: {
  id: string;
  stats: ApiProfileStats | null;
  own?: boolean;
}) {
  const [active, setActive] = useState<ProfileSection>("posts");
  const panel = useRef<HTMLDivElement>(null);
  function select(section: ProfileSection) {
    setActive(section);
    // Bring the list into view after it has rendered.
    requestAnimationFrame(() =>
      panel.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }
  return (
    <>
      {stats && (
        <ProfileStats
          stats={stats}
          active={active}
          onSelect={select}
          own={own}
        />
      )}
      <section className="profile-tabs" ref={panel}>
        <h2 className="profile-panel-title">{sectionTitles[active]}</h2>
        <div role="region" aria-label={sectionTitles[active]}>
          {active === "posts" && <MemberPosts id={id} />}
          {active === "referrals" && <MemberReferrals id={id} />}
          {active === "followers" && (
            <MemberPeople
              key="followers"
              path={`/users/${id}/followers`}
              emptyText="No followers yet."
            />
          )}
          {active === "connections" && (
            <MemberPeople
              key="connections"
              path={`/users/${id}/connections`}
              emptyText="No connections yet."
            />
          )}
          {active === "likes" && <MemberReactions id={id} type="like" />}
          {active === "dislikes" && <MemberReactions id={id} type="dislike" />}
        </div>
      </section>
    </>
  );
}
