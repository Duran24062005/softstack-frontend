import Link from "next/link";

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
      className={`brand-lockup ${onDark ? "brand-lockup-light" : "brand-lockup-dark"} ${className}`}
    >
      <span className="brand-lockup-name">Campuslands</span>
      <span className="brand-lockup-product">SoftStack / Tech Leap</span>
      {compact ? null : (
        <span className="brand-lockup-tagline">Talento · Tecnología · Impacto</span>
      )}
    </Link>
  );
}
