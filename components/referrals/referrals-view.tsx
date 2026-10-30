"use client";
import ReferralCard from "@/components/referrals/referral-card";
import { usePlatform } from "@/providers/platform-provider";
import { BriefcaseBusiness } from "lucide-react";
import { useState } from "react";

const referralTabs = ["All", "Available", "My referrals", "Requested"] as const;

export default function ReferralsView() {
  const {
    opportunities,
    requested,
    setReferralComposer,
    referralsLoading,
    referralsError,
    referralsHasMore,
    loadMoreReferrals,
  } = usePlatform();
  const [selectedTab, setSelectedTab] =
    useState<(typeof referralTabs)[number]>("All");
  const visibleOpportunities = opportunities.filter((item) => {
    const isRequested = requested.includes(
      item.id ?? `${item.company}-${item.title}`,
    );
    if (selectedTab === "Available")
      return !item.own && !isRequested && item.status === "open";
    if (selectedTab === "My referrals") return item.own;
    if (selectedTab === "Requested") return isRequested;
    return true;
  });

  return (
    <>
      <div
        className="discovery-tabs"
        role="group"
        aria-label="Referral filters"
      >
        {referralTabs.map((tab) => (
          <button
            type="button"
            key={tab}
            className={selectedTab === tab ? "selected" : ""}
            aria-pressed={selectedTab === tab}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="section-bar">
        <h2>Opportunities with a human connection</h2>
      </div>
      {visibleOpportunities.map((item) => (
        <ReferralCard
          key={item.id ?? `${item.company}-${item.title}`}
          item={item}
        />
      ))}
      {referralsLoading && <p role="status">Loading referrals…</p>}
      {referralsError && <p role="alert">{referralsError}</p>}
      {referralsHasMore && (
        <button
          className="secondary"
          disabled={referralsLoading}
          onClick={() => void loadMoreReferrals()}
        >
          Load more referrals
        </button>
      )}
      {!referralsLoading &&
        !referralsError &&
        visibleOpportunities.length === 0 && (
          <div className="empty card">
            <BriefcaseBusiness size={28} />
            <h3>
              {selectedTab === "My referrals"
                ? "You haven’t added a referral yet."
                : selectedTab === "Requested"
                  ? "You haven’t requested a referral yet."
                  : "No available referrals right now."}
            </h3>
            <p>
              {selectedTab === "My referrals"
                ? "Share an opportunity and help someone take their next step."
                : "Explore the opportunities to find your next connection."}
            </p>
            <button
              className="text-button"
              onClick={() =>
                selectedTab === "My referrals"
                  ? setReferralComposer(true)
                  : setSelectedTab("All")
              }
            >
              {selectedTab === "My referrals"
                ? "Add referrals"
                : "View all referrals"}
            </button>
          </div>
        )}
      <p className="subtle-text">
        Referrals are voluntary and always free. Requests are shared with the
        person offering the referral.
      </p>
    </>
  );
}
