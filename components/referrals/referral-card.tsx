"use client";
import { usePlatform } from "@/providers/platform-provider";
import type { ReferralOpportunity } from "@/types";
import { ArrowUpRight, Check } from "lucide-react";

export default function ReferralCard({ item }: { item: ReferralOpportunity }) {
  const {
    requested,
    requestReferral,
    setReferralStatus,
    setRequestReferralId,
    referralPending,
  } = usePlatform();

  const requestId = item.id ?? `${item.company}-${item.title}`;

  return (
    <article className="opportunity card" key={item.company}>
      <div className="opportunity-top">
        <span className={`company-logo ${item.color}`}>{item.letter}</span>
        <span>
          <strong>{item.company}</strong>
          <small>Employee referral</small>
        </span>
        <span className="tag green-tag">
          {item.status === "closed" ? "Closed" : "Accepting requests"}
        </span>
      </div>
      <h2>{item.title}</h2>
      <p>{item.location}</p>
      <p>{item.skills}</p>
      {item.description && (
        <p className="referral-description">{item.description}</p>
      )}
      <div className="opportunity-bottom">
        <span>
          Offered by <strong>{item.person}</strong>
        </span>
        {item.own ? (
          <div className="referral-owner-actions">
            <button
              className="text-button"
              onClick={() => item.id && setRequestReferralId(item.id)}
            >
              View requests
            </button>
            <button
              className="secondary"
              disabled={referralPending.includes(requestId)}
              onClick={() =>
                item.id &&
                setReferralStatus(
                  item.id,
                  item.status === "closed" ? "open" : "closed",
                )
              }
            >
              {item.status === "closed" ? "Reopen referral" : "Close referral"}
            </button>
          </div>
        ) : (
          <button
            disabled={
              Boolean(item.requestStatus) ||
              item.status === "closed" ||
              referralPending.includes(requestId)
            }
            className={requested.includes(requestId) ? "secondary" : "primary"}
            onClick={() => requestReferral(requestId)}
          >
            {requested.includes(requestId) ? (
              <>
                <Check size={15} />
                {item.requestStatus === "accepted"
                  ? "Accepted"
                  : item.requestStatus === "declined"
                    ? "Declined"
                    : "Requested"}
              </>
            ) : (
              <>
                Request referral <ArrowUpRight size={15} />
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
