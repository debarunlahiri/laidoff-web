"use client";

import NoteDialog from "@/components/community-notes/note-dialog";
import PostComposerDialog from "@/components/feed/post-composer-dialog";
import ReferralComposerDialog from "@/components/referrals/referral-composer-dialog";
import PageHeading from "@/components/layout/page-heading";
import RightRail from "@/components/layout/right-rail";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import Toast from "@/components/ui/toast";
import { usePlatform } from "@/providers/platform-provider";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: ReactNode }) {
  const { section } = usePlatform();
  const pathname = usePathname();
  const showRightRail = section === "Home";

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="workspace">
        <Topbar />
        <div
          className={`page-layout${showRightRail ? "" : " page-layout-without-rail"}`}
        >
          <main key={pathname} className="page-transition">
            <PageHeading />
            {children}
          </main>
          {showRightRail && <RightRail />}
        </div>
      </div>
      <PostComposerDialog />
      <ReferralComposerDialog />
      <NoteDialog />
      <Toast />
    </div>
  );
}
