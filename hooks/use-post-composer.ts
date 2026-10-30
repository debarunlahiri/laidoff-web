"use client";
import type { Post } from "@/types";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
export function usePostComposer({
  setPosts,
  setTab,
  navigate,
  notify,
}: {
  setPosts: Dispatch<SetStateAction<Post[]>>;
  setTab: Dispatch<SetStateAction<string>>;
  navigate: (section: string) => void;
  notify: (message: string) => void;
}) {
  const [composer, setComposer] = useState(false);
  const [postImage, setPostImage] = useState("");
  const [draft, setDraft] = useState("");
  const [topic, setTopic] = useState("");
  const [company, setCompany] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  function publish() {
    if (!draft.trim()) return;
    setPosts((current) => [
      {
        id: Date.now(),
        name: anonymous ? "Anonymous member" : "Jamie Morgan",
        role: anonymous
          ? "Community member"
          : "Product Designer · Open to work",
        avatar: anonymous ? "AM" : "JM",
        color: "mint",
        time: "Just now",
        topic: topic || "General discussion",
        company,
        text: draft.trim(),
        image: postImage || undefined,
        likes: 0,
        comments: 0,
        reposts: 0,
      },
      ...current,
    ]);
    setDraft("");
    setPostImage("");
    setComposer(false);
    navigate("Home");
    setTab("Latest");
    notify("Your post is now in the global feed.");
  }
  return {
    postImage,
    setPostImage,
    composer,
    setComposer,
    draft,
    setDraft,
    topic,
    setTopic,
    company,
    setCompany,
    anonymous,
    setAnonymous,
    publish,
  };
}
