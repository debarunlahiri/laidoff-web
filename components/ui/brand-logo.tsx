import Link from "next/link";

// The single LayoffCircle logo, used in the sidebar and on the sign-in pages.
export default function BrandLogo({ href = "/" }: { href?: string }) {
  return (
    <Link
      className="brand"
      href={href}
      aria-label="LayoffCircle home"
      title="LayoffCircle"
    >
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      Layoff<span>Circle</span>
      <span className="brand-dot" />
    </Link>
  );
}
