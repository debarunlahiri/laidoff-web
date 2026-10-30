"use client";
import { useState } from "react";
import { api, apiMessage, invalidate, queryPath } from "@/lib/api";
import type { ApiReferral, ApiReferralRequest } from "@/lib/api-types";
import type { ReferralOpportunity } from "@/types";
import { useApiList, useDebouncedValue } from "./use-api-resource";
export function useReferrals(
  notify: (message: string) => void,
  search: string,
) {
  const [referralComposer, setReferralComposer] = useState(false);
  const [referralSaving, setReferralSaving] = useState(false);
  const [requestReferralId, setRequestReferralId] = useState<string | null>(
    null,
  );
  const [pending, setPending] = useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(search);
  const list = useApiList<ApiReferral>(
    queryPath("/referrals", { search: debouncedSearch, status: "all" }),
  );
  const requests = useApiList<ApiReferralRequest>(
    requestReferralId ? `/referrals/${requestReferralId}/requests` : null,
  );
  const opportunities: ReferralOpportunity[] = list.data.map((item) => ({
    ...item,
    own: Boolean(item.own),
    letter: item.company[0]?.toUpperCase() ?? "",
    color: "purple",
  }));
  const requested = opportunities
    .filter((item) => item.requestStatus)
    .map((item) => item.id!);
  async function act(id: string, action: () => Promise<unknown>) {
    if (pending.includes(id)) return;
    setPending((current) => [...current, id]);
    try {
      await action();
      invalidate("referrals", "notifications");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setPending((current) => current.filter((item) => item !== id));
    }
  }
  async function addReferral(fields: {
    company: string;
    title: string;
    location: string;
    skills: string;
    description: string;
  }) {
    if (referralSaving) return false;
    setReferralSaving(true);
    try {
      await api("/referrals", {
        method: "POST",
        body: { ...fields, companyId: fields.company },
      });
      invalidate("referrals");
      setReferralComposer(false);
      notify("Your referral opportunity has been added.");
      return true;
    } catch (error) {
      notify(apiMessage(error));
      return false;
    } finally {
      setReferralSaving(false);
    }
  }
  return {
    opportunities,
    requested,
    referralComposer,
    setReferralComposer,
    referralSaving,
    addReferral,
    requestReferralId,
    setRequestReferralId,
    referralRequests: requests.data,
    referralRequestsLoading: requests.loading,
    referralRequestsError: requests.error,
    referralRequestsHasMore: requests.hasMore,
    loadMoreReferralRequests: requests.loadMore,
    referralPending: pending,
    requestReferral: (id: string) =>
      act(id, async () => {
        await api(`/referrals/${id}/requests`, { method: "POST" });
        notify("Referral request sent.");
      }),
    setReferralStatus: (id: string, status: "open" | "closed") =>
      act(id, () =>
        api(`/referrals/${id}`, { method: "PATCH", body: { status } }),
      ),
    decideReferral: (userId: string, status: "accepted" | "declined") =>
      requestReferralId
        ? act(userId, () =>
            api(`/referrals/${requestReferralId}/requests/${userId}`, {
              method: "PATCH",
              body: { status },
            }),
          )
        : Promise.resolve(),
    referralsLoading: list.loading,
    referralsError: list.error,
    referralsHasMore: list.hasMore,
    loadMoreReferrals: list.loadMore,
  };
}
