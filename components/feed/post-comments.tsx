"use client";
import { usePlatform } from "@/providers/platform-provider";
import type { Post } from "@/types";
import { Send } from "lucide-react";

export default function PostComments({ post }: { post: Post }) {
  const { comments, comment, setComment, addComment } = usePlatform();

  return (
    <div className="comments">
      {(comments[post.id] || []).map((text, index) => (
        <p key={index}>
          <strong>Jamie Morgan</strong>
          <br />
          {text}
        </p>
      ))}
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
        <button className="icon-button" aria-label="Send comment">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
