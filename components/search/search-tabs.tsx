"use client";

export type SearchTab =
  "all" | "users" | "posts" | "referrals" | "companies" | "topics";

export const searchTabs: { key: SearchTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "users", label: "People" },
  { key: "posts", label: "Posts" },
  { key: "referrals", label: "Referrals" },
  { key: "companies", label: "Companies" },
  { key: "topics", label: "Topics" },
];

export default function SearchTabs({
  active,
  onChange,
}: {
  active: SearchTab;
  onChange: (tab: SearchTab) => void;
}) {
  return (
    <div className="profile-tab-list" role="tablist" aria-label="Result types">
      {searchTabs.map(({ key, label }) => (
        <button
          key={key}
          role="tab"
          aria-selected={active === key}
          className={active === key ? "selected" : ""}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
