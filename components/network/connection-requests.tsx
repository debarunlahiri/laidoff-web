"use client";
import Avatar from "@/components/ui/avatar";
import UserLink from "@/components/ui/user-link";
import { initials } from "@/lib/api";
import { usePlatform } from "@/providers/platform-provider";
import { Check, X } from "lucide-react";

// Incoming connection requests with one-tap accept / decline.
export default function ConnectionRequests() {
  const {
    connections,
    currentUser,
    acceptConnection,
    toggleConnection,
    networkPending,
  } = usePlatform();
  const incoming = connections.filter(
    (link) =>
      link.recipient_id === currentUser?.id && link.status === "pending",
  );
  if (!incoming.length) return null;
  return (
    <section className="card request-panel" aria-label="Connection requests">
      <div className="request-heading">
        <h2>Connection requests</h2>
        <span className="count-pill">{incoming.length}</span>
      </div>
      {incoming.map((link) => (
        <div className="request-row" key={link.id}>
          <UserLink id={link.requester_id}>
            <Avatar initials={initials(link.name)} src={link.profileImageUrl} />
          </UserLink>
          <span className="request-who">
            <UserLink id={link.requester_id}>
              <strong>{link.name}</strong>
            </UserLink>
            <small>{link.role || "Community member"}</small>
          </span>
          <button
            className="primary request-accept"
            disabled={networkPending.includes(link.id)}
            onClick={() => void acceptConnection(link.id)}
          >
            <Check size={16} /> Accept
          </button>
          <button
            className="request-decline"
            aria-label={`Decline ${link.name}`}
            title="Decline"
            disabled={networkPending.includes(link.requester_id)}
            onClick={() => void toggleConnection(link.requester_id)}
          >
            <X size={17} />
          </button>
        </div>
      ))}
    </section>
  );
}
