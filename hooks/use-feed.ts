"use client";
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";
import {
  api,
  apiMessage,
  displayDate,
  displayTime,
  initials,
  invalidate,
  mediaUrl,
  queryPath,
} from "@/lib/api";
import type { ApiComment, ApiPost } from "@/lib/api-types";
import type { Post } from "@/types";
import {
  useApiList,
  useApiResource,
  useDebouncedValue,
} from "./use-api-resource";

export function useFeed(
  section: string,
  search: string,
  notify: (message: string) => void,
) {
  const { user } = useAuth();
  const [tab, setTab] = useState("For you");
  const [feedTopic, setFeedTopic] = useState("");
  const [exploreTopic, setExploreTopic] = useState("All");
  const [feedCompany, setFeedCompany] = useState("");
  const [feedSort, setFeedSort] = useState("Latest");
  const [commentPost, setCommentPost] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(search);
  const enabled = ["Home", "Explore", "Bookmarks"].includes(section);
  const list = useApiList<ApiPost>(
    enabled
      ? queryPath("/posts", {
          search: debouncedSearch,
          topic:
            section === "Explore"
              ? exploreTopic === "All"
                ? undefined
                : exploreTopic
              : tab === "Layoff updates"
                ? "Layoff updates"
                : feedTopic,
          companyId: section === "Explore" ? undefined : feedCompany,
          tab:
            section === "Bookmarks"
              ? "bookmarks"
              : section === "Explore"
                ? "all"
                : tab === "Following"
                  ? "following"
                  : tab === "Referrals"
                    ? "referrals"
                    : "all",
          sort:
            tab === "Latest"
              ? "latest"
              : feedSort === "Most liked"
                ? "most-liked"
                : "latest",
        })
      : null,
  );
  const hidden = useApiResource<ApiPost[]>(
    enabled && user ? "/posts?tab=hidden&limit=100" : null,
    [],
  );
  const commentList = useApiList<ApiComment>(
    commentPost ? `/posts/${commentPost}/comments` : null,
  );
  const posts: Post[] = list.data.map((post) => ({
    ...post,
    avatar: initials(post.name),
    color: post.anonymous ? "lavender" : "blue",
    time: `${displayDate(post.createdAt)} · ${displayTime(post.createdAt)}`,
    following: Boolean(post.following),
    open: Boolean(post.openToWork),
    own: Boolean(post.own),
    image: mediaUrl(post.image),
    saved: Boolean(post.saved),
    reposted: Boolean(post.reposted),
    referral: post.topic === "Offering referrals",
    dislikes: Number(post.dislikes),
    likes: Number(post.likes),
    comments: Number(post.comments),
    reposts: Number(post.reposts),
  }));
  const liked = posts
    .filter((post) => post.reaction === "like")
    .map((post) => post.id);
  const disliked = posts
    .filter((post) => post.reaction === "dislike")
    .map((post) => post.id);
  const saved = posts.filter((post) => post.saved).map((post) => post.id);
  const reposted = posts.filter((post) => post.reposted).map((post) => post.id);
  async function mutate(id: string, action: () => Promise<unknown>) {
    if (pending.includes(id)) return;
    setPending((current) => [...current, id]);
    try {
      await action();
      invalidate("posts");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setPending((current) => current.filter((item) => item !== id));
    }
  }
  const react = (id: string, reaction: "like" | "dislike") =>
    mutate(id, () =>
      api(`/posts/${id}/reaction`, {
        method:
          posts.find((post) => post.id === id)?.reaction === reaction
            ? "DELETE"
            : "PUT",
        body: { reaction },
      }),
    );
  function resetFeedFilters() {
    setFeedTopic("");
    setFeedCompany("");
    setFeedSort("Latest");
  }
  async function restoreHiddenPosts() {
    try {
      await api("/posts/hidden/all", { method: "DELETE" });
      invalidate("posts");
    } catch (error) {
      notify(apiMessage(error));
    }
  }
  async function addComment(id: string) {
    if (!comment.trim()) return;
    const text = comment.trim();
    await mutate(id, async () => {
      await api(`/posts/${id}/comments`, { method: "POST", body: { text } });
      setComment("");
    });
  }
  return {
    tab,
    setTab,
    feedTopic,
    setFeedTopic,
    exploreTopic,
    setExploreTopic,
    feedCompany,
    setFeedCompany,
    feedSort,
    setFeedSort,
    posts,
    visiblePosts: posts,
    filteredPosts: posts,
    liked,
    disliked,
    saved,
    reposted,
    hiddenPosts: hidden.data.map((post) => post.id),
    restoreHiddenPosts,
    resetFeedFilters,
    commentPost,
    setCommentPost,
    comment,
    setComment,
    comments: commentPost ? { [commentPost]: commentList.data } : {},
    commentsLoading: commentList.loading,
    commentsError: commentList.error,
    commentsHasMore: commentList.hasMore,
    loadMoreComments: commentList.loadMore,
    toggleLike: (id: string) => react(id, "like"),
    toggleDislike: (id: string) => react(id, "dislike"),
    toggleBookmark: (id: string) =>
      mutate(id, () =>
        api(`/posts/${id}/bookmark`, {
          method: saved.includes(id) ? "DELETE" : "PUT",
        }),
      ),
    toggleRepost: (id: string) =>
      mutate(id, () =>
        api(`/posts/${id}/repost`, {
          method: reposted.includes(id) ? "DELETE" : "PUT",
        }),
      ),
    hidePost: (id: string) =>
      mutate(id, () => api(`/posts/${id}/hide`, { method: "PUT" })),
    toggleComments: (id: string) => {
      setCommentPost((current) => (current === id ? null : id));
      setComment("");
    },
    addComment,
    feedLoading: list.loading,
    feedError: list.error,
    feedHasMore: list.hasMore,
    loadMorePosts: list.loadMore,
    postPending: pending,
  };
}
