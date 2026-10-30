"use client";
import Popover from "@/components/ui/popover";
import { feedTabs } from "@/config/feed";
import PostCard from "@/components/feed/post-card";
import { usePlatform } from "@/providers/platform-provider";
import {
  ArrowRight,
  Bookmark,
  Globe2,
  Settings2,
  Sparkles,
} from "lucide-react";

export default function FeedView() {
  const {
    section,
    tab,
    setTab,
    navigate,
    filteredPosts,
    posts,
    feedTopic,
    setFeedTopic,
    feedCompany,
    setFeedCompany,
    feedSort,
    setFeedSort,
    resetFeedFilters,
    hiddenPosts,
    setHiddenPosts,
    setSearch,
  } = usePlatform();

  return (
    <>
      <div className="feed-toolbar">
        <div className="feed-tabs">
          {feedTabs.map((item) => (
            <button
              className={tab === item ? "active-tab" : ""}
              key={item}
              onClick={() => setTab(item)}
            >
              {item === "For you" && <Sparkles size={14} />}
              {item}
            </button>
          ))}
        </div>
        <Popover label="Feed filters" icon={<Settings2 size={17} />}>
          {(close) => (
            <>
              <h3>Feed filters</h3>
              <label>
                Topic
                <select
                  value={feedTopic}
                  onChange={(event) => setFeedTopic(event.target.value)}
                >
                  <option value="">All topics</option>
                  {[...new Set(posts.map((post) => post.topic))]
                    .sort()
                    .map((topic) => (
                      <option key={topic}>{topic}</option>
                    ))}
                </select>
              </label>
              <label>
                Company
                <select
                  value={feedCompany}
                  onChange={(event) => setFeedCompany(event.target.value)}
                >
                  <option value="">All companies</option>
                  {[
                    ...new Set(
                      posts.map((post) => post.company).filter(Boolean),
                    ),
                  ]
                    .sort()
                    .map((company) => (
                      <option key={company}>{company}</option>
                    ))}
                </select>
              </label>
              <label>
                Sort by
                <select
                  value={tab === "Latest" ? "Latest" : feedSort}
                  onChange={(event) => {
                    setFeedSort(event.target.value);
                    if (tab === "Latest") setTab("For you");
                  }}
                >
                  <option>Latest</option>
                  <option>Most liked</option>
                </select>
              </label>
              <div className="filter-panel-actions">
                <button className="text-button" onClick={resetFeedFilters}>
                  Reset filters
                </button>
                <button className="primary" onClick={close}>
                  Done
                </button>
              </div>
            </>
          )}
        </Popover>
      </div>
      {(feedTopic ||
        feedCompany ||
        feedSort !== "Latest" ||
        hiddenPosts.length > 0) && (
        <div className="feed-filter-status">
          <span>
            {[
              feedTopic,
              feedCompany,
              feedSort !== "Latest" && tab !== "Latest" ? feedSort : "",
            ]
              .filter(Boolean)
              .join(" · ") || "Feed preferences"}
          </span>
          <button
            className="text-button"
            onClick={() => {
              resetFeedFilters();
              setHiddenPosts([]);
            }}
          >
            Reset
            {hiddenPosts.length > 0
              ? ` and restore ${hiddenPosts.length} hidden posts`
              : " filters"}
          </button>
        </div>
      )}
      <div className="feed-label">
        <span>
          {section === "Bookmarks"
            ? "YOUR SAVED CONVERSATIONS"
            : tab === "Latest"
              ? "THE LATEST FROM YOUR COMMUNITY"
              : "CONVERSATIONS THAT BRING US TOGETHER"}
        </span>
        <span>
          <Globe2 size={12} /> Global feed
        </span>
      </div>
      {filteredPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {!filteredPosts.length && (
        <div className="empty card">
          <Bookmark size={28} />
          <h3>
            {section === "Bookmarks"
              ? "A place for the posts you love."
              : "No conversations here yet."}
          </h3>
          <p>
            {section === "Bookmarks"
              ? "Bookmark a post in the global feed to find it here."
              : "Try another feed filter or start a conversation."}
          </p>
          <button
            className="text-button"
            onClick={() => {
              navigate("Home");
              setTab("For you");
              resetFeedFilters();
              setSearch("");
            }}
          >
            Explore the feed <ArrowRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}
