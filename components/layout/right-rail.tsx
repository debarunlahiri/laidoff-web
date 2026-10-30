"use client";
import TrendingTopics from "@/components/explore/trending-topics";
import DailyReminder from "@/components/layout/daily-reminder";
import PeopleSuggestions from "@/components/network/people-suggestions";
import ReferralSuggestions from "@/components/referrals/referral-suggestions";

export default function RightRail() {
  return (
    <aside className="right-rail">
      <DailyReminder />
      <PeopleSuggestions />
      <ReferralSuggestions />
      <TrendingTopics />
      <footer>
        <span>About</span>
        <span>Privacy</span>
        <span>Community guidelines</span>
        <p>
          © 2026 LayoffCircle <span>Made for the way forward.</span>
        </p>
      </footer>
    </aside>
  );
}
