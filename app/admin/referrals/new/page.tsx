import { NewReferralPage } from "@/components/admin/create-pages";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Create referral" };
export default function Page() {
  return <NewReferralPage />;
}
