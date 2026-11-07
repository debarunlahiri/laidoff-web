import { HashtagForm } from "@/components/admin/hashtag-form";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Edit hashtag" };
export default function Page() {
  return <HashtagForm />;
}
