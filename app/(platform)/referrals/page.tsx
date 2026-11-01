import ReferralsView from "@/components/referrals/referrals-view";
import { Suspense } from "react";

export default function ReferralsPage() {
  // The board reads ?id= for shared links, which needs a Suspense boundary.
  return (
    <Suspense>
      <ReferralsView />
    </Suspense>
  );
}
