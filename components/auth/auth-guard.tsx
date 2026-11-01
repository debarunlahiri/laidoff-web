"use client";
import { useAuth } from "@/providers/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, sessionError, refreshSession } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const publicPage =
    ["/", "/explore", "/referrals", "/network", "/insights"].includes(
      pathname,
    ) ||
    pathname.startsWith("/users/") ||
    pathname.startsWith("/search");
  useEffect(() => {
    if (!publicPage && !loading && !user && !sessionError)
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, sessionError, pathname, router, publicPage]);
  if (publicPage) return children;
  if (sessionError)
    return (
      <div className="auth-loading" role="alert">
        <p>{sessionError}</p>
        <button className="primary" onClick={() => void refreshSession()}>
          Try again
        </button>
      </div>
    );
  if (!user)
    return (
      <div className="auth-loading" role="status">
        <LoaderCircle className="auth-spinner" size={26} />
        <span>Loading your circle…</span>
      </div>
    );
  return children;
}
