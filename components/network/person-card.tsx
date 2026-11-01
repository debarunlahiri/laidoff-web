"use client";
import ConnectButton from "@/components/network/connect-button";
import Avatar from "@/components/ui/avatar";
import UserLink from "@/components/ui/user-link";
import { usePlatform } from "@/providers/platform-provider";
import type { Person } from "@/types";
import { MessageCircle } from "lucide-react";
import type { CSSProperties } from "react";

// A stable accent colour per person, so cards feel distinct without extra data.
const hue = (name: string) =>
  [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;

export default function PersonCard({ person }: { person: Person }) {
  const { startConversation } = usePlatform();
  return (
    <article
      className="person-card card"
      style={{ "--hue": hue(person.name) } as CSSProperties}
    >
      <div className="person-banner" aria-hidden="true" />
      <div className="person-card-top">
        <UserLink id={person.id}>
          <Avatar
            initials={person.initials}
            color={person.color}
            src={person.imageUrl}
          />
        </UserLink>
        {person.detail && <span className="person-badge">{person.detail}</span>}
      </div>
      <h3>
        <UserLink id={person.id}>{person.name}</UserLink>
      </h3>
      <p>{person.role}</p>
      <div className="person-actions">
        <ConnectButton personId={person.id} />
        <button
          className="person-message"
          aria-label={`Message ${person.name}`}
          title="Message"
          disabled={!person.id}
          onClick={() => person.id && void startConversation(person.id)}
        >
          <MessageCircle size={18} />
        </button>
      </div>
    </article>
  );
}
