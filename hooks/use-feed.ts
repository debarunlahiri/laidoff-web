"use client";
import { initialPosts } from "@/data/posts";
import { useState } from "react";
export function useFeed(section: string, search: string, following: string[]) {
  const [tab, setTab] = useState("For you");
  const [posts, setPosts] = useState(initialPosts);
  const [liked, setLiked] = useState<number[]>([]);
  const [disliked, setDisliked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [reposted, setReposted] = useState<number[]>([]);
  const [comments, setComments] = useState<Record<number, string[]>>({});
  const [commentPost, setCommentPost] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [feedTopic, setFeedTopic] = useState("");
  const [feedCompany, setFeedCompany] = useState("");
  const [feedSort, setFeedSort] = useState("Latest");
  const [hiddenPosts, setHiddenPosts] = useState<number[]>([]);
  const visiblePosts = posts.filter((post) => !hiddenPosts.includes(post.id));
  const filteredPosts = visiblePosts
    .filter(
      (p) =>
        (section !== "Bookmarks" || saved.includes(p.id)) &&
        (tab !== "Following" || p.following || following.includes(p.name)) &&
        (tab !== "Layoff updates" || p.topic === "Layoff updates") &&
        (tab !== "Referrals" || p.referral) &&
        (!feedTopic || p.topic === feedTopic) &&
        (!feedCompany || p.company === feedCompany) &&
        `${p.name} ${p.text} ${p.company} ${p.topic}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (feedSort === "Most liked" && tab !== "Latest") {
        return (
          b.likes +
          Number(liked.includes(b.id)) -
          (a.likes + Number(liked.includes(a.id)))
        );
      }
      return posts.indexOf(a) - posts.indexOf(b);
    });

  function resetFeedFilters() {
    setFeedTopic("");
    setFeedCompany("");
    setFeedSort("Latest");
  }

  function hidePost(postId: number) {
    setHiddenPosts((current) => [...new Set([...current, postId])]);
  }

  function toggleLike(postId: number) {
    setDisliked((current) => current.filter((id) => id !== postId));
    setLiked((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    );
  }

  function toggleDislike(postId: number) {
    setLiked((current) => current.filter((id) => id !== postId));
    setDisliked((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    );
  }

  function toggleBookmark(postId: number) {
    setSaved((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    );
  }

  function toggleRepost(postId: number) {
    setReposted((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    );
  }

  function toggleComments(postId: number) {
    setCommentPost((current) => (current === postId ? null : postId));
  }

  function addComment(postId: number) {
    const text = comment.trim();
    if (!text) return;
    setComments((current) => ({
      ...current,
      [postId]: [...(current[postId] || []), text],
    }));
    setComment("");
  }

  return {
    feedTopic,
    setFeedTopic,
    feedCompany,
    setFeedCompany,
    feedSort,
    setFeedSort,
    hiddenPosts,
    setHiddenPosts,
    hidePost,
    visiblePosts,
    resetFeedFilters,
    toggleLike,
    toggleDislike,
    toggleBookmark,
    toggleRepost,
    toggleComments,
    addComment,
    tab,
    setTab,
    posts,
    setPosts,
    liked,
    disliked,
    setLiked,
    saved,
    setSaved,
    reposted,
    setReposted,
    comments,
    setComments,
    commentPost,
    setCommentPost,
    comment,
    setComment,
    filteredPosts,
  };
}
