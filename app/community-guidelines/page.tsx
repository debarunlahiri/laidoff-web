import InfoPage from "@/components/layout/info-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community guidelines | LaidOffCircle",
};

export default function CommunityGuidelinesPage() {
  return (
    <InfoPage
      title="Community guidelines"
      intro="Help make LaidOffCircle a place where people can ask for help and share difficult experiences."
    >
      <section>
        <h2>Treat people with respect</h2>
        <p>
          Disagree with ideas without attacking people. Harassment, threats,
          hate speech, and discrimination have no place here.
        </p>
      </section>
      <section>
        <h2>Protect personal information</h2>
        <p>
          Get permission before posting someone’s contact details, private
          messages, résumé, or other identifying information. Keep personal
          documents out of public posts.
        </p>
      </section>
      <section>
        <h2>Keep referrals free and honest</h2>
        <p>
          Never charge for a referral or promise a job in exchange for money.
          Represent roles and affiliations accurately, and ask only for details
          that are relevant to the referral.
        </p>
      </section>
      <section>
        <h2>Share workforce news responsibly</h2>
        <p>
          Link to the original source when you share a layoff announcement.
          Separate confirmed facts from estimates and personal opinions.
        </p>
      </section>
      <section>
        <h2>Report concerns</h2>
        <p>
          Use <strong>Report post</strong> in a post’s three-dot menu to flag
          harassment, scams, or other content that needs review.
        </p>
      </section>
    </InfoPage>
  );
}
