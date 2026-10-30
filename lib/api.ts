"use client";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T = void>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const form = options.body instanceof FormData;
  const response = await fetch(`/api/backend${path}`, {
    method: options.method ?? "GET",
    headers: form ? undefined : { "Content-Type": "application/json" },
    body:
      options.body === undefined
        ? undefined
        : form
          ? (options.body as FormData)
          : JSON.stringify(options.body),
    signal: options.signal,
    cache: "no-store",
  });
  const data = response.status === 204 ? undefined : await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event("auth:expired"));
      if (options.method && options.method !== "GET")
        window.location.assign(
          `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        );
    }
    throw new ApiError(
      data?.error?.message ?? "The request failed. Please try again.",
      response.status,
    );
  }
  return data as T;
}
export function invalidate(...roots: string[]) {
  window.dispatchEvent(new CustomEvent("api:changed", { detail: roots }));
}
export const apiMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
export function queryPath(
  path: string,
  values: Record<string, string | number | undefined>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value !== undefined && value !== "") query.set(key, String(value));
  return `${path}${query.size ? `?${query}` : ""}`;
}
export function utcDate(value: string) {
  return new Date(
    /[zZ]$|[+-]\d{2}:\d{2}$/.test(value)
      ? value
      : `${value.replace(" ", "T")}Z`,
  );
}
export function displayTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(utcDate(value));
}
export function displayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(utcDate(value));
}
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
export function mediaUrl(path: string | null | undefined) {
  return path
    ? `/api/media/${encodeURIComponent(path.split("/").pop()!)}`
    : undefined;
}
