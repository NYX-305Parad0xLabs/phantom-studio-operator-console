import { describe, expect, it } from "vitest";

import { navItems } from "@/lib/navigation";

describe("navigation structure", () => {
  it("exposes the expected sections", () => {
    const labels = navItems.map((item) => item.label);
    expect(labels).toContain("Review");
    expect(labels).toContain("Exports");
    expect(labels).toContain("Settings");
  });
});
