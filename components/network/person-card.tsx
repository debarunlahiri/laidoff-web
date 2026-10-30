"use client";
import Avatar from "@/components/ui/avatar";
import { usePlatform } from "@/providers/platform-provider";
import type { Person } from "@/types";
import { Check, UserPlus } from "lucide-react";

export default function PersonCard({ person }: { person: Person }) {
  const { connected, toggleConnection } = usePlatform();

  return (
    <article className="person-card card" key={person.name}>
      <Avatar initials={person.initials} color={person.color} />
      <h3>{person.name}</h3>
      <p>{person.role}</p>
      <small>{person.detail}</small>
      <button
        className="secondary"
        onClick={() => toggleConnection(person.name)}
      >
        {connected.includes(person.name) ? (
          <Check size={16} />
        ) : (
          <UserPlus size={16} />
        )}
        {connected.includes(person.name) ? "Request sent" : "Connect"}
      </button>
    </article>
  );
}
