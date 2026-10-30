"use client";
import { pageHeadings } from "@/config/page-headings";
import { usePlatform } from "@/providers/platform-provider";
import { Plus } from "lucide-react";

export default function PageHeading() {
  const { section, setComposer, setReferralComposer } = usePlatform();

  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <span />A LITTLE CONNECTION GOES A LONG WAY
        </div>
        <h1>{pageHeadings[section]}</h1>
        <p>
          {section === "Profile"
            ? "Your story, skills, and next chapter."
            : section === "Home"
              ? "Share your story, find your people, and discover what’s next."
              : "Across companies, industries, and chapters. You belong here."}
        </p>
      </div>
      <button
        type="button"
        className="primary heading-add-post"
        onClick={() =>
          section === "Referrals"
            ? setReferralComposer(true)
            : setComposer(true)
        }
      >
        <Plus size={18} />
        {section === "Referrals" ? "Add referrals" : "Add post"}
      </button>
    </div>
  );
}
