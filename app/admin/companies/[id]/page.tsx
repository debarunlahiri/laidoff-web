import { CompanyForm } from "@/components/admin/company-pages";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Edit company" };
export default function Page() {
  return <CompanyForm />;
}
