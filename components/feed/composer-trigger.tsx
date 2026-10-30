"use client";

import { userInitials } from "@/providers/auth-provider";
import CompanyAutocomplete from "@/components/ui/company-autocomplete";
import Avatar from "@/components/ui/avatar";
import { postTopics } from "@/config/feed";
import { usePlatform } from "@/providers/platform-provider";
import { Earth, ImagePlus, X } from "lucide-react";
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
    postImage,
    setPostImage,
    notify,
  } = usePlatform();
  const [expanded, setExpanded] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

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
      className={`composer card${expanded ? " composer-expanded" : ""}`}
      aria-label="Create a post"
    >
      <div>
        <Avatar
          initials={
            anonymous ? "AM" : userInitials(currentUser?.name ?? "Member")
          }
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
            if (!draft.trim()) return;
            if (await publish()) setExpanded(false);
          }}
        >
          <textarea
            ref={textarea}
            aria-label="Post text"
            placeholder="What’s on your mind?"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              event.target.style.height = "auto";
              event.target.style.height = `${event.target.scrollHeight}px`;
            }}
          />
          {postImage && (
            <div className="composer-image-preview">
              <img src={postImage} alt="Selected post attachment" />
              <button
                type="button"
                className="icon-button"
                aria-label="Remove photo"
                onClick={() => setPostImage("")}
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div className="form-row">
            <label>
              Topic (optional)
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              >
                <option value="">No topic</option>
                {postTopics.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
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
              <button
                className="primary"
                disabled={!draft.trim() || postSaving}
              >
                Post
              </button>
            </div>
          </div>
        </form>
      )}
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (
            !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
              file.type,
            ) ||
            file.size > 5 * 1024 * 1024
          ) {
            notify("Choose a PNG, JPEG, WebP, or GIF under 5 MB.");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            setPostImage(String(reader.result));
            expand();
          };
          reader.onerror = () =>
            notify("Could not read this photo. Try another image.");
          reader.readAsDataURL(file);
        }}
      />
      <div className="composer-tools">
        <button
          onClick={() => {
            expand();
            if (currentUser) fileInput.current?.click();
          }}
        >
          <ImagePlus size={17} />
          <span>Add photos</span>
        </button>
      </div>
    </section>
  );
}
