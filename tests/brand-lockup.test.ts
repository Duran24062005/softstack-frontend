import { describe, expect, it } from "vitest";

import { getCampuslandsLogoSrc } from "@/components/ui/campuslands-logo";

describe("Campuslands logo assets", () => {
  it("uses the full-color logo on light surfaces", () => {
    expect(getCampuslandsLogoSrc("dark")).toBe("/campuslands_logos/Campuslands_with_background_white.png");
  });

  it("uses the white transparent logo on dark surfaces", () => {
    expect(getCampuslandsLogoSrc("light")).toBe("/campuslands_logos/campuslands_logo_without_backgorund.png");
  });
});
