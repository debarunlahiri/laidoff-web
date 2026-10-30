"use client";
import { useState } from "react";
import type { ApiInsights } from "@/lib/api-types";
import { useApiResource } from "./use-api-resource";
export function useWorkforceInsights(section: string) {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const result = useApiResource<ApiInsights>(
    section === "Workforce insights" ? `/insights?year=${year}` : null,
    {
      year: Number(year),
      notice:
        "User reports may overlap. Figures are not independently verified.",
      monthly: [],
      companies: [],
    },
  );
  return {
    year,
    setYear,
    insights: result.data,
    insightsLoading: result.loading,
    insightsError: result.error,
  };
}
