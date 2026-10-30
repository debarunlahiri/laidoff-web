"use client";
import Avatar from "@/components/ui/avatar";
import { usePlatform } from "@/providers/platform-provider";
import { ArrowRight, Check, UserPlus, Users } from "lucide-react";

export default function PeopleSuggestions() {
  const { people, connected, toggleConnection, navigate, networkPending } =
    usePlatform();

  return (
    <section className="card rail-card">
      <div className="rail-heading">
        <h3>People to know</h3>
        <Users size={17} />
      </div>
      <p className="rail-subtitle">A new connection can change everything.</p>
      {people.slice(0, 3).map((person) => (
        <div className="suggestion" key={person.id}>
          <Avatar initials={person.initials} color={person.color} small />
          <div>
            <strong>{person.name}</strong>
            <span>{person.role}</span>
            <small>
              {person.detail === "Offering referrals" && (
                <span className="status-dot" />
              )}
              {person.detail}
            </small>
          </div>
          <button
            aria-label={`Connect with ${person.name}`}
            className={`connect-icon ${connected.includes(person.id ?? "") ? "connected" : ""}`}
            disabled={!person.id || networkPending.includes(person.id)}
            onClick={() => person.id && toggleConnection(person.id)}
          >
            {connected.includes(person.id ?? "") ? (
              <Check size={15} />
            ) : (
              <UserPlus size={15} />
            )}
          </button>
        </div>
      ))}
      <button className="rail-link" onClick={() => navigate("My network")}>
        Explore your network <ArrowRight size={15} />
      </button>
    </section>
  );
}
