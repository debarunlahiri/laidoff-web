"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import type { Post } from "@/types";

type CommunityNotesOptions = {
  setPosts: Dispatch<SetStateAction<Post[]>>;
  notify: (message: string) => void;
};

export function useCommunityNotes({ setPosts, notify }: CommunityNotesOptions) {
  const [notePost, setNotePost] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [source, setSource] = useState("");
  const canProposeNote = Boolean(
    note.trim() && /^https?:\/\/\S+\.\S+/.test(source),
  );

  function openNoteDialog(postId: number) {
    setNotePost(postId);
    setNote("");
    setSource("");
  }

  function proposeNote() {
    if (notePost === null || !canProposeNote) return;
    setPosts((current) =>
      current.map((post) =>
        post.id === notePost
          ? { ...post, note: `${note.trim()} Source: ${source.trim()}` }
          : post,
      ),
    );
    setNotePost(null);
    notify("Community Note proposed for evaluation.");
  }

  function reportPost() {
    setNotePost(null);
    notify("Report recorded for review in this demo.");
  }

  return {
    notePost,
    setNotePost,
    note,
    setNote,
    source,
    setSource,
    canProposeNote,
    openNoteDialog,
    proposeNote,
    reportPost,
  };
}
