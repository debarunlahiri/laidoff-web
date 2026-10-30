"use client";

import Avatar from "@/components/ui/avatar";
import { usePlatform } from "@/providers/platform-provider";
import { Bookmark, ChevronDown, CircleHelp, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function AccountMenu() {
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
        <Avatar initials="JM" small />
        <span className="account-summary">
          <strong>Jamie Morgan</strong>
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
            <strong>Jamie Morgan</strong>
            <span>Your account</span>
          </div>
          <Link href="/profile" onClick={() => setOpen(false)}>
            <UserRound size={18} /> View profile
          </Link>
          <Link href="/bookmarks" onClick={() => setOpen(false)}>
            <Bookmark size={18} /> Saved posts
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              notify("Need a hand? Contact hello@layoffcircle.example (demo).");
            }}
          >
            <CircleHelp size={18} /> Help & community guidelines
          </button>
        </div>
      )}
    </div>
  );
}
