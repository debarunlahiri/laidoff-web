"use client";

import { sectionPaths } from "@/config/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function usePlatformNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const section = pathname.startsWith("/referrals/")
    ? "Referrals"
    : pathname.startsWith("/users/")
      ? "Member profile"
      : pathname.startsWith("/search")
        ? "Search"
        : Object.keys(sectionPaths).find(
            (label) => sectionPaths[label] === pathname,
          ) || "Home";

  function setSection(label: string) {
    const path = sectionPaths[label];
    if (path) router.push(path);
  }

  function navigate(label: string) {
    setSection(label);
    setSearch("");
    setMobileNav(false);
  }

  return {
    section,
    setSection,
    search,
    setSearch,
    mobileNav,
    setMobileNav,
    navigate,
  };
}
