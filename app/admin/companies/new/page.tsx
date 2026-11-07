import { CompanyForm } from "@/components/admin/company-pages";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "New company" };
export default function Page() {
  return <CompanyForm />;
}
