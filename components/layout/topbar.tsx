"use client";
import AccountMenu from "@/components/layout/account-menu";
import { usePlatform } from "@/providers/platform-provider";
import { ArrowRight, Bell, Menu, Search, UserPlus, X } from "lucide-react";

import SearchBox from "@/components/search/search-box";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import NotificationRow from "@/components/notifications/notification-row";
import { notificationMeta } from "@/lib/notification-meta";
import type { ApiNotification } from "@/lib/api-types";

export default function Topbar() {
  const {
    currentUser,
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
    markNotificationRead,
  } = usePlatform();

  const notificationTrigger = useRef<HTMLButtonElement>(null);
  const notificationPanel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

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
      <Suspense
        fallback={
          <label className="search-box topbar-search">
            <Search size={17} />
            <input
              aria-label="Search the community"
              placeholder="Search LayoffCircle"
              disabled
            />
          </label>
        }
      >
        <SearchBox />
      </Suspense>
      <div className="header-actions">
        <div className="notification-anchor">
          <button
            ref={notificationTrigger}
            className="notification-button icon-button"
            aria-label="Notifications"
            aria-expanded={notifications}
            aria-controls={notifications ? "notification-panel" : undefined}
            onClick={() => {
              if (!currentUser) {
                window.location.assign(
                  `/login?next=${encodeURIComponent(pathname)}`,
                );
                return;
              }
              setNotifications(!notifications);
            }}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <i aria-label={`${notificationCount} unread`}>
                {notificationCount > 9 ? "9+" : notificationCount}
              </i>
            )}
          </button>
          {notifications && (
            <div
              ref={notificationPanel}
              className="notification-panel card"
              id="notification-panel"
              role="region"
              aria-label="Notifications"
            >
              <div className="notification-panel-heading">
                <h3>
                  Notifications
                  {notificationCount > 0 && (
                    <span className="new-badge">{notificationCount} new</span>
                  )}
                </h3>
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
              {notificationsLoading && !notificationItems.length && (
                <p role="status">Loading notifications…</p>
              )}
              {notificationsError && <p role="alert">{notificationsError}</p>}
              {!notificationsLoading && !notificationItems.length && (
                <p>You’re all caught up.</p>
              )}
              {notificationItems.slice(0, 5).map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onOpen={(row: ApiNotification) => {
                    if (!row.readAt) void markNotificationRead(row.id);
                    setNotifications(false);
                    router.push(notificationMeta(row).href);
                  }}
                />
              ))}
              <div className="notification-panel-footer">
                {notificationCount > 0 ? (
                  <button
                    className="text-button"
                    onClick={() => void markNotificationRead()}
                  >
                    Mark all as read
                  </button>
                ) : (
                  <span />
                )}
                <Link
                  className="text-button"
                  href="/notifications"
                  onClick={() => setNotifications(false)}
                >
                  See all notifications <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
        <span className="header-divider" />
        <AccountMenu />
      </div>
    </header>
  );
}
