import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/community-guidelines", label: "Community guidelines" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Site information">
        {links.map(({ href, label }) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
      <p>
        © 2026 LaidOffCircle <span>Made for the way forward.</span>
      </p>
    </footer>
  );
}
