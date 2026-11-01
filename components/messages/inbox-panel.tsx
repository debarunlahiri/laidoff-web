import { MessageSquare } from "lucide-react";
import ConversationItem from "./conversation-item";
import InboxSearch from "./inbox-search";
import type { Conversation } from "./types";

export default function InboxPanel({
  conversations,
  visible,
  activeId,
  query,
  onQueryChange,
  onSelect,
  loading,
  error,
  hasMore,
  onLoadMore,
}: {
  conversations: Conversation[];
  visible: Conversation[];
  activeId?: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  loading: boolean;
  error: string;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <aside className="message-inbox" aria-label="Inbox">
      <div className="inbox-heading">
        <h2>Inbox</h2>
        <span>
          {conversations.length}{" "}
          {conversations.length === 1 ? "conversation" : "conversations"}
        </span>
      </div>
      <InboxSearch value={query} onChange={onQueryChange} />
      <div className="conversation-list">
        {visible.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            active={activeId === conversation.id}
            onSelect={() => onSelect(conversation.id)}
          />
        ))}
        {error && (
          <p role="alert" className="api-error">
            {error}
          </p>
        )}
        {hasMore && (
          <button
            className="text-button"
            disabled={loading}
            onClick={onLoadMore}
          >
            Load more conversations
          </button>
        )}
        {!loading && visible.length === 0 && (
          <p className="inbox-empty">
            <MessageSquare size={28} />
            No conversations found.
          </p>
        )}
      </div>
    </aside>
  );
}
