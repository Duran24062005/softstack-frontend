import Link from "next/link";

import { CampuslandsLogo } from "@/components/ui/campuslands-logo";

type BrandLockupProps = {
  tone?: "light" | "dark";
  compact?: boolean;
  href?: string;
  className?: string;
};

export function BrandLockup({
  tone = "dark",
  compact = false,
  href = "/",
  className = "",
}: BrandLockupProps) {
  const onDark = tone === "light";

  return (
    <Link
      href={href}
      aria-label="Campuslands SoftStack, ir al inicio"
      className={`brand-lockup ${compact ? "brand-lockup-compact" : ""} ${onDark ? "brand-lockup-light" : "brand-lockup-dark"} ${className}`}
    >
      <CampuslandsLogo tone={onDark ? "light" : "dark"} compact={compact} />
      <span className="brand-lockup-copy">
        <span className="brand-lockup-product">SoftStack / Tech Leap</span>
        {compact ? null : <span className="brand-lockup-tagline">Talento · Tecnología · Impacto</span>}
      </span>
    </Link>
  );
}
