"use client";

import { settingsSections } from "@/config/settings";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Settings opens in its own layout: the main list on the left, the chosen
// sub-settings page on the right. On phones the list and the page alternate.
export default function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = settingsSections.find(
    (section) => pathname === `/settings/${section.slug}`,
  );
  return (
    <div className={`settings-page${active ? " has-section" : ""}`}>
      <nav className="settings-list" aria-label="Settings">
        <div className="settings-list-heading">
          <Settings size={20} aria-hidden="true" />
          <h1>Settings</h1>
        </div>
        <p className="settings-list-intro">Make yourself at home.</p>
        <ul>
          {settingsSections.map(({ slug, label, description, icon: Icon }) => (
            <li key={slug}>
              <Link
                href={`/settings/${slug}`}
                aria-current={active?.slug === slug ? "page" : undefined}
              >
                <span className="settings-icon">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span className="settings-text">
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <section className="settings-panel" aria-live="polite">
        {active && (
          <Link href="/settings" className="settings-back">
            <ChevronLeft size={16} aria-hidden="true" /> Settings
          </Link>
        )}
        {children}
      </section>
    </div>
  );
}
