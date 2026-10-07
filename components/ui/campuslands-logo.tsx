import Image from "next/image";

export type CampuslandsLogoTone = "light" | "dark";

const CAMPUSLANDS_LOGO_SOURCES: Record<CampuslandsLogoTone, string> = {
  dark: "/campuslands_logos/Campuslands_with_background_white.png",
  light: "/campuslands_logos/campuslands_logo_without_backgorund.png",
};

export function getCampuslandsLogoSrc(tone: CampuslandsLogoTone) {
  return CAMPUSLANDS_LOGO_SOURCES[tone];
}

type CampuslandsLogoProps = {
  tone?: CampuslandsLogoTone;
  compact?: boolean;
  className?: string;
};

export function CampuslandsLogo({ tone = "dark", compact = false, className = "" }: CampuslandsLogoProps) {
  return (
    <Image
      src={getCampuslandsLogoSrc(tone)}
      alt=""
      aria-hidden="true"
      width={compact ? 96 : 180}
      height={compact ? 96 : 180}
      className={`campuslands-logo ${compact ? "campuslands-logo-compact" : ""} ${className}`}
    />
  );
}
