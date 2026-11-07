import { NewPostPage } from "@/components/admin/create-pages";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Create post" };
export default function Page() {
  return <NewPostPage />;
}
