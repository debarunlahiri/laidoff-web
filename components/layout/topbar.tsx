"use client";
import AccountMenu from "@/components/layout/account-menu";
import { usePlatform } from "@/providers/platform-provider";
import {
  ArrowRight,
  Bell,
  ThumbsUp,
  Menu,
  Search,
  UserPlus,
  X,
} from "lucide-react";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const {
    section,
    setSection,
    search,
    setSearch,
    notifications,
    setNotifications,
    setAccountOpen,
    mobileNav,
    setMobileNav,
    navigate,
    notificationItems,
    notificationCount,
    notificationsLoading,
    notificationsError,
    notificationsHasMore,
    loadMoreNotifications,
    markNotificationRead,
  } = usePlatform();

  const notificationTrigger = useRef<HTMLButtonElement>(null);
  const notificationPanel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setNotifications(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!notifications) return;
    function outside(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !notificationTrigger.current?.contains(target) &&
        !notificationPanel.current?.contains(target)
      )
        setNotifications(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotifications(false);
        notificationTrigger.current?.focus();
      }
    }
    function focusOutside(event: FocusEvent) {
      const target = event.target as Node;
      if (
        !notificationTrigger.current?.contains(target) &&
        !notificationPanel.current?.contains(target)
      )
        setNotifications(false);
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    document.addEventListener("focusin", focusOutside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("focusin", focusOutside);
    };
  }, [notifications]);

  return (
    <header className="topbar">
      <button
        className="icon-button mobile-menu"
        aria-label="Open navigation"
        onClick={() => setMobileNav(!mobileNav)}
      >
        <Menu />
      </button>
      <label className="search-box topbar-search">
        <Search size={17} />
        <input
          aria-label="Search the community"
          placeholder="Search LayoffCircle"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            if (section !== "Home" && section !== "Explore") {
              setSection("Explore");
            }
          }}
        />
      </label>
      <div className="header-actions">
        <button
          ref={notificationTrigger}
          className="notification-button icon-button"
          aria-label="Notifications"
          aria-expanded={notifications}
          aria-controls={notifications ? "notification-panel" : undefined}
          onClick={() => setNotifications(!notifications)}
        >
          <Bell size={20} />
          {notificationCount > 0 && <i />}
        </button>
        <span className="header-divider" />
        <AccountMenu />
      </div>
      {notifications && (
        <div
          ref={notificationPanel}
          className="notification-panel card"
          id="notification-panel"
          role="region"
          aria-label="Notifications"
        >
          <div className="notification-panel-heading">
            <h3>You’re making connections</h3>
            <button
              className="icon-button"
              aria-label="Close notifications"
              onClick={() => {
                setNotifications(false);
                notificationTrigger.current?.focus();
              }}
            >
              <X size={18} />
            </button>
          </div>
          {notificationsLoading && <p role="status">Loading notifications…</p>}
          {notificationsError && <p role="alert">{notificationsError}</p>}
          {!notificationsLoading && !notificationItems.length && (
            <p>You’re all caught up.</p>
          )}
          {notificationItems.map((item) => (
            <button
              className="notification-item"
              key={item.id}
              onClick={() => {
                void markNotificationRead(item.id);
                setNotifications(false);
                navigate(
                  item.type === "message"
                    ? "Messages"
                    : item.type.startsWith("referral")
                      ? "Referrals"
                      : item.type.startsWith("connection")
                        ? "My network"
                        : "Home",
                );
              }}
            >
              {item.type === "like" ? (
                <ThumbsUp size={18} />
              ) : (
                <Bell size={18} />
              )}
              <span>
                {item.text}
                {!item.readAt && <small>Unread</small>}
              </span>
            </button>
          ))}
          {notificationsHasMore && (
            <button
              className="text-button"
              onClick={() => void loadMoreNotifications()}
            >
              Load more
            </button>
          )}
          {notificationCount > 0 && (
            <button
              className="text-button"
              onClick={() => void markNotificationRead()}
            >
              Mark all as read
            </button>
          )}
        </div>
      )}
    </header>
  );
}
