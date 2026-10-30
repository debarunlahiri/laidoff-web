"use client";
import { userInitials } from "@/providers/auth-provider";
import Dialog from "@/components/ui/dialog";
import { postTopics } from "@/config/feed";
import CompanyAutocomplete from "@/components/ui/company-autocomplete";
import Avatar from "@/components/ui/avatar";
import { usePlatform } from "@/providers/platform-provider";
import { ArrowRight, Earth, X } from "lucide-react";

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
    postImage,
    setPostImage,
  } = usePlatform();

  if (!composer) return null;

  return (
    <Dialog label="Create a public post" onClose={() => setComposer(false)}>
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
        placeholder="Your story, a question, a little encouragement…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
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
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">No topic</option>
            {postTopics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
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
          disabled={!draft.trim() || postSaving}
          onClick={publish}
        >
          Publish post <ArrowRight size={16} />
        </button>
      </div>
    </Dialog>
  );
}
