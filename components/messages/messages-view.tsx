"use client";

import { usePlatform } from "@/providers/platform-provider";
import { useState } from "react";
import ChatWindow from "./chat-window";
import EmptyChat from "./empty-chat";
import InboxPanel from "./inbox-panel";

export default function MessagesView() {
  const {
    conversations,
    activeConversation,
    selectConversation,
    message,
    setMessage,
    partnerTyping,
    sendMessage,
    attachments,
    attachmentError,
    addAttachments,
    removeAttachment,
    messageSending,
    messagesLoading,
    messagesError,
    conversationsHasMore,
    loadMoreConversations,
    messagesHasMore,
    loadOlderMessages,
    navigate,
  } = usePlatform();
  const [query, setQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const visible = conversations.filter((conversation) =>
    `${conversation.name} ${conversation.role}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <section
      className={`card messaging${chatOpen ? " chat-open" : ""}`}
      aria-label="Messages"
    >
      <InboxPanel
        conversations={conversations}
        visible={visible}
        activeId={activeConversation?.id}
        query={query}
        onQueryChange={setQuery}
        onSelect={(id) => {
          selectConversation(id);
          setChatOpen(true);
        }}
        loading={messagesLoading}
        error={messagesError}
        hasMore={conversationsHasMore}
        onLoadMore={() => void loadMoreConversations()}
      />
      {activeConversation ? (
        <ChatWindow
          conversation={activeConversation}
          chatOpen={chatOpen}
          draft={message}
          sending={messageSending}
          loading={messagesLoading}
          hasMore={messagesHasMore}
          typing={partnerTyping}
          onBack={() => setChatOpen(false)}
          onDraftChange={setMessage}
          onSend={sendMessage}
          attachments={attachments}
          attachmentError={attachmentError}
          onAttach={addAttachments}
          onRemoveAttachment={removeAttachment}
          onLoadOlder={() => void loadOlderMessages()}
        />
      ) : (
        <EmptyChat
          loading={messagesLoading}
          onFindPeople={() => navigate("My network")}
        />
      )}
    </section>
  );
}
