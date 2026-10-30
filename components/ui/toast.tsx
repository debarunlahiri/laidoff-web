"use client";
import { usePlatform } from "@/providers/platform-provider";
import { Check } from "lucide-react";

export default function Toast() {
  const { toast } = usePlatform();

  if (!toast) return null;

  return (
    <div role="status" className="toast">
      <Check size={17} />
      {toast}
    </div>
  );
}
