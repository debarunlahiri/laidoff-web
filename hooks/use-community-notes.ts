"use client";
import { useState } from "react";
import { api, apiMessage, invalidate } from "@/lib/api";
export function useCommunityNotes({
  notify,
}: {
  notify: (message: string) => void;
}) {
  const [notePost, setNotePost] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [source, setSource] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const canProposeNote = Boolean(
    note.trim() && /^https?:\/\/\S+\.\S+/.test(source),
  );
  function openNoteDialog(id: string) {
    setNotePost(id);
    setNote("");
    setSource("");
  }
  async function submit(report = false) {
    if (!notePost || noteSaving) return;
    setNoteSaving(true);
    try {
      await api(`/posts/${notePost}/${report ? "reports" : "notes"}`, {
        method: "POST",
        body: report
          ? { reason: note.trim() || "Requested review of this post" }
          : { text: note.trim(), sourceUrl: source.trim() },
      });
      setNotePost(null);
      invalidate("posts");
      notify(
        report
          ? "Report submitted for review."
          : "Community note proposed for review.",
      );
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setNoteSaving(false);
    }
  }
  return {
    notePost,
    setNotePost,
    note,
    setNote,
    source,
    setSource,
    openNoteDialog,
    canProposeNote,
    noteSaving,
    proposeNote: () => submit(),
    reportPost: () => submit(true),
  };
}
