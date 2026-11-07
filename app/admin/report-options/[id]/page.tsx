import { ReportOptionForm } from "@/components/admin/report-options";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Edit report option" };
export default function Page() {
  return <ReportOptionForm />;
}
