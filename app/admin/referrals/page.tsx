import ReferralsPage from "@/components/admin/referrals-page";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Referrals" };
export default function Page() {
  return <ReferralsPage />;
}
