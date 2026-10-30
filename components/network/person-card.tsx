"use client";
import Avatar from "@/components/ui/avatar";
import { usePlatform } from "@/providers/platform-provider";
import type { Person } from "@/types";
import { Check, UserPlus, MessageCircle } from "lucide-react";
export default function PersonCard({ person }: { person: Person }) {
  const {
    connections,
    currentUser,
    toggleConnection,
    networkPending,
    startConversation,
  } = usePlatform();
  const link = connections.find(
    (item) =>
      (item.requester_id === currentUser?.id
        ? item.recipient_id
        : item.requester_id) === person.id,
  );
  return (
    <article className="person-card card">
      <Avatar initials={person.initials} color={person.color} />
      <h3>{person.name}</h3>
      <p>{person.role}</p>
      <small>{person.detail}</small>
      <button
        className="secondary"
        disabled={!person.id || networkPending.includes(person.id)}
        onClick={() => person.id && void toggleConnection(person.id)}
      >
        {link ? <Check size={16} /> : <UserPlus size={16} />}{" "}
        {link?.status === "accepted"
          ? "Disconnect"
          : link
            ? link.recipient_id === currentUser?.id
              ? "Decline request"
              : "Cancel request"
            : "Connect"}
      </button>
      <button
        className="text-button"
        disabled={!person.id}
        onClick={() => person.id && void startConversation(person.id)}
      >
        <MessageCircle size={16} />
        Message
      </button>
    </article>
  );
}
