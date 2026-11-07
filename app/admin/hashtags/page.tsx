import HashtagsPage from "@/components/admin/hashtags-page";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Hashtags" };
export default function Page() {
  return <HashtagsPage />;
}
