"use client";
import { discoveryTopics } from "@/config/feed";
import PostCard from "@/components/feed/post-card";
import { usePlatform } from "@/providers/platform-provider";
import { Search } from "lucide-react";

export default function ExploreView() {
  const {
    visiblePosts,
    search,
    exploreTopic: selectedTopic,
    setExploreTopic: setSelectedTopic,
    feedLoading,
    feedError,
    feedHasMore,
    loadMorePosts,
  } = usePlatform();

  return (
    <>
      <div className="section-bar">
        <h2>Discover a conversation</h2>
      </div>
      <div
        className="discovery-tabs"
        role="group"
        aria-label="Conversation topics"
      >
        {["All", ...discoveryTopics].map((topic) => (
          <button
            type="button"
            className={selectedTopic === topic ? "selected" : ""}
            key={topic}
            aria-pressed={selectedTopic === topic}
            onClick={() => setSelectedTopic(topic)}
          >
            {topic}
          </button>
        ))}
      </div>
      <div className="section-bar">
        <h2>
          {search ? `Results for “${search}”` : "From across the community"}
        </h2>
      </div>
      {visiblePosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {feedLoading && <p role="status">Loading conversations…</p>}
      {feedError && <p role="alert">{feedError}</p>}
      {feedHasMore && (
        <button
          className="secondary"
          disabled={feedLoading}
          onClick={() => void loadMorePosts()}
        >
          Load more posts
        </button>
      )}
      {!feedLoading && !feedError && visiblePosts.length === 0 && (
        <div className="empty card">
          <Search size={28} />
          <h3>No matches yet</h3>
          <p>Try a different search or conversation topic.</p>
        </div>
      )}
    </>
  );
}
