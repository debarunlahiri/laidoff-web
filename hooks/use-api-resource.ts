"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, apiMessage } from "@/lib/api";
// Ignore superseded requests without aborting fetch during React effect cleanup.
type PendingRequest = { cancelled: boolean };

function cancelRequest(request: PendingRequest | null) {
  if (request) request.cancelled = true;
}

export function useApiResource<T>(path: string | null, initial: T, pollMs = 0) {
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);
  const initialRef = useRef(initial);
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState("");
  const controller = useRef<PendingRequest | null>(null);
  const reload = useCallback(async () => {
    cancelRequest(controller.current);
    const active: PendingRequest = { cancelled: false };
    controller.current = active;
    if (!path) {
      setData(initialRef.current);
      setLoading(false);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await api<T>(path);
      if (!active.cancelled) {
        setData(result);
        setResolvedPath(path);
      }
    } catch (error) {
      if (!active.cancelled) setError(apiMessage(error));
    } finally {
      if (!active.cancelled) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    setData(initialRef.current);
    void reload();
    return () => cancelRequest(controller.current);
  }, [reload]);
  useEffect(() => {
    const change = (event: Event) => {
      const roots = (event as CustomEvent<string[]>).detail;
      if (
        path &&
        roots.some((root) => path.split("?")[0].startsWith(`/${root}`))
      )
        void reload();
    };
    window.addEventListener("api:changed", change);
    const interval =
      pollMs && path
        ? setInterval(() => {
            if (document.visibilityState === "visible") void reload();
          }, pollMs)
        : null;
    return () => {
      window.removeEventListener("api:changed", change);
      if (interval) clearInterval(interval);
    };
  }, [path, reload, pollMs]);
  return {
    data: resolvedPath === path ? data : initialRef.current,
    setData,
    loading,
    error,
    reload,
  };
}
function itemKey(item: unknown) {
  const row = item as { id?: string; userId?: string };
  return row.id ?? row.userId;
}
export function useApiList<T>(path: string | null, pollMs = 0) {
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const active = useRef<PendingRequest | null>(null);
  const rows = useRef<T[]>([]);
  const busy = useRef(false);
  const pageSize = 50;
  const load = useCallback(
    async (more = false, preserve = false) => {
      if (more && busy.current) return;
      if (!path) {
        setData([]);
        rows.current = [];
        setHasMore(false);
        setLoading(false);
        setError("");
        return;
      }
      cancelRequest(active.current);
      const controller: PendingRequest = { cancelled: false };
      active.current = controller;
      busy.current = true;
      setLoading(true);
      setError("");
      const offset = more ? rows.current.length : 0;
      try {
        const result = await api<T[]>(
          `${path}${path.includes("?") ? "&" : "?"}limit=${pageSize}&offset=${offset}`,
        );
        if (!controller.cancelled) {
          const identifiers = new Set(result.map((item) => itemKey(item)));
          rows.current = more
            ? [
                ...rows.current,
                ...result.filter(
                  (item) =>
                    !rows.current.some(
                      (existing) => itemKey(existing) === itemKey(item),
                    ),
                ),
              ]
            : preserve
              ? [
                  ...result,
                  ...rows.current.filter(
                    (item) => !identifiers.has(itemKey(item)),
                  ),
                ]
              : result;
          setData(rows.current);
          setResolvedPath(path);
          setHasMore(result.length === pageSize);
        }
      } catch (error) {
        if (!controller.cancelled) setError(apiMessage(error));
      } finally {
        if (!controller.cancelled) {
          setLoading(false);
          busy.current = false;
        }
      }
    },
    [path],
  );
  useEffect(() => {
    rows.current = [];
    setData([]);
    setHasMore(false);
    void load();
    return () => cancelRequest(active.current);
  }, [load]);
  useEffect(() => {
    const change = (event: Event) => {
      const roots = (event as CustomEvent<string[]>).detail;
      if (
        path &&
        roots.some((root) => path.split("?")[0].startsWith(`/${root}`))
      )
        void load(false, pollMs > 0);
    };
    window.addEventListener("api:changed", change);
    const timer =
      pollMs && path
        ? setInterval(() => {
            if (document.visibilityState === "visible") void load(false, true);
          }, pollMs)
        : null;
    return () => {
      window.removeEventListener("api:changed", change);
      if (timer) clearInterval(timer);
    };
  }, [path, load, pollMs]);
  return {
    data: resolvedPath === path ? data : [],
    loading,
    error,
    hasMore,
    loadMore: () => load(true),
    reload: () => load(false),
  };
}
export function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
