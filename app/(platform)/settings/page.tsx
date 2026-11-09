import { settingsSections } from "@/config/settings";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function SettingsIndexPage() {
  return (
    <div className="settings-stack">
      <header className="settings-page-heading">
        <span className="settings-eyebrow">MAKE IT YOURS</span>
        <h2>Your preferences</h2>
        <p>A few small choices to make LaidOffCircle work better for you.</p>
      </header>
      <div className="settings-overview">
        {settingsSections.map(({ slug, label, description, icon: Icon }) => (
          <Link
            className="settings-overview-card"
            href={`/settings/${slug}`}
            key={slug}
          >
            <span className="settings-overview-top">
              <span className="settings-group-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </span>
            <h3>{label}</h3>
            <p>{description}</p>
            <span className="settings-overview-action">
              Manage {label.toLowerCase()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
