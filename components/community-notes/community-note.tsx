"use client";
import { usePlatform } from "@/providers/platform-provider";
import { ShieldCheck } from "lucide-react";

export default function CommunityNote({ note }: { note: string }) {
  const { notify } = usePlatform();

  return (
    <div className="community-note">
      <strong>
        <ShieldCheck size={16} /> Community context{" "}
        <span>Under evaluation</span>
      </strong>
      <p>{note}</p>
      <button
        onClick={() =>
          notify("Your helpful rating has been recorded for this demo.")
        }
      >
        Was this helpful?
      </button>
    </div>
  );
}
