import { CompaniesPage } from "@/components/admin/company-pages";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Companies" };
export default function Page() {
  return <CompaniesPage />;
}
