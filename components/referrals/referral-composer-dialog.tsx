"use client";

import CompanyAutocomplete from "@/components/ui/company-autocomplete";
import Dialog from "@/components/ui/dialog";
import { usePlatform } from "@/providers/platform-provider";
import { BriefcaseBusiness, X } from "lucide-react";
import { useState } from "react";

export default function ReferralComposerDialog() {
  const { referralComposer, setReferralComposer, addReferral } = usePlatform();
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const valid = [company, title, location, skills].every((value) =>
    value.trim(),
  );

  if (!referralComposer) return null;

  return (
    <Dialog
      label="Add a referral opportunity"
      onClose={() => setReferralComposer(false)}
    >
      <div className="modal-heading">
        <h2>Add a referral</h2>
        <button
          className="icon-button"
          aria-label="Close referral form"
          onClick={() => setReferralComposer(false)}
        >
          <X size={21} />
        </button>
      </div>
      <p className="subtle-text">
        Share a role you can refer someone for. Your opportunity will appear on
        the Referrals page.
      </p>
      <form
        className="referral-create-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (addReferral({ company, title, location, skills, description })) {
            setCompany("");
            setTitle("");
            setLocation("");
            setSkills("");
            setDescription("");
          }
        }}
      >
        <CompanyAutocomplete value={company} onChange={setCompany} required />
        <label className="field-label">
          Job title
          <input
            required
            maxLength={120}
            placeholder="e.g. Senior Frontend Engineer"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="field-label">
          Location & work arrangement
          <input
            required
            maxLength={160}
            placeholder="e.g. Bengaluru, India · Hybrid"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </label>
        <label className="field-label">
          Skills & experience
          <input
            required
            maxLength={200}
            placeholder="e.g. React, TypeScript · 4+ years"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
          />
        </label>
        <label className="field-label">
          Additional details (optional)
          <textarea
            maxLength={3000}
            placeholder="About the team, the role, and how you can help with a referral…"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <div className="modal-bottom">
          <span>Offered by Jamie Morgan · Referrals are always free.</span>
          <button className="primary" disabled={!valid}>
            <BriefcaseBusiness size={16} />
            Add referral
          </button>
        </div>
      </form>
    </Dialog>
  );
}
