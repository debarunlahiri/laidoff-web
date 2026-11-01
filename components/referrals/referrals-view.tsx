"use client";
import ReferralCard from "@/components/referrals/referral-card";
import ReferralFiltersBar from "@/components/referrals/referral-filters";
import {
  useReferralBoard,
  type ReferralView,
} from "@/hooks/use-referral-board";
import { useAuth } from "@/providers/auth-provider";
import { usePlatform } from "@/providers/platform-provider";
import { BriefcaseBusiness } from "lucide-react";
import Link from "next/link";

const tabs: { view: ReferralView; label: string; personal: boolean }[] = [
  { view: "all", label: "All", personal: false },
  { view: "available", label: "Available", personal: true },
  { view: "mine", label: "My referrals", personal: true },
  { view: "requested", label: "Requested", personal: true },
];

export default function ReferralsView() {
  const { user } = useAuth();
  const { openReferralForm } = usePlatform();
  const board = useReferralBoard();
  const { filters } = board;
  const searching = board.activeCount > 0 || Boolean(filters.search.trim());

  return (
    <>
      {board.sharedId && (
        <p className="shared-referral-note" role="status">
          Showing a shared referral.{" "}
          <Link href="/referrals">View all referrals</Link>
        </p>
      )}
      <div
        className="discovery-tabs pill-tabs"
        role="group"
        aria-label="Referral views"
      >
        {tabs
          .filter((tab) => user || !tab.personal)
          .map((tab) => (
            <button
              type="button"
              key={tab.view}
              className={filters.view === tab.view ? "selected" : ""}
              aria-pressed={filters.view === tab.view}
              onClick={() => board.setFilters({ view: tab.view })}
            >
              {tab.label}
            </button>
          ))}
      </div>
      <ReferralFiltersBar
        filters={filters}
        activeCount={board.activeCount}
        signedIn={Boolean(user)}
        onChange={board.setFilters}
        onReset={board.reset}
      />
      <div className="section-bar">
        <h2>Opportunities with a human connection</h2>
        {!board.loading && (
          <small className="result-count">
            {board.items.length}
            {board.hasMore ? "+" : ""} shown
          </small>
        )}
      </div>
      {board.items.map((item) => (
        <ReferralCard key={item.id} item={item} />
      ))}
      {board.loading && <p role="status">Loading referrals…</p>}
      {board.error && <p role="alert">{board.error}</p>}
      {board.hasMore && (
        <button
          className="secondary"
          disabled={board.loading}
          onClick={() => void board.loadMore()}
        >
          Load more referrals
        </button>
      )}
      {!board.loading && !board.error && board.items.length === 0 && (
        <div className="empty card">
          <BriefcaseBusiness size={28} />
          <h3>
            {searching
              ? "No referrals match these filters."
              : filters.view === "mine"
                ? "You haven’t added a referral yet."
                : filters.view === "requested"
                  ? "You haven’t requested a referral yet."
                  : "No available referrals right now."}
          </h3>
          <p>
            {searching
              ? "Try removing a filter or searching for something broader."
              : filters.view === "mine"
                ? "Share an opportunity and help someone take their next step."
                : "Explore the opportunities to find your next connection."}
          </p>
          <button
            className="text-button"
            onClick={() => {
              if (searching) {
                board.reset();
                board.setFilters({ search: "" });
              } else if (filters.view === "mine") openReferralForm();
              else board.setFilters({ view: "all" });
            }}
          >
            {searching
              ? "Clear filters"
              : filters.view === "mine"
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
