import InfoPage from "@/components/layout/info-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy | LayoffCircle" };

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy"
      intro="Here’s what you share when you use LayoffCircle and who can see it."
    >
      <section>
        <h2>Account and profile</h2>
        <p>
          We use your name, email address, and sign-in information to create and
          secure your account. If you sign in with Google, we use your verified
          Google identity to sign you in. Profile details you add, such as your
          headline and photo, can appear on your public profile.
        </p>
      </section>
      <section>
        <h2>Public posts and comments</h2>
        <p>
          Treat posts, comments, and attached photos as public. Anonymous posts
          hide your profile identity from other readers, but details you include
          in the post can still identify you.
        </p>
      </section>
      <section>
        <h2>Messages and referral requests</h2>
        <p>
          Direct messages are shared with conversation participants. When you
          request a referral, the person offering it can see your answers and
          the documents you submit. Check what a form asks for before sending
          it.
        </p>
      </section>
      <section>
        <h2>Browser storage</h2>
        <p>
          LayoffCircle uses browser storage to keep you signed in and remember
          settings such as your theme.
        </p>
      </section>
    </InfoPage>
  );
}
