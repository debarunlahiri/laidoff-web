"use client";
import Dialog from "@/components/ui/dialog";
import { usePlatform } from "@/providers/platform-provider";
import { Flag, X } from "lucide-react";
import { useState } from "react";

export default function PostReportDialog() {
  const {
    reportPostId,
    closeReportDialog,
    reportCategories,
    reportCategoriesLoading,
    reportSaving,
    submitPostReport,
  } = usePlatform();
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");

  if (!reportPostId) return null;

  return (
    <Dialog label="Report this post" onClose={closeReportDialog}>
      <div className="modal-heading">
        <h2>Report this post</h2>
        <button
          className="icon-button"
          aria-label="Close"
          onClick={closeReportDialog}
        >
          <X size={21} />
        </button>
      </div>
      <p className="subtle-text">
        Tell us what’s wrong. Reports are reviewed by the team, and the author
        isn’t told who reported.
      </p>
      <form
        className="referral-create-form"
        onSubmit={(event) => {
          event.preventDefault();
          void submitPostReport(category, reason);
        }}
      >
        <fieldset className="report-categories">
          <legend className="sr-only">Reason for report</legend>
          {reportCategoriesLoading && <p role="status">Loading…</p>}
          {reportCategories.map((item) => (
            <label key={item.value} className="checkbox-label">
              <input
                type="radio"
                name="report-category"
                value={item.value}
                checked={category === item.value}
                onChange={() => setCategory(item.value)}
              />
              {item.label}
            </label>
          ))}
        </fieldset>
        <label className="field-label">
          More details (optional)
          <textarea
            maxLength={1000}
            placeholder="Anything that helps us review this faster…"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <div className="modal-bottom">
          <span />
          <button className="primary" disabled={!category || reportSaving}>
            <Flag size={16} />
            {reportSaving ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
