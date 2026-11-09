"use client";

import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import ThemeToggle from "@/components/ui/theme-toggle";
import Avatar from "@/components/ui/avatar";
import { notFound, usePathname } from "next/navigation";
import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  FileText,
  Flag,
  ListChecks,
  Hash,
  Headset,
  LayoutDashboard,
  LoaderCircle,
  Mail,
  Menu,
  MessageSquare,
  ScrollText,
  Settings2,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { initials } from "./ui";

type Pending = {
  postReports: number;
  commentReports: number;
  workforceReports: number;
  pendingNotes?: number;
};
const PendingContext = createContext<{ pending: Pending; refresh: () => void }>(
  {
    pending: { postReports: 0, commentReports: 0, workforceReports: 0 },
    refresh: () => {},
  },
);
// Lets a page refresh the sidebar's badge counts after it resolves something.
export const usePending = () => useContext(PendingContext);

type Item = { href: string; label: string; icon: LucideIcon; badge?: number };
const crumbs: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Users",
  "/admin/content": "Content",
  "/admin/moderation": "Moderation",
  "/admin/notes": "Community notes",
  "/admin/workforce": "Layoff reports",
  "/admin/referrals": "Referrals",
  "/admin/hashtags": "Hashtags",
  "/admin/algorithm": "Feed algorithm",
  "/admin/email": "Email",
  "/admin/audit": "Audit log",
  "/admin/system": "System health",
  "/admin/support": "Support tickets",
};

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Pending>({
    postReports: 0,
    commentReports: 0,
    workforceReports: 0,
    pendingNotes: 0,
  });
  const [tick, setTick] = useState(0);
  const isAdmin = Boolean(user?.isAdmin);
  useEffect(() => {
    if (!isAdmin) return;
    let live = true;
    const load = () =>
      api<{ pending: Pending }>("/admin/analytics?days=7").then(
        (r) => live && setPending({ pendingNotes: 0, ...r.pending }),
        () => {},
      );
    void load();
    const timer = setInterval(load, 60000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [isAdmin, tick]);
  useEffect(() => setOpen(false), [pathname]);

  if (loading)
    return (
      <div className="auth-loading" role="status">
        <LoaderCircle className="auth-spinner" size={26} />
      </div>
    );
  // Same page non-admins get for any unknown URL.
  if (!user?.isAdmin) notFound();

  const groups: { title: string; items: Item[] }[] = [
    {
      title: "Overview",
      items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      title: "Members",
      items: [{ href: "/admin/users", label: "Users", icon: Users }],
    },
    {
      title: "Content",
      items: [
        { href: "/admin/content", label: "All posts", icon: FileText },
        {
          href: "/admin/moderation",
          label: "Reports",
          icon: Flag,
          badge: pending.postReports + pending.commentReports,
        },
        {
          href: "/admin/notes",
          label: "Community notes",
          icon: MessageSquare,
          badge: pending.pendingNotes,
        },
        { href: "/admin/hashtags", label: "Hashtags", icon: Hash },
        {
          href: "/admin/report-options",
          label: "Report options",
          icon: ListChecks,
        },
      ],
    },
    {
      title: "Jobs & Workforce",
      items: [
        { href: "/admin/companies", label: "Companies", icon: Building2 },
        { href: "/admin/referrals", label: "Referrals", icon: Briefcase },
        {
          href: "/admin/workforce",
          label: "Layoff reports",
          icon: BadgeCheck,
          badge: pending.workforceReports,
        },
      ],
    },
    {
      title: "Platform",
      items: [
        { href: "/admin/support", label: "Support tickets", icon: Headset },
        { href: "/admin/algorithm", label: "Feed algorithm", icon: Settings2 },
        { href: "/admin/email", label: "Email", icon: Mail },
        { href: "/admin/audit", label: "Audit log", icon: ScrollText },
        { href: "/admin/system", label: "System health", icon: Activity },
      ],
    },
  ];
  const active = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);
  const pathParts = pathname.split("/").filter(Boolean);
  const isDetailPage = pathParts.length > 2;
  const parentPath = isDetailPage
    ? `/${pathParts.slice(0, 2).join("/")}`
    : null;
  const current =
    crumbs[pathname] ??
    crumbs[`/${pathname.split("/").slice(1, 3).join("/")}`] ??
    "Admin";

  return (
    <PendingContext.Provider
      value={{ pending, refresh: () => setTick((n) => n + 1) }}
    >
      <div className="ac-shell">
        <aside className={`ac-side${open ? " open" : ""}`}>
          <div className="ac-brand">
            <span className="ac-logo">
              <ShieldCheck size={18} />
            </span>
            <span>
              LaidOffCircle
              <small>Admin console</small>
            </span>
          </div>
          <nav aria-label="Admin sections" className="ac-nav">
            {groups.map((group) => (
              <div key={group.title} className="ac-group">
                <h3>{group.title}</h3>
                {group.items.map(({ href, label, icon: Icon, badge }) => (
                  <Link
                    key={href}
                    href={href}
                    className={active(href) ? "active" : ""}
                    aria-current={active(href) ? "page" : undefined}
                  >
                    <Icon size={17} />
                    <span>{label}</span>
                    {badge ? <em>{badge > 99 ? "99+" : badge}</em> : null}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <Link href="/" className="ac-exit">
            <ArrowLeft size={16} /> Back to LaidOffCircle
          </Link>
        </aside>
        {open && <div className="ac-scrim" onClick={() => setOpen(false)} />}
        <div className="ac-main">
          <header className="ac-topbar">
            <button
              className="ac-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="ac-crumbs">
              {isDetailPage && parentPath ? (
                <Link href={parentPath} className="ac-crumb-back">
                  <ArrowLeft size={15} />
                  {crumbs[parentPath] ?? current}
                </Link>
              ) : (
                <>
                  <span>Admin</span>
                  <i>/</i>
                  <strong>{current}</strong>
                </>
              )}
            </div>
            <div className="ac-topbar-right">
              <ThemeToggle />
              <div className="ac-me">
                <Avatar
                  initials={initials(user.name)}
                  src={user.profileImageUrl}
                  small
                />
                <span>
                  <strong>{user.name}</strong>
                  <small>Administrator</small>
                </span>
              </div>
            </div>
          </header>
          <main className="ac-content">{children}</main>
        </div>
      </div>
    </PendingContext.Provider>
  );
}
