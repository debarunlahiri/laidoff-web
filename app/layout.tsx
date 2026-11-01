import ThemeScript from "@/components/ui/theme-script";
import { AuthProvider } from "@/providers/auth-provider";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "LayoffCircle — Laid off, not disconnected.",
  description:
    "A place to find your people, share your story, and build your next chapter.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
