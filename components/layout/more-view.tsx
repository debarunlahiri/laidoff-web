"use client";
import Avatar from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { useAuth, userInitials } from "@/providers/auth-provider";
import { usePlatform } from "@/providers/platform-provider";
import {
  Bell,
  BarChart3,
  Bookmark,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const tiles = [
  { label: "My network", text: "Network", icon: Users },
  { label: "Referrals", text: "Referrals", icon: BriefcaseBusiness },
  { label: "Workforce insights", text: "Insights", icon: BarChart3 },
  { label: "Bookmarks", text: "Saved", icon: Bookmark },
  { label: "Notifications", text: "Alerts", icon: Bell },
] as const;

// The "More" tab: profile, shortcuts and settings, shown as a normal page.
export default function MoreView() {
  const { navigate, notify, notificationCount } = usePlatform();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const dark = theme === "dark";

  return (
    <div className="more-page">
      {user ? (
        <Link href="/profile" className="more-profile card">
          <Avatar
            initials={userInitials(user.name)}
            src={user.profileImageUrl}
          />
          <span>
            <strong>{user.name}</strong>
            <small>View your profile</small>
          </span>
          <ChevronRight size={20} />
        </Link>
      ) : (
        <Link href="/login" className="more-profile card">
          <span className="more-signin-icon">
            <LogIn size={22} />
          </span>
          <span>
            <strong>Sign in</strong>
            <small>Join the circle to post and message</small>
          </span>
          <ChevronRight size={20} />
        </Link>
      )}
      <div className="more-grid">
        {tiles.map(({ label, text, icon: Icon }) => (
          <button key={label} onClick={() => navigate(label)}>
            <span className="more-tile-icon">
              <Icon size={22} />
              {label === "Notifications" && notificationCount > 0 && (
                <i>{notificationCount > 9 ? "9+" : notificationCount}</i>
              )}
            </span>
            {text}
          </button>
        ))}
        <button
          onClick={() =>
            notify(
              "Be respectful, protect personal information, and keep referrals free. Report posts that need review from their options menu.",
            )
          }
        >
          <span className="more-tile-icon">
            <CircleHelp size={22} />
          </span>
          Help
        </button>
      </div>
      <div className="more-list card">
        <button role="switch" aria-checked={dark} onClick={toggle}>
          {dark ? <Sun size={20} /> : <Moon size={20} />}
          <span>{dark ? "Light mode" : "Dark mode"}</span>
          <span
            className={`theme-switch${dark ? " on" : ""}`}
            aria-hidden="true"
          />
        </button>
        {user && (
          <button
            className="danger"
            onClick={async () => {
              try {
                await logout();
                router.replace("/");
              } catch {
                notify("Could not sign out. Please try again.");
              }
            }}
          >
            <LogOut size={20} />
            <span>Sign out</span>
          </button>
        )}
      </div>
    </div>
  );
}
