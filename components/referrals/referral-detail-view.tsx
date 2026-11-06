"use client";
import ReferralCard from "@/components/referrals/referral-card";
import { useApiResource } from "@/hooks/use-api-resource";
import { queryPath } from "@/lib/api";
import type { ApiReferral } from "@/lib/api-types";
import { toOpportunity } from "@/lib/referral-mapper";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReferralDetailView({ id }: { id: string }) {
  const { data, loading, error } = useApiResource<ApiReferral[]>(
    queryPath("/referrals", { id, limit: 1 }),
    [],
  );
  const referral = data[0];

  return (
    <div className="post-detail">
      <Link href="/referrals" className="back-link">
        <ArrowLeft size={16} />
        Back to referrals
      </Link>
      {loading && !referral && <p role="status">Loading referral…</p>}
      {!loading && !referral && (
        <div className="card empty-state" role="alert">
          <strong>This referral isn’t available</strong>
          <p className="subtle-text">{error || "It may have been removed."}</p>
        </div>
      )}
      {referral && <ReferralCard item={toOpportunity(referral)} full />}
    </div>
  );
}
