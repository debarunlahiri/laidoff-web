import type { Metadata } from "next";
import { pageMetadata, siteShare } from "@/lib/share-metadata";
import ComposerTrigger from "@/components/feed/composer-trigger";
import FeedView from "@/components/feed/feed-view";
import WelcomeBanner from "@/components/feed/welcome-banner";

export const metadata: Metadata = pageMetadata({
  title: siteShare.title,
  description:
    siteShare.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <WelcomeBanner />
      <ComposerTrigger />
      <FeedView />
    </>
  );
}
