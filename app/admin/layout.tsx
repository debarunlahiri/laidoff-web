import AdminShell from "@/components/admin/shell";
import { ConfirmProvider } from "@/providers/confirm-provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin — LaidOffCircle", template: "%s · Admin" },
};
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConfirmProvider>
      <AdminShell>{children}</AdminShell>
    </ConfirmProvider>
  );
}
