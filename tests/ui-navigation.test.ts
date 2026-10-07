import { describe, expect, it } from "vitest";

import { getNavigationItems, isNavigationItemActive } from "@/components/navigation/navigation-items";

describe("application navigation", () => {
  it("keeps administration routes restricted to admins", () => {
    expect(getNavigationItems("user").map((item) => item.href)).toEqual(["/dashboard", "/dashboard/profile"]);
    expect(getNavigationItems("admin").map((item) => item.href)).toContain("/admin/modules");
    expect(getNavigationItems("trainer").map((item) => item.href)).toContain("/admin/analytics");
  });

  it("maps nested learning and lesson-editor routes to their parent navigation item", () => {
    expect(isNavigationItemActive("/dashboard/modules/module-1", "/dashboard")).toBe(true);
    expect(isNavigationItemActive("/dashboard/lessons/lesson-1", "/dashboard")).toBe(true);
    expect(isNavigationItemActive("/admin/lessons/lesson-1", "/admin/lessons/new")).toBe(true);
    expect(isNavigationItemActive("/admin/modules", "/admin/lessons/new")).toBe(false);
    expect(isNavigationItemActive("/admin/modules/1", "/admin/modules")).toBe(true);
    expect(isNavigationItemActive("/admin/lessons/new", "/admin/modules")).toBe(false);
    expect(isNavigationItemActive("/dashboard/profile", "/dashboard")).toBe(false);
  });
});
