import Avatar from "@/components/ui/avatar";
import { mediaUrl } from "@/lib/api";
import { userInitials } from "@/providers/auth-provider";
import { ExternalLink, MapPin, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export type ProfileData = {
  name: string;
  role?: string | null;
  location?: string | null;
  about?: string | null;
  skills?: string[] | null;
  nextChapter?: string | null;
  openToWork?: boolean;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  websiteUrl?: string | null;
  linkedinProfileUrl?: string | null;
};

// Presentational profile layout shared by "my profile" and member profiles.
export default function ProfileCard({
  profile,
  subtitle,
  actions,
  coverControls,
  avatarControls,
  children,
}: {
  profile: ProfileData;
  subtitle?: string;
  actions?: ReactNode;
  // Edit controls for the owner; omitted on other members' profiles.
  coverControls?: ReactNode;
  avatarControls?: ReactNode;
  children?: ReactNode;
}) {
  const links = [
    { label: "Website", href: profile.websiteUrl },
    { label: "LinkedIn", href: profile.linkedinProfileUrl },
  ].filter((link) => link.href);
  return (
    <article className="pf card">
      <div
        className="pf-cover"
        style={
          profile.coverImageUrl
            ? { backgroundImage: `url(${mediaUrl(profile.coverImageUrl)})` }
            : undefined
        }
      >
        {coverControls}
      </div>
      <div className="pf-head">
        <div className="pf-avatar profile-avatar-wrap">
          <Avatar
            initials={userInitials(profile.name || "Member")}
            src={profile.profileImageUrl}
          />
          {avatarControls}
        </div>
        <div className="pf-title">
          <h2>{profile.name}</h2>
          <p className="pf-role">{profile.role || subtitle}</p>
          {profile.location && (
            <p className="pf-location">
              <MapPin size={15} aria-hidden="true" /> {profile.location}
            </p>
          )}
        </div>
        <div className="pf-actions">
          {Boolean(profile.openToWork) && (
            <span className="pf-open">
              <i aria-hidden="true" /> Open to work
            </span>
          )}
          {actions}
        </div>
      </div>
      <div className="pf-body">
        <div className="pf-main">
          <section className="pf-chapter" aria-labelledby="pf-chapter-title">
            <h3 id="pf-chapter-title">
              <Sparkles size={16} aria-hidden="true" /> Next chapter
            </h3>
            {profile.nextChapter ? (
              <p>{profile.nextChapter}</p>
            ) : (
              <p className="pf-empty">Not shared yet.</p>
            )}
          </section>
          <section className="pf-about" aria-labelledby="pf-about-title">
            <h3 id="pf-about-title">About</h3>
            {profile.about ? (
              <p>{profile.about}</p>
            ) : (
              <p className="pf-empty">Not shared yet.</p>
            )}
          </section>
        </div>
        <aside className="pf-side">
          <section aria-labelledby="pf-skills-title">
            <h3 id="pf-skills-title">Skills</h3>
            {profile.skills?.length ? (
              <div className="pf-skills">
                {profile.skills.map((skill) => (
                  <span key={skill} className="pf-skill">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="pf-empty">No skills added yet.</p>
            )}
          </section>
          {links.length > 0 && (
            <section aria-labelledby="pf-links-title">
              <h3 id="pf-links-title">Links</h3>
              <ul className="pf-links">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href!}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      <ExternalLink size={14} aria-hidden="true" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
      {children}
    </article>
  );
}
