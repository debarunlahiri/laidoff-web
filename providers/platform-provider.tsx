"use client";

import { useApiResource } from "@/hooks/use-api-resource";
import { useNotifications } from "@/hooks/use-notifications";
import type { ApiCompany } from "@/lib/api-types";
import { useAuth } from "@/providers/auth-provider";
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
  const { user } = useAuth();
  const navigation = usePlatformNavigation();
  const notifications = useToast();
  const referrals = useReferrals(
    notifications.notify,
    navigation.section === "Referrals" ? navigation.search : "",
  );
  const network = useNetwork(notifications.notify, user?.id ?? "");
  const feed = useFeed(
    navigation.section,
    navigation.search,
    notifications.notify,
  );
  const composer = usePostComposer({
    setTab: feed.setTab,
    navigate: navigation.navigate,
    notify: notifications.notify,
  });
  const communityNotes = useCommunityNotes({ notify: notifications.notify });
  const messages = useMessages(
    navigation.section,
    user?.id ?? "",
    notifications.notify,
    navigation.navigate,
  );
  const workforceInsights = useWorkforceInsights(navigation.section);
  const alerts = useNotifications(notifications.notify);
  const companies = useApiResource<ApiCompany[]>("/companies?limit=100", []);
  const ui = useInterface();

  return {
    currentUser: user,
    companies: companies.data,
    ...alerts,
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
