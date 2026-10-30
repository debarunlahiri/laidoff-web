"use client";
import { useState } from "react";
import { api, apiMessage, invalidate } from "@/lib/api";
export function usePostComposer({
  setTab,
  navigate,
  notify,
}: {
  setTab: (tab: string) => void;
  navigate: (section: string) => void;
  notify: (message: string) => void;
}) {
  const [composer, setComposer] = useState(false);
  const [postImage, setPostImage] = useState("");
  const [draft, setDraft] = useState("");
  const [topic, setTopic] = useState("");
  const [company, setCompany] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [postSaving, setPostSaving] = useState(false);
  async function publish() {
    if (postSaving || !draft.trim()) return false;
    setPostSaving(true);
    try {
      let uploadId: string | undefined;
      if (postImage) {
        const response = await fetch(postImage);
        const blob = await response.blob();
        const body = new FormData();
        body.append("photo", blob, "post-photo");
        uploadId = (
          await api<{ id: string }>("/uploads", { method: "POST", body })
        ).id;
      }
      await api("/posts", {
        method: "POST",
        body: {
          text: draft.trim(),
          topic: topic || "General discussion",
          companyId: company || null,
          anonymous,
          uploadId: uploadId ?? null,
        },
      });
      setDraft("");
      setPostImage("");
      setCompany("");
      setTopic("");
      setAnonymous(false);
      setComposer(false);
      setTab("Latest");
      navigate("Home");
      invalidate("posts");
      notify("Your post has been published.");
      return true;
    } catch (error) {
      notify(apiMessage(error));
      return false;
    } finally {
      setPostSaving(false);
    }
  }
  return {
    composer,
    setComposer,
    postImage,
    setPostImage,
    draft,
    setDraft,
    topic,
    setTopic,
    company,
    setCompany,
    anonymous,
    setAnonymous,
    publish,
    postSaving,
  };
}
