"use client";
import PersonCard from "@/components/network/person-card";
import { usePlatform } from "@/providers/platform-provider";
import { Users } from "lucide-react";
export default function NetworkView() {
  const {
    people,
    connections,
    currentUser,
    networkStats,
    acceptConnection,
    toggleConnection,
    networkPending,
    networkLoading,
    networkError,
    peopleHasMore,
    loadMorePeople,
    connectionsHasMore,
    loadMoreConnections,
  } = usePlatform();
  const incoming = connections.filter(
    (link) =>
      link.recipient_id === currentUser?.id && link.status === "pending",
  );
  return (
    <>
      <div className="network-stats">
        <div className="card">
          <strong>{networkStats.connections}</strong>
          <span>Connections</span>
        </div>
        <div className="card">
          <strong>{networkStats.following}</strong>
          <span>Following</span>
        </div>
        <div className="card">
          <strong>{networkStats.outgoingRequests}</strong>
          <span>Requests sent</span>
        </div>
      </div>
      {incoming.length > 0 && (
        <section className="card api-panel">
          <h2>Connection requests</h2>
          {incoming.map((link) => (
            <div className="api-list-row" key={link.id}>
              <span>
                <strong>{link.name}</strong>
                <small>{link.role}</small>
              </span>
              <button
                className="primary"
                disabled={networkPending.includes(link.id)}
                onClick={() => void acceptConnection(link.id)}
              >
                Accept
              </button>
              <button
                className="text-button"
                disabled={networkPending.includes(link.requester_id)}
                onClick={() => void toggleConnection(link.requester_id)}
              >
                Decline
              </button>
            </div>
          ))}
        </section>
      )}
      <div className="section-bar">
        <h2>People to take the next step with</h2>
        <Users size={19} />
      </div>
      {networkLoading && <p role="status">Loading your network…</p>}
      {networkError && <p role="alert">{networkError}</p>}
      <div className="people-grid">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
      {!networkLoading && !networkError && !people.length && (
        <p className="empty card">No people to discover yet.</p>
      )}
      {peopleHasMore && (
        <button
          className="secondary"
          disabled={networkLoading}
          onClick={() => void loadMorePeople()}
        >
          Load more people
        </button>
      )}
      {connectionsHasMore && (
        <button
          className="secondary"
          disabled={networkLoading}
          onClick={() => void loadMoreConnections()}
        >
          Load more connections
        </button>
      )}
    </>
  );
}
