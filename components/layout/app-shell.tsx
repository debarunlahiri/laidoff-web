"use client";

import SignInDialog from "@/components/auth/sign-in-dialog";
import PostReportDialog from "@/components/feed/post-report-dialog";
import NoteDialog from "@/components/community-notes/note-dialog";
import PostComposerDialog from "@/components/feed/post-composer-dialog";
import ReferralRequestsDialog from "@/components/referrals/referral-requests-dialog";
import ReferralRequestFormDialog from "@/components/referrals/referral-request-form-dialog";
import MessagingDock from "@/components/messages/messaging-dock";
import PageHeading from "@/components/layout/page-heading";
import RightRail from "@/components/layout/right-rail";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import BottomNav from "@/components/layout/bottom-nav";
import Toast from "@/components/ui/toast";
import { usePlatform } from "@/providers/platform-provider";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: ReactNode }) {
  const { section } = usePlatform();
  const pathname = usePathname();
  const showRightRail = section === "Home";
  const [collapsed, setCollapsed] = useState(false);

  // Remember the choice per viewer; storage can be blocked, so guard it.
  useEffect(() => {
    try {
      setCollapsed(
        localStorage.getItem("layoffcircle:sidebar") === "collapsed",
      );
    } catch {}
  }, []);
  // Bring a tapped tab to the middle of its scrolling strip.
  useEffect(() => {
    function centreTab(event: MouseEvent) {
      const tab = (event.target as HTMLElement).closest<HTMLElement>(
        ".discovery-tabs > button, .feed-tabs > button, .profile-tabs > button",
      );
      tab?.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
    }
    document.addEventListener("click", centreTab);
    return () => document.removeEventListener("click", centreTab);
  }, []);
  function toggleSidebar() {
    setCollapsed((current) => {
      try {
        localStorage.setItem(
          "layoffcircle:sidebar",
          current ? "expanded" : "collapsed",
        );
      } catch {}
      return !current;
    });
  }

  return (
    <div className={`app-shell${collapsed ? " sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="workspace">
        <Topbar />
        <div
          className={`page-layout${showRightRail ? "" : " page-layout-without-rail"}${section === "Messages" || section === "Search" ? " page-layout-wide" : ""}`}
        >
          <main key={pathname} className="page-transition">
            <PageHeading />
            {children}
          </main>
          {showRightRail && <RightRail />}
        </div>
      </div>
      <PostComposerDialog />
      <ReferralRequestsDialog />
      <ReferralRequestFormDialog />
      <NoteDialog />
      <PostReportDialog />
      <SignInDialog />
      <BottomNav />
      <MessagingDock />
      <Toast />
    </div>
  );
}
