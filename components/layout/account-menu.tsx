"use client";

import { useAuth, userInitials } from "@/providers/auth-provider";
import { googleSignInAvailable } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/avatar";
import { usePlatform } from "@/providers/platform-provider";
import {
  Bookmark,
  ChevronDown,
  CircleHelp,
  UserRound,
  LogOut,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function AccountMenu() {
  const { user, logout, linkGoogle } = useAuth();
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { notify, accountOpen: open, setAccountOpen: setOpen } = usePlatform();

  useEffect(() => {
    if (!open) return;

    function closeOutside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div
      className="account-menu"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Link
        className="account-profile-link"
        href="/profile"
        aria-label="Open your profile"
        onClick={() => setOpen(false)}
      >
        <Avatar initials={userInitials(user?.name ?? "Member")} small />
        <span className="account-summary">
          <strong>{user?.name ?? "Your account"}</strong>
          <small>View your profile</small>
        </span>
      </Link>
      <button
        ref={trigger}
        className="icon-button account-menu-trigger"
        aria-label="Account options"
        aria-expanded={open}
        aria-controls={open ? "account-options" : undefined}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <ChevronDown size={18} />
      </button>
      {open && (
        <div className="account-dropdown card" id="account-options">
          <div className="account-dropdown-heading">
            <strong>{user?.name ?? "Your account"}</strong>
            <span>Your account</span>
          </div>
          <Link href="/profile" onClick={() => setOpen(false)}>
            <UserRound size={18} /> View profile
          </Link>
          <Link href="/bookmarks" onClick={() => setOpen(false)}>
            <Bookmark size={18} /> Saved posts
          </Link>
          {googleSignInAvailable && (
            <button
              onClick={async () => {
                setOpen(false);
                try {
                  await linkGoogle();
                  notify(
                    "Google account linked. You can now sign in with Google.",
                  );
                } catch (error) {
                  notify(
                    error instanceof Error
                      ? error.message
                      : "Google could not be linked.",
                  );
                }
              }}
            >
              <LinkIcon size={18} />
              Link Google account
            </button>
          )}
          <button
            onClick={async () => {
              setOpen(false);
              try {
                await logout();
                router.replace("/login");
              } catch {
                notify("Could not sign out. Please try again.");
              }
            }}
          >
            <LogOut size={18} />
            Sign out
          </button>
          <button
            onClick={() => {
              setOpen(false);
              notify(
                "Be respectful, protect personal information, and keep referrals free. Report posts that need review from their options menu.",
              );
            }}
          >
            <CircleHelp size={18} /> Help & community guidelines
          </button>
        </div>
      )}
    </div>
  );
}
