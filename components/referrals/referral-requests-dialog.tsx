"use client";
import Dialog from "@/components/ui/dialog";
import { usePlatform } from "@/providers/platform-provider";
import { X } from "lucide-react";
export default function ReferralRequestsDialog() {
  const {
    requestReferralId,
    setRequestReferralId,
    referralRequests,
    referralRequestsLoading,
    referralRequestsError,
    decideReferral,
    referralPending,
    referralRequestsHasMore,
    loadMoreReferralRequests,
  } = usePlatform();
  if (!requestReferralId) return null;
  return (
    <Dialog
      label="Referral requests"
      onClose={() => setRequestReferralId(null)}
    >
      <div className="modal-heading">
        <h2>Referral requests</h2>
        <button
          className="icon-button"
          aria-label="Close requests"
          onClick={() => setRequestReferralId(null)}
        >
          <X size={20} />
        </button>
      </div>
      {referralRequestsLoading && <p role="status">Loading requests…</p>}
      {referralRequestsError && <p role="alert">{referralRequestsError}</p>}
      {!referralRequestsLoading &&
        !referralRequestsError &&
        !referralRequests.length && <p>No requests yet.</p>}
      {referralRequests.map((item) => (
        <div className="api-list-row" key={item.userId}>
          <span>
            <strong>{item.name}</strong>
            <small>{item.role}</small>
          </span>
          {item.status === "pending" ? (
            <>
              <button
                className="primary"
                disabled={referralPending.includes(item.userId)}
                onClick={() => void decideReferral(item.userId, "accepted")}
              >
                Accept
              </button>
              <button
                className="text-button"
                disabled={referralPending.includes(item.userId)}
                onClick={() => void decideReferral(item.userId, "declined")}
              >
                Decline
              </button>
            </>
          ) : (
            <span className="tag">{item.status}</span>
          )}
        </div>
      ))}
      {referralRequestsHasMore && (
        <button
          className="text-button"
          onClick={() => void loadMoreReferralRequests()}
        >
          Load more requests
        </button>
      )}
    </Dialog>
  );
}
