"use client";

import { useState } from "react";

export function useNetwork(notify: (message: string) => void) {
  const [following, setFollowing] = useState<string[]>([]);
  const [connected, setConnected] = useState<string[]>([]);
  const [requested, setRequested] = useState<string[]>([]);

  function toggleFollow(name: string) {
    setFollowing((current) =>
      current.includes(name)
        ? current.filter((person) => person !== name)
        : [...current, name],
    );
  }

  function toggleConnection(name: string) {
    setConnected((current) =>
      current.includes(name)
        ? current.filter((person) => person !== name)
        : [...current, name],
    );
  }

  function requestReferral(company: string) {
    if (requested.includes(company)) return;
    setRequested((current) => [...current, company]);
    notify("Referral requested. No résumé or private information was shared.");
  }

  return {
    following,
    connected,
    requested,
    toggleFollow,
    toggleConnection,
    requestReferral,
  };
}
