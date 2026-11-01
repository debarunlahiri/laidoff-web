"use client";

import Dialog from "@/components/ui/dialog";
import { apiMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { usePlatform } from "@/providers/platform-provider";
import { Save, X } from "lucide-react";
import { useState } from "react";

export default function ProfileEditDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const { user, updateProfile } = useAuth();
  const { notify } = usePlatform();
  const [name, setName] = useState(user?.name ?? "");
  const [role, setRole] = useState(user?.role ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [about, setAbout] = useState(user?.about ?? "");
  const [skills, setSkills] = useState((user?.skills ?? []).join(", "));
  const [nextChapter, setNextChapter] = useState(user?.nextChapter ?? "");
  const [openToWork, setOpenToWork] = useState(Boolean(user?.openToWork));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile({
        name: name.trim(),
        role: role.trim(),
        location: location.trim(),
        about,
        nextChapter,
        openToWork,
        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      notify("Profile updated.");
      onClose();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog label="Edit profile" onClose={onClose}>
      <div className="modal-heading">
        <h2>Edit profile</h2>
        <button
          className="icon-button"
          aria-label="Close profile form"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </div>
      <form className="referral-create-form" onSubmit={submit}>
        <label className="field-label">
          Name
          <input
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="field-label">
          Role
          <input
            maxLength={160}
            placeholder="e.g. Frontend Engineer"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          />
        </label>
        <label className="field-label">
          Location
          <input
            maxLength={160}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </label>
        <label className="field-label">
          About
          <textarea
            maxLength={5000}
            value={about}
            onChange={(event) => setAbout(event.target.value)}
          />
        </label>
        <label className="field-label">
          Skills (comma separated)
          <input
            placeholder="React, TypeScript, Node.js"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
          />
        </label>
        <label className="field-label">
          My next chapter
          <textarea
            maxLength={3000}
            value={nextChapter}
            onChange={(event) => setNextChapter(event.target.value)}
          />
        </label>
        <label className="field-label">
          <span>
            <input
              type="checkbox"
              checked={openToWork}
              onChange={(event) => setOpenToWork(event.target.checked)}
            />{" "}
            Open to work
          </span>
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="modal-bottom">
          <span />
          <button className="primary" disabled={!name.trim() || saving}>
            <Save size={16} />
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
