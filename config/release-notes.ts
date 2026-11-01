// Shown in the "What's new" panel. Bump `latestRelease` when adding an entry.
export const latestRelease = "2026-11-01";
export const releaseNotes: {
  date: string;
  title: string;
  items: string[];
}[] = [
  {
    date: "1 Nov 2026",
    title: "Referrals, rebuilt",
    items: [
      "Rate referrers as helpful or not helpful, with a Top referrer badge.",
      "Filter by company, location, skill, experience, work arrangement, level and date. Sort by newest, most helpful or most requested.",
      "Referrers choose what requesters share, including a resume or CV upload kept private to the referrer.",
      "Add a referral on its own page with a live preview, skill chips and Google Maps place search.",
      "Withdraw a pending request, or delete your own referral.",
    ],
  },
  {
    date: "1 Nov 2026",
    title: "Look and feel",
    items: [
      "Dark mode, switchable from your account menu.",
      "Animations across clicks, pages, dialogs and lists, respecting reduced-motion settings.",
      "A collapsible sidebar and a redesigned My network page.",
    ],
  },
  {
    date: "31 Oct 2026",
    title: "Conversations",
    items: [
      "Live messages, typing indicators and sent/seen status over WebSocket.",
      "Comments with likes, dislikes, replies and sharing, two levels deep.",
      "Posts with up to six photos, or photos only.",
      "Profile photo cropping and cover images.",
    ],
  },
];
