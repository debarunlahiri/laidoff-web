"use client";
import PersonCard from "@/components/network/person-card";
import { people } from "@/data/people";
import { usePlatform } from "@/providers/platform-provider";
import { Users } from "lucide-react";

export default function NetworkView() {
  const { following, connected } = usePlatform();

  return (
    <>
      <div className="network-stats">
        <div className="card">
          <strong>128</strong>
          <span>Connections</span>
        </div>
        <div className="card">
          <strong>{3 + following.length}</strong>
          <span>Following</span>
        </div>
        <div className="card">
          <strong>{connected.length}</strong>
          <span>Requests sent</span>
        </div>
      </div>
      <div className="section-bar">
        <h2>People to take the next step with</h2>
        <Users size={19} />
      </div>
      <div className="people-grid">
        {people.map((person) => (
          <PersonCard key={person.name} person={person} />
        ))}
      </div>
    </>
  );
}
