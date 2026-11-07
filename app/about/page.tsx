import InfoPage from "@/components/layout/info-page";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About LaidOffCircle" };

export default function AboutPage() {
  return (
    <InfoPage
      title="About LaidOffCircle"
      intro="LaidOffCircle is a community for people navigating layoffs, job searches, and career changes."
    >
      <section>
        <h2>Find people who understand</h2>
        <p>
          Share what you’re going through, ask for advice, or help someone else
          with what you’ve learned. You can browse public conversations before
          deciding to join in.
        </p>
      </section>
      <section>
        <h2>Give and get practical help</h2>
        <p>
          Browse or offer <Link href="/referrals">employee referrals</Link>,
          build your network, and follow{" "}
          <Link href="/insights">workforce updates</Link>.
        </p>
      </section>
    </InfoPage>
  );
}
