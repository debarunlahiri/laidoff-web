"use client";
import {
  AddPhotosLabel,
  PhotoGrid,
  usePhotoPicker,
} from "@/components/feed/composer-photos";
import { maxPostImages } from "@/lib/image-file";
import SelectField from "@/components/ui/select-field";
import { userInitials } from "@/providers/auth-provider";
import Dialog from "@/components/ui/dialog";
import CompanyAutocomplete from "@/components/ui/company-autocomplete";
import Avatar from "@/components/ui/avatar";
import { pastedImages } from "@/lib/paste-files";
import { readImageFile } from "@/lib/image-file";
import { apiMessage } from "@/lib/api";
import { usePlatform } from "@/providers/platform-provider";
import { useImageDrop } from "@/hooks/use-image-drop";
import { requireSignIn } from "@/lib/api";
import PollBuilder from "@/components/feed/poll-builder";
import { ArrowRight, BarChart3, Earth, ImagePlus, X } from "lucide-react";

export default function PostComposerDialog() {
  const {
    currentUser,
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
    postSaving,
    postImages,
    addPostImages,
    removePostImage,
    canPublish,
    pollOpen,
    setPollOpen,
    postTopics,
    notify,
  } = usePlatform();
  const { dragging, dropProps } = useImageDrop({
    onImages: addPostImages,
    onError: notify,
    canDrop: () => {
      if (currentUser) return true;
      requireSignIn();
      return false;
    },
  });

  const picker = usePhotoPicker({ onAdd: addPostImages, onError: notify });

  if (!composer) return null;

  return (
    <Dialog
      label="Create a public post"
      onClose={() => setComposer(false)}
      className={dragging ? "drop-active" : ""}
      sectionProps={dropProps}
    >
      {dragging && (
        <div className="drop-overlay" aria-hidden="true">
          <ImagePlus size={26} />
          Drop photos to attach them
        </div>
      )}
      <div className="modal-heading">
        <h2>Share with your circle</h2>
        <button
          className="icon-button"
          aria-label="Close composer"
          onClick={() => setComposer(false)}
        >
          <X size={21} />
        </button>
      </div>
      <div className="composer-identity">
        <Avatar
          initials={
            anonymous ? "AM" : userInitials(currentUser?.name ?? "Member")
          }
          src={anonymous ? null : currentUser?.profileImageUrl}
        />
        <span>
          <strong>
            {anonymous
              ? "Anonymous member"
              : (currentUser?.name ?? "Community member")}
          </strong>
          <small>
            <Earth size={12} />
            Public · Visible across all companies
          </small>
        </span>
      </div>
      <textarea
        autoFocus
        placeholder={
          pollOpen
            ? "Ask your question…"
            : "Your story, a question, a little encouragement…"
        }
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
        onChange={(e) => setDraft(e.target.value)}
      />
      <PhotoGrid images={postImages} onRemove={removePostImage} />
      {picker.input}
      <button
        type="button"
        className="text-button"
        disabled={postImages.length >= maxPostImages}
        onClick={picker.open}
      >
        <AddPhotosLabel count={postImages.length} />
      </button>
      <button
        type="button"
        className="text-button"
        aria-pressed={pollOpen}
        onClick={() => setPollOpen(!pollOpen)}
      >
        <BarChart3 size={16} /> {pollOpen ? "Remove poll" : "Add poll"}
      </button>
      {pollOpen && <PollBuilder />}
      <div className="form-row">
        <SelectField
          label="Topic (optional)"
          placeholder="No topic"
          value={topic}
          options={[
            { value: "", label: "No topic" },
            ...postTopics.map((t) => ({ value: t, label: t })),
          ]}
          onChange={setTopic}
        />
        <CompanyAutocomplete value={company} onChange={setCompany} />
      </div>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        Post anonymously
      </label>
      <div className="modal-bottom">
        <span>No company or topic required. Everyone’s welcome.</span>
        <button
          className="primary"
          disabled={!canPublish || postSaving}
          onClick={publish}
        >
          Publish post <ArrowRight size={16} />
        </button>
      </div>
    </Dialog>
  );
}
