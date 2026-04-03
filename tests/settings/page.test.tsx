import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import SettingsPage from "@/app/settings/page";
import { Providers } from "@/app/providers";

describe("SettingsPage", () => {
  it("renders connection panels and feature flag details", () => {
    render(
      <Providers>
        <SettingsPage />
      </Providers>,
    );

    expect(screen.getAllByText(/Control plane/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Provider gateway/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Auth tokens/)).toBeInTheDocument();
    expect(screen.getByText(/Feature flags/)).toBeInTheDocument();
  });

  it("shows degraded state messaging when not ready", () => {
    render(
      <Providers>
        <SettingsPage />
      </Providers>,
    );

    expect(screen.getByText(/Degraded/)).toBeInTheDocument();
    expect(screen.getAllByText(/Voice service warming up/).length).toBeGreaterThan(0);
  });
});
