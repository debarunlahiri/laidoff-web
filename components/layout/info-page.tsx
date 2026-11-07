import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import SiteFooter from "./site-footer";

export default function InfoPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="info-page">
      <Link href="/" className="info-page-back">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to LaidOffCircle
      </Link>
      <article className="card info-page-content">
        <header>
          <h1>{title}</h1>
          <p>{intro}</p>
        </header>
        {children}
      </article>
      <SiteFooter />
    </main>
  );
}
