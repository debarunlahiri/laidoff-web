"use client";

import { userInitials } from "@/providers/auth-provider";
import {
  AddPhotosLabel,
  usePhotoPicker,
} from "@/components/feed/composer-photos";
import { maxPostImages } from "@/lib/image-file";
import PostComposerFields from "@/components/feed/post-composer-fields";
import Avatar from "@/components/ui/avatar";
import { usePlatform } from "@/providers/platform-provider";
import { useImageDrop } from "@/hooks/use-image-drop";
import { requireSignIn } from "@/lib/api";
import { BarChart3, Earth, ImagePlus } from "lucide-react";
import { useState } from "react";

export default function ComposerTrigger() {
  const {
    currentUser,
    setTopic,
    anonymous,
    publish,
    postSaving,
    postImages,
    addPostImages,
    canPublish,
    notify,
    pollOpen,
    setPollOpen,
  } = usePlatform();
  const [expanded, setExpanded] = useState(false);

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
          <PostComposerFields />
          <div className="inline-composer-bottom">
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
      {!expanded && (
        <div className="composer-tools">
          <button
            disabled={postImages.length >= maxPostImages}
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
      )}
    </section>
  );
}
