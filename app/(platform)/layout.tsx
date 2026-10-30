import AuthGuard from "@/components/auth/auth-guard";
import AppShell from "@/components/layout/app-shell";
import { PlatformProvider } from "@/providers/platform-provider";
import type { ReactNode } from "react";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <PlatformProvider>
        <AppShell>{children}</AppShell>
      </PlatformProvider>
    </AuthGuard>
  );
}
