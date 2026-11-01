"use client";
import CommentForm from "@/components/feed/comment-form";
import CommentItem from "@/components/feed/comment-item";
import SelectField from "@/components/ui/select-field";
import { useApiList } from "@/hooks/use-api-resource";
import { useCommentActions } from "@/hooks/use-comment-actions";
import type { ApiComment } from "@/lib/api-types";
import { usePlatform } from "@/providers/platform-provider";
import type { Post } from "@/types";
import { useState } from "react";

const sorts = [
  { value: "oldest", label: "Oldest first" },
  { value: "newest", label: "Newest first" },
  { value: "top", label: "Most liked" },
];
const filters = [
  { value: "all", label: "All comments" },
  { value: "mine", label: "My comments" },
  { value: "replied", label: "With replies" },
];

// The full comment thread for the post page, with sort and filter controls.
export default function PostDetailComments({ post }: { post: Post }) {
  const { notify } = usePlatform();
  const actions = useCommentActions(post.id, notify);
  const [sort, setSort] = useState("oldest");
  const [filter, setFilter] = useState("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const list = useApiList<ApiComment>(
    `/posts/${post.id}/comments?sort=${sort}&filter=${filter}`,
  );

  return (
    <section id="post-comments" className="card comments post-detail-comments">
      <div className="comments-toolbar">
        <h2>
          {post.comments} {post.comments === 1 ? "comment" : "comments"}
        </h2>
        <div className="comments-controls">
          <SelectField
            label="Show"
            placeholder="All comments"
            value={filter}
            options={filters}
            onChange={setFilter}
          />
          <SelectField
            label="Sort by"
            placeholder="Oldest first"
            value={sort}
            options={sorts}
            onChange={setSort}
          />
        </div>
      </div>
      <CommentForm
        label="Write a comment"
        placeholder="Offer a kind word…"
        pending={actions.pending}
        onSubmit={(text, file) => actions.post(text, undefined, file)}
      />
      {list.data.map((item) => (
        <CommentItem
          key={item.id}
          comment={item}
          postId={post.id}
          actions={actions}
          replyingTo={replyingTo}
          onReplyingChange={setReplyingTo}
        />
      ))}
      {list.loading && <p role="status">Loading comments…</p>}
      {list.error && <p role="alert">{list.error}</p>}
      {!list.loading && !list.error && list.data.length === 0 && (
        <p className="subtle-text">
          {filter === "all"
            ? "Be the first to offer a kind word."
            : "No comments match this filter."}
        </p>
      )}
      {list.hasMore && (
        <button className="text-button" onClick={() => void list.loadMore()}>
          Load more comments
        </button>
      )}
    </section>
  );
}
