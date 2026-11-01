"use client";
import { usePlatform } from "@/providers/platform-provider";
import { Compass, House, Menu, MessagesSquare, Plus } from "lucide-react";

// Mobile-only tab bar. Everything else lives behind "More" (the drawer).
export default function BottomNav() {
  const { section, navigate, setComposer, unreadMessageCount, currentUser } =
    usePlatform();

  const tab = (label: string, text: string, Icon: typeof House) => (
    <button
      key={label}
      type="button"
      className={section === label ? "selected" : ""}
      aria-current={section === label ? "page" : undefined}
      onClick={() => navigate(label)}
    >
      <Icon size={22} strokeWidth={section === label ? 2.2 : 1.8} />
      <span>{text}</span>
      {label === "Messages" && unreadMessageCount > 0 && (
        <i className="bottom-nav-count">
          {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
        </i>
      )}
    </button>
  );

  return (
    <nav className="bottom-nav" aria-label="Main">
      {tab("Home", "Home", House)}
      {tab("Explore", "Explore", Compass)}
      <button
        type="button"
        className="bottom-nav-create"
        aria-label="Create a post"
        onClick={() => {
          if (!currentUser) {
            window.location.assign(
              `/login?next=${encodeURIComponent(window.location.pathname)}`,
            );
            return;
          }
          setComposer(true);
        }}
      >
        <span className="bottom-nav-fab">
          <Plus size={24} strokeWidth={2.4} />
        </span>
      </button>
      {tab("Messages", "Chats", MessagesSquare)}
      {tab("More", "More", Menu)}
    </nav>
  );
}
