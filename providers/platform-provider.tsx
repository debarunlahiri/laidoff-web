"use client";

import { useCommunityNotes } from "@/hooks/use-community-notes";
import { useReferrals } from "@/hooks/use-referrals";
import { useFeed } from "@/hooks/use-feed";
import { useInterface } from "@/hooks/use-interface";
import { useMessages } from "@/hooks/use-messages";
import { useNetwork } from "@/hooks/use-network";
import { usePlatformNavigation } from "@/hooks/use-platform-navigation";
import { usePostComposer } from "@/hooks/use-post-composer";
import { useToast } from "@/hooks/use-toast";
import { useWorkforceInsights } from "@/hooks/use-workforce-insights";
import { createContext, useContext, type ReactNode } from "react";

function usePlatformState() {
  const navigation = usePlatformNavigation();
  const notifications = useToast();
  const referrals = useReferrals(notifications.notify);
  const network = useNetwork(notifications.notify);
  const feed = useFeed(
    navigation.section,
    navigation.search,
    network.following,
  );
  const composer = usePostComposer({
    setPosts: feed.setPosts,
    setTab: feed.setTab,
    navigate: navigation.navigate,
    notify: notifications.notify,
  });
  const communityNotes = useCommunityNotes({
    setPosts: feed.setPosts,
    notify: notifications.notify,
  });
  const messages = useMessages();
  const workforceInsights = useWorkforceInsights();
  const ui = useInterface();

  return {
    ...navigation,
    ...network,
    ...referrals,
    ...feed,
    ...notifications,
    ...composer,
    ...communityNotes,
    ...messages,
    ...workforceInsights,
    ...ui,
  };
}

type PlatformState = ReturnType<typeof usePlatformState>;
const PlatformContext = createContext<PlatformState | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const state = usePlatformState();
  return (
    <PlatformContext.Provider value={state}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context)
    throw new Error("usePlatform must be used within PlatformProvider");
  return context;
}
