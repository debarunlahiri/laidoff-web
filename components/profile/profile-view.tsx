"use client";
import { useAuth, userInitials } from "@/providers/auth-provider";
import Avatar from "@/components/ui/avatar";
import { BriefcaseBusiness, Sparkles } from "lucide-react";

export default function ProfileView() {
  const { user } = useAuth();
  return (
    <article className="profile-page card">
      <div className="profile-cover" />
      <div className="profile-page-content">
        <div className="profile-identity">
          <Avatar initials={userInitials(user?.name ?? "Member")} />
          {user?.openToWork && (
            <span className="tag green-tag">
              <BriefcaseBusiness size={15} /> Open to work
            </span>
          )}
        </div>
        <h2>{user?.name}</h2>
        <p className="profile-role">{user?.role || user?.email}</p>
        <section className="profile-section">
          <h3>About</h3>
          <p>{user?.about || "Your next chapter starts here."}</p>
        </section>
        <section className="profile-section">
          <h3>Skills</h3>
          <div className="profile-skills">
            {user?.skills?.length ? (
              user.skills.map((skill) => (
                <span key={skill} className="tag">
                  {skill}
                </span>
              ))
            ) : (
              <span className="subtle-text">No skills added yet.</span>
            )}
          </div>
        </section>
        <section className="profile-section">
          <h3>
            <Sparkles size={18} /> My next chapter
          </h3>
          <p>
            {user?.nextChapter ||
              "Connect with your circle and discover opportunities."}
          </p>
        </section>
      </div>
    </article>
  );
}
