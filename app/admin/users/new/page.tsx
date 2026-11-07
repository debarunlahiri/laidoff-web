import { NewUserPage } from "@/components/admin/create-pages";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Create user" };
export default function Page() {
  return <NewUserPage />;
}
