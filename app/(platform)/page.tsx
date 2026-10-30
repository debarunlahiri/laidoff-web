import ComposerTrigger from "@/components/feed/composer-trigger";
import FeedView from "@/components/feed/feed-view";
import WelcomeBanner from "@/components/feed/welcome-banner";

export default function HomePage() {
  return (
    <>
      <WelcomeBanner />
      <ComposerTrigger />
      <FeedView />
    </>
  );
}
