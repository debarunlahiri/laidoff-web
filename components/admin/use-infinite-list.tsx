"use client";
import { api, apiMessage, queryPath } from "@/lib/api";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Params = Record<string, string | number | undefined>;
type Page<T> = { total: number; items: T[] };

/**
 * Shared infinite-scroll data source for admin lists. Fetches `limit` rows at a
 * time from `path` (which must answer `{ total, items }`) and appends the next
 * page when `<InfiniteFooter feed={feed} />` scrolls into view. Changing `path`
 * or `params` restarts from the first page; `reload()` does the same on demand.
 */
export function useInfiniteList<T>(
  path: string,
  params: Params = {},
  limit = 20,
) {
  const [data, setData] = useState<Page<T>>({ total: 0, items: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tick, setTick] = useState(0);
  const request = useRef(0);
  const busy = useRef(false);
  const key = JSON.stringify([path, params, limit]);
  const latest = useRef({ path, params, limit });
  latest.current = { path, params, limit };

  useEffect(() => {
    const id = ++request.current;
    busy.current = true;
    setLoading(true);
    const { path: p, params: q, limit: l } = latest.current;
    api<Page<T>>(queryPath(p, { ...q, limit: l, offset: 0 }))
      .then(
        (r) => {
          if (id !== request.current) return;
          setData(r);
          setError("");
        },
        (e) => id === request.current && setError(apiMessage(e)),
      )
      .finally(() => {
        if (id !== request.current) return;
        busy.current = false;
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick]);

  const hasMore = data.items.length < data.total;
  const loaded = useRef(0);
  loaded.current = data.items.length;

  const loadMore = useCallback(() => {
    if (busy.current || loaded.current >= data.total) return;
    const id = request.current;
    busy.current = true;
    setLoadingMore(true);
    const { path: p, params: q, limit: l } = latest.current;
    api<Page<T>>(queryPath(p, { ...q, limit: l, offset: loaded.current }))
      .then(
        (r) => {
          if (id !== request.current) return;
          setData((d) => {
            const seen = new Set(
              d.items.map((i) => (i as { id?: string }).id).filter(Boolean),
            );
            return {
              total: r.total,
              items: [
                ...d.items,
                ...r.items.filter((i) => {
                  const rowId = (i as { id?: string }).id;
                  return !rowId || !seen.has(rowId);
                }),
              ],
            };
          });
          setError("");
        },
        (e) => id === request.current && setError(apiMessage(e)),
      )
      .finally(() => {
        if (id !== request.current) return;
        busy.current = false;
        setLoadingMore(false);
      });
  }, [data.total]);

  return {
    data,
    setData: setData as Dispatch<SetStateAction<Page<T>>>,
    error,
    setError,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    reload: useCallback(() => setTick((t) => t + 1), []),
  };
}

export type InfiniteFeed<T> = ReturnType<typeof useInfiniteList<T>>;

/** Sentinel + status line. Place it directly under the list it feeds. */
export function InfiniteFooter<T>({ feed }: { feed: InfiniteFeed<T> }) {
  const ref = useRef<HTMLDivElement>(null);
  const { hasMore, loading, loadingMore, loadMore, data, error } = feed;
  const count = data.items.length;

  // Re-created after every page so a sentinel that is still on screen
  // (short page, tall window) immediately asks for the next one.
  useEffect(() => {
    const node = ref.current;
    if (!node || !hasMore || loading || error) return;
    const observer = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && loadMore(),
      { rootMargin: "320px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore, count, error]);

  return (
    <div ref={ref} className="ac-infinite" aria-live="polite">
      {loadingMore ? (
        <span className="ac-infinite-spin">Loading more…</span>
      ) : hasMore && !loading ? (
        <button onClick={loadMore}>Load more</button>
      ) : count > 0 ? (
        <span>
          {count === data.total
            ? `Showing all ${data.total.toLocaleString()}`
            : `${count.toLocaleString()} of ${data.total.toLocaleString()}`}
        </span>
      ) : null}
    </div>
  );
}
