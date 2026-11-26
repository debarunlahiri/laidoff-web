import { MessageSquare } from "lucide-react";
import { SkeletonLines } from "@/components/ui/skeleton";

export default function EmptyChat({
  loading,
  onFindPeople,
}: {
  loading: boolean;
  onFindPeople: () => void;
}) {
  return (
    <div className="chat-window inbox-empty">
      <MessageSquare size={40} />
      {loading ? (
        <SkeletonLines lines={2} label="Loading inbox" />
      ) : (
        <h3>Start a conversation</h3>
      )}
      <p>Choose someone from your network to send a message.</p>
      <button className="primary" onClick={onFindPeople}>
        Find people
      </button>
    </div>
  );
}
