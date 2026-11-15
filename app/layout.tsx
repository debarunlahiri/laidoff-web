import ThemeScript from "@/components/ui/theme-script";
import { AuthProvider } from "@/providers/auth-provider";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { siteImage, siteName, siteOrigin, siteShare } from "@/lib/share-metadata";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: siteShare.title,
  description: siteShare.description,
  applicationName: siteName,
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    title: siteShare.title,
    description: siteShare.description,
    images: [{ url: siteImage(), width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteShare.title,
    description: siteShare.description,
    images: [siteImage()],
  },
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
        <Analytics />
      </body>
    </html>
  );
}
