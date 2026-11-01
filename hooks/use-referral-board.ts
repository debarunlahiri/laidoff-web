"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { queryPath } from "@/lib/api";
import type {
  ApiReferral,
  ReferralLevel,
  ReferralWorkMode,
} from "@/lib/api-types";
import { toOpportunity } from "@/lib/referral-mapper";
import { useApiList, useDebouncedValue } from "./use-api-resource";

export type ReferralView = "all" | "available" | "mine" | "requested";
export type ReferralFilters = {
  view: ReferralView;
  search: string;
  sort: string;
  status: "" | "open" | "closed" | "all";
  companyId: string;
  workMode: ReferralWorkMode | "";
  level: ReferralLevel | "";
  location: string;
  skill: string;
  experience: string;
  postedWithin: string;
  requestStatus: "" | "pending" | "accepted" | "declined";
  topRated: boolean;
};
export const defaultReferralFilters: ReferralFilters = {
  view: "all",
  search: "",
  sort: "newest",
  status: "",
  companyId: "",
  workMode: "",
  level: "",
  location: "",
  skill: "",
  experience: "",
  postedWithin: "",
  requestStatus: "",
  topRated: false,
};

// Filters and sorting are applied by the API so paging stays correct.
export function useReferralBoard() {
  // A shared link (/referrals?id=...) shows just that referral.
  const sharedId = useSearchParams().get("id") ?? "";
  const [filters, setFilters] = useState(defaultReferralFilters);
  const typed = useDebouncedValue(
    `${filters.search}\u0000${filters.location}\u0000${filters.skill}`,
  );
  const [search, location, skill] = typed.split("\u0000");
  const path = queryPath("/referrals", {
    id: sharedId,
    search,
    location,
    skill,
    experience: filters.experience,
    sort: filters.sort,
    status:
      filters.status ||
      (filters.view === "mine" || filters.view === "requested"
        ? "all"
        : "open"),
    view: filters.view,
    companyId: filters.companyId,
    workMode: filters.workMode,
    level: filters.level,
    postedWithin: filters.postedWithin,
    requestStatus: filters.requestStatus,
    topRated: filters.topRated ? "true" : "",
  });
  const list = useApiList<ApiReferral>(path);
  const items = useMemo(() => list.data.map(toOpportunity), [list.data]);
  const activeCount = [
    filters.status,
    filters.companyId,
    filters.workMode,
    filters.level,
    filters.location.trim(),
    filters.skill.trim(),
    filters.experience,
    filters.postedWithin,
    filters.requestStatus,
    filters.topRated,
  ].filter(Boolean).length;
  return {
    filters,
    setFilters: (patch: Partial<ReferralFilters>) =>
      setFilters((current) => ({ ...current, ...patch })),
    reset: () =>
      setFilters((current) => ({
        ...defaultReferralFilters,
        view: current.view,
      })),
    items,
    sharedId,
    activeCount,
    loading: list.loading,
    error: list.error,
    hasMore: list.hasMore,
    loadMore: list.loadMore,
  };
}
