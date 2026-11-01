"use client";

import { userInitials } from "@/providers/auth-provider";
import {
  AddPhotosLabel,
  PhotoGrid,
  usePhotoPicker,
} from "@/components/feed/composer-photos";
import { maxPostImages, readImageFile } from "@/lib/image-file";
import SelectField from "@/components/ui/select-field";
import CompanyAutocomplete from "@/components/ui/company-autocomplete";
import Avatar from "@/components/ui/avatar";
import { pastedImages } from "@/lib/paste-files";
import { usePlatform } from "@/providers/platform-provider";
import { useImageDrop } from "@/hooks/use-image-drop";
import { apiMessage, requireSignIn } from "@/lib/api";
import PollBuilder from "@/components/feed/poll-builder";
import { BarChart3, Earth, ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ComposerTrigger() {
  const {
    currentUser,
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
    postImages,
    addPostImages,
    removePostImage,
    canPublish,
    notify,
    postTopics,
    pollOpen,
    setPollOpen,
  } = usePlatform();
  const [expanded, setExpanded] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const { dragging, dropProps } = useImageDrop({
    onImages: (dataUrls) => {
      addPostImages(dataUrls);
      setExpanded(true);
    },
    onError: notify,
    canDrop: () => {
      if (currentUser) return true;
      requireSignIn();
      return false;
    },
  });

  const picker = usePhotoPicker({
    onAdd: addPostImages,
    onError: notify,
    onPicked: () => setExpanded(true),
  });

  useEffect(() => {
    if (expanded) textarea.current?.focus();
  }, [expanded]);

  function expand(nextTopic?: string) {
    if (!currentUser) {
      window.location.assign(
        `/login?next=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    if (nextTopic) setTopic(nextTopic);
    setExpanded(true);
  }

  return (
    <section
      className={`composer card${expanded ? " composer-expanded" : ""}${dragging ? " drop-active" : ""}`}
      aria-label="Create a post"
      {...dropProps}
    >
      {dragging && (
        <div className="drop-overlay" aria-hidden="true">
          <ImagePlus size={26} />
          Drop photos to attach them
        </div>
      )}
      <div>
        <Avatar
          initials={
            anonymous ? "AM" : userInitials(currentUser?.name ?? "Member")
          }
          src={anonymous ? null : currentUser?.profileImageUrl}
        />
        {expanded ? (
          <span className="inline-composer-name">
            {anonymous
              ? "Anonymous member"
              : (currentUser?.name ?? "Community member")}
          </span>
        ) : (
          <button aria-expanded={expanded} onClick={() => expand()}>
            What’s on your mind?
          </button>
        )}
        <span className="public-label">
          <Earth size={13} />
          Public
        </span>
      </div>
      {expanded && (
        <form
          className="inline-composer-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!canPublish) return;
            if (await publish()) setExpanded(false);
          }}
        >
          <textarea
            ref={textarea}
            aria-label="Post text"
            placeholder="What’s on your mind?"
            value={draft}
            onPaste={async (event) => {
              const pasted = pastedImages(event);
              if (!pasted.length) return;
              const results = await Promise.allSettled(
                pasted.map((f) => readImageFile(f)),
              );
              const good = results.flatMap((r) =>
                r.status === "fulfilled" ? [r.value] : [],
              );
              const failed = results.find((r) => r.status === "rejected");
              if (failed)
                notify(apiMessage((failed as PromiseRejectedResult).reason));
              if (good.length) addPostImages(good);
            }}
            onChange={(event) => {
              setDraft(event.target.value);
              event.target.style.height = "auto";
              event.target.style.height = `${event.target.scrollHeight}px`;
            }}
          />
          <PhotoGrid images={postImages} onRemove={removePostImage} />
          {pollOpen && <PollBuilder />}
          <div className="form-row">
            <SelectField
              label="Topic (optional)"
              placeholder="No topic"
              value={topic}
              options={[
                { value: "", label: "No topic" },
                ...postTopics.map((item) => ({ value: item, label: item })),
              ]}
              onChange={setTopic}
            />
            <CompanyAutocomplete value={company} onChange={setCompany} />
          </div>
          <div className="inline-composer-bottom">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
              />
              Post anonymously
            </label>
            <div>
              <button
                type="button"
                className="text-button"
                onClick={() => setExpanded(false)}
              >
                Collapse
              </button>
              <button className="primary" disabled={!canPublish || postSaving}>
                Post
              </button>
            </div>
          </div>
        </form>
      )}
      {picker.input}
      <div className="composer-tools">
        <button
          disabled={expanded && postImages.length >= maxPostImages}
          onClick={() => {
            expand();
            if (currentUser) picker.open();
          }}
        >
          <AddPhotosLabel count={postImages.length} />
        </button>
        <button
          type="button"
          aria-pressed={pollOpen}
          onClick={() => {
            expand();
            if (currentUser) setPollOpen(!pollOpen);
          }}
        >
          <BarChart3 size={16} /> {pollOpen ? "Remove poll" : "Add poll"}
        </button>
      </div>
    </section>
  );
}
