"use client";
import { usePlatform } from "@/providers/platform-provider";
import type { Post } from "@/types";
import { Send } from "lucide-react";

export default function PostComments({ post }: { post: Post }) {
  const {
    comments,
    comment,
    setComment,
    addComment,
    commentsLoading,
    commentsError,
    commentsHasMore,
    loadMoreComments,
    postPending,
  } = usePlatform();

  return (
    <div className="comments">
      {(comments[post.id] || []).map((item) => (
        <p key={item.id}>
          <strong>{item.name}</strong>
          <br />
          {item.text}
        </p>
      ))}
      {commentsLoading && <p role="status">Loading comments…</p>}
      {commentsError && <p role="alert">{commentsError}</p>}
      {commentsHasMore && (
        <button className="text-button" onClick={() => void loadMoreComments()}>
          Load more comments
        </button>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          addComment(post.id);
        }}
      >
        <input
          aria-label="Write a comment"
          placeholder="Offer a kind word…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className="icon-button"
          aria-label="Send comment"
          disabled={!comment.trim() || postPending.includes(post.id)}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
