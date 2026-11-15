"use client";
import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const key = "laidoffcircle:theme";

const isTheme = (v: unknown): v is Theme => v === "light" || v === "dark";

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(key);
    return isTheme(v) ? v : null;
  } catch {
    return null;
  }
}

function system(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (root.dataset.theme !== theme) root.dataset.theme = theme;
}

// The DOM attribute is the single source of truth. React can drop attributes it
// does not own from <html> (hydration recovery re-renders the document), which
// used to silently flip the app back to light. Whenever that happens we restore
// the saved choice instead of falling back to a default.
function subscribe(notify: () => void) {
  const root = document.documentElement;
  const observer = new MutationObserver(() => {
    if (!isTheme(root.dataset.theme)) apply(stored() ?? system());
    notify();
  });
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  // Keep other tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === key && isTheme(e.newValue)) apply(e.newValue);
  };
  window.addEventListener("storage", onStorage);
  // Heal a missing attribute right away (e.g. lost before we subscribed).
  if (!isTheme(root.dataset.theme)) apply(stored() ?? system());
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = (): Theme => {
  const t = document.documentElement.dataset.theme;
  return isTheme(t) ? t : (stored() ?? system());
};

export function useTheme() {
  // Server and first client render use "light"; subscribers then resync.
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    getSnapshot,
    () => "light",
  );
  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-switching");
    apply(next);
    window.setTimeout(() => root.classList.remove("theme-switching"), 350);
    try {
      localStorage.setItem(key, next);
    } catch {}
  }, []);
  return { theme, toggle };
}
