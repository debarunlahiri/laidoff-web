"use client";
import Avatar from "@/components/ui/avatar";
import { navigation } from "@/config/navigation";
import { usePlatform } from "@/providers/platform-provider";
import { Plus, Users } from "lucide-react";

export default function Sidebar() {
  const { section, setComposer, mobileNav, navigate, unreadMessageCount } =
    usePlatform();

  return (
    <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
      <a className="brand" href="/" aria-label="LayoffCircle home">
        <span className="brand-mark">
          <span />
          <span />
          <span />
        </span>
        Layoff<span>Circle</span>
        <span className="brand-dot" />
      </a>
      <div className="workspace-label">YOUR NEXT CHAPTER STARTS HERE</div>
      <nav>
        {navigation.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={section === label ? "nav-item selected" : "nav-item"}
            onClick={() => navigate(label)}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
            {label === "Messages" && unreadMessageCount > 0 && (
              <span className="nav-count">{unreadMessageCount}</span>
            )}
          </button>
        ))}
      </nav>
      <button className="primary create-post" onClick={() => setComposer(true)}>
        <Plus size={19} />
        Create a post
      </button>
      <div className="sidebar-community">
        <div className="little-orbit">
          <Users size={23} />
        </div>
        <h3>You’re in good company.</h3>
        <p>
          Different journeys.
          <br />A shared way forward.
        </p>
        <div className="avatar-stack">
          <Avatar initials="SC" color="peach" small />
          <Avatar initials="MJ" color="blue" small />
          <Avatar initials="AP" color="lavender" small />
          <span>+2k</span>
        </div>
        <small>People helping people, every day.</small>
      </div>
    </aside>
  );
}
