"use client";
import { pageHeadings } from "@/config/page-headings";
import { usePlatform } from "@/providers/platform-provider";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PageHeading() {
  const { section, openReferralForm } = usePlatform();
  const pathname = usePathname();
  if (pathname === "/referrals/new")
    return (
      <div className="page-heading">
        <div>
          <h1>Add a referral</h1>
          <p>Offer to refer someone and choose what they share with you.</p>
        </div>
      </div>
    );

  if (pathname === "/notifications")
    return (
      <div className="page-heading">
        <div>
          <h1>Notifications</h1>
          <p>
            Messages, comments, connections and referral updates in one place.
          </p>
        </div>
      </div>
    );

  return (
    <div className="page-heading">
      <div>
        <h1>{pageHeadings[section]}</h1>
        <p>
          {section === "Profile"
            ? "Your story, skills, and next chapter."
            : section === "Search"
              ? "People, posts, referrals and companies across the community."
              : section === "Member profile"
                ? "Their story, skills, and next chapter."
                : section === "Home"
                  ? "Share your story, find your people, and discover what’s next."
                  : "Across companies, industries, and chapters. You belong here."}
        </p>
      </div>
      {section === "Referrals" && (
        <button
          type="button"
          className="primary heading-add-post"
          onClick={() => openReferralForm()}
        >
          <Plus size={18} />
          Add referrals
        </button>
      )}
    </div>
  );
}
