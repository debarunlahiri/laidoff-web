import NotesPage from "@/components/admin/notes-page";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Community notes" };
export default function Page() {
  return <NotesPage />;
}
