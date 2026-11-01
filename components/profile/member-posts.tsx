"use client";
import PostCard from "@/components/feed/post-card";
import { useApiList } from "@/hooks/use-api-resource";
import type { ApiPost } from "@/lib/api-types";
import { toPost } from "@/lib/post-mapper";

export default function MemberPosts({ id }: { id: string }) {
  const { data, loading, error, hasMore, loadMore } = useApiList<ApiPost>(
    `/posts?authorId=${id}`,
  );
  return (
    <div className="member-list">
      {data.map((post) => (
        <PostCard key={post.id} post={toPost(post)} />
      ))}
      {loading && <p role="status">Loading posts…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="empty card">No public posts yet.</p>
      )}
      {hasMore && (
        <button className="secondary" disabled={loading} onClick={loadMore}>
          Load more posts
        </button>
      )}
    </div>
  );
}
