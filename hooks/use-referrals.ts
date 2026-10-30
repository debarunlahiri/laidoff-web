"use client";

import { useState } from "react";
import { opportunities as initialOpportunities } from "@/data/referrals";
import type { ReferralOpportunity } from "@/types";

export function useReferrals(notify: (message: string) => void) {
  const [opportunities, setOpportunities] =
    useState<ReferralOpportunity[]>(initialOpportunities);
  const [referralComposer, setReferralComposer] = useState(false);

  function addReferral(fields: {
    company: string;
    title: string;
    location: string;
    skills: string;
    description: string;
  }) {
    if (
      ![fields.company, fields.title, fields.location, fields.skills].every(
        (value) => value.trim(),
      )
    )
      return false;
    setOpportunities((current) => [
      {
        id: crypto.randomUUID(),
        company: fields.company.trim(),
        title: fields.title.trim(),
        location: fields.location.trim(),
        skills: fields.skills.trim(),
        description: fields.description.trim(),
        letter: fields.company.trim().charAt(0).toUpperCase(),
        person: "Jamie Morgan",
        color: "purple",
        own: true,
      },
      ...current,
    ]);
    setReferralComposer(false);
    notify("Your referral opportunity has been added.");
    return true;
  }

  return { opportunities, referralComposer, setReferralComposer, addReferral };
}
