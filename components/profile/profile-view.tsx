import Avatar from "@/components/ui/avatar";
import { BriefcaseBusiness, Sparkles } from "lucide-react";

export default function ProfileView() {
  return (
    <article className="profile-page card">
      <div className="profile-cover" />
      <div className="profile-page-content">
        <div className="profile-identity">
          <Avatar initials="JM" />
          <span className="tag green-tag">
            <BriefcaseBusiness size={15} /> Open to work
          </span>
        </div>
        <h2>Jamie Morgan</h2>
        <p className="profile-role">Product Designer</p>
        <section className="profile-section">
          <h3>About</h3>
          <p>
            Designing thoughtful digital experiences. Interested in product
            design, creative teams, and meaningful connections.
          </p>
        </section>
        <section className="profile-section">
          <h3>Skills</h3>
          <div className="profile-skills">
            <span className="tag">Product design</span>
            <span className="tag">Figma</span>
            <span className="tag">Design systems</span>
          </div>
        </section>
        <section className="profile-section">
          <h3>
            <Sparkles size={18} /> My next chapter
          </h3>
          <p>
            Looking for my next chapter in product design with a creative team.
          </p>
        </section>
      </div>
    </article>
  );
}
