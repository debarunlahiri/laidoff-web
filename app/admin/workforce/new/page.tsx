import { NewWorkforcePage } from "@/components/admin/create-pages";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Add layoff report" };
export default function Page() {
  return <NewWorkforcePage />;
}
