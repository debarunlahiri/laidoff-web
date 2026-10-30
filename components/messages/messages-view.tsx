"use client";

import Avatar from "@/components/ui/avatar";
import { usePlatform } from "@/providers/platform-provider";
import {
  ArrowLeft,
  CheckCheck,
  MessageSquare,
  Search,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function MessagesView() {
  const {
    conversations,
    activeConversation,
    selectConversation,
    message,
    setMessage,
    sendMessage,
  } = usePlatform();
  const [query, setQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const filteredConversations = conversations.filter((conversation) =>
    `${conversation.name} ${conversation.role}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  useEffect(() => {
    const history = historyRef.current;
    if (history) history.scrollTop = history.scrollHeight;
  }, [activeConversation.id, activeConversation.messages.length, chatOpen]);

  return (
    <section
      className={`card messaging${chatOpen ? " chat-open" : ""}`}
      aria-label="Messages"
    >
      <aside className="message-inbox" aria-label="Inbox">
        <div className="inbox-heading">
          <h2>Inbox</h2>
          <span>{conversations.length} conversations</span>
        </div>
        <label className="inbox-search">
          <Search size={17} />
          <input
            aria-label="Search conversations"
            placeholder="Search messages"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="conversation-list">
          {filteredConversations.map((conversation) => {
            const latest =
              conversation.messages[conversation.messages.length - 1];
            return (
              <button
                key={conversation.id}
                className={`conversation-preview${activeConversation.id === conversation.id ? " active" : ""}`}
                aria-pressed={activeConversation.id === conversation.id}
                onClick={() => {
                  selectConversation(conversation.id);
                  setChatOpen(true);
                }}
              >
                <Avatar
                  initials={conversation.initials}
                  color={conversation.color}
                />
                <span className="conversation-summary">
                  <span className="conversation-preview-heading">
                    <strong>{conversation.name}</strong>
                    <time>{latest.time}</time>
                  </span>
                  <span className="conversation-snippet">
                    {latest.outgoing ? "You: " : ""}
                    {latest.text}
                  </span>
                </span>
                {conversation.unread > 0 && (
                  <span
                    className="conversation-unread"
                    aria-label={`${conversation.unread} unread message`}
                  >
                    {conversation.unread}
                  </span>
                )}
              </button>
            );
          })}
          {filteredConversations.length === 0 && (
            <p className="inbox-empty">
              <MessageSquare size={24} />
              No conversations found.
            </p>
          )}
        </div>
        <p className="inbox-note">A little connection goes a long way.</p>
      </aside>
      <div className="chat-window">
        <div className="conversation-heading">
          <button
            className="icon-button inbox-back"
            aria-label="Back to inbox"
            onClick={() => setChatOpen(false)}
          >
            <ArrowLeft size={20} />
          </button>
          <Avatar
            initials={activeConversation.initials}
            color={activeConversation.color}
          />
          <span>
            <strong>{activeConversation.name}</strong>
            <small>{activeConversation.role}</small>
          </span>
          <span className="chat-connected">Connected</span>
        </div>
        <div
          className="message-history"
          ref={historyRef}
          role="log"
          aria-label={`Conversation with ${activeConversation.name}`}
          aria-live="polite"
          tabIndex={0}
        >
          <span className="message-date">Today</span>
          {activeConversation.messages.map((item) => (
            <div
              className={`message ${item.outgoing ? "outgoing" : "incoming"}`}
              key={item.id}
            >
              <p>{item.text}</p>
              <small>
                <time>{item.time}</time>
                {item.outgoing && <CheckCheck size={14} aria-label="Sent" />}
              </small>
            </div>
          ))}
        </div>
        <div className="chat-composer">
          <form
            className="message-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              aria-label={`Message ${activeConversation.name}`}
              placeholder="Write a message…"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              autoComplete="off"
            />
            <button
              className="primary"
              aria-label="Send message"
              disabled={!message.trim()}
            >
              <Send size={18} />
            </button>
          </form>
          <p className="subtle-text">
            Demo conversation. Messages are not sent to a real person.
          </p>
        </div>
      </div>
    </section>
  );
}
