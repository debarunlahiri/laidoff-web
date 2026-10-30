"use client";

import { useState } from "react";
import { initialConversations } from "@/data/messages";

export function useMessages() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState("marcus");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  )!;
  const message = drafts[activeConversationId] ?? "";

  function setMessage(text: string) {
    setDrafts((current) => ({ ...current, [activeConversationId]: text }));
  }

  function selectConversation(id: string) {
    setActiveConversationId(id);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, unread: 0 } : conversation,
      ),
    );
  }

  function sendMessage() {
    const text = message.trim();
    if (!text) return;
    const sentMessage = {
      id: crypto.randomUUID(),
      text,
      outgoing: true,
      time: new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    };
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, sentMessage],
            }
          : conversation,
      ),
    );
    setMessage("");
  }

  return {
    conversations,
    activeConversation,
    selectConversation,
    message,
    setMessage,
    sendMessage,
  };
}
