"use client";
import { useState } from "react";

export function useWorkforceInsights() {
  const [year, setYear] = useState("2026");

  return { year, setYear };
}
