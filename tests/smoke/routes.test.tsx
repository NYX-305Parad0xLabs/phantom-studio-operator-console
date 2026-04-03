import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import Home from "@/app/page";
import ReviewPage from "@/app/review/page";
import PublishPage from "@/app/publish/page";
import SettingsPage from "@/app/settings/page";
import ExportsPage from "@/app/exports/page";
import { Providers } from "@/app/providers";

describe("Smoke routes", () => {
  it("renders the home dashboard section", () => {
    render(
      <Providers>
        <Home />
      </Providers>,
    );

    expect(screen.getByText(/Active runs/)).toBeInTheDocument();
    expect(screen.getByText(/One killer short/)).toBeInTheDocument();
  });

  it("renders review and publish surfaces", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    expect(screen.getByText(/Clip Review/)).toBeInTheDocument();
    expect(screen.getAllByText(/Caption Review/).length).toBeGreaterThan(0);

    render(
      <Providers>
        <PublishPage />
      </Providers>,
    );

    expect(screen.getByText(/Schedule outbound jobs/)).toBeInTheDocument();
    expect(screen.getByText(/Queue operator-approved exports through the control plane/)).toBeInTheDocument();
  });

  it("renders settings and exports pages", () => {
    render(
      <Providers>
        <SettingsPage />
      </Providers>,
    );

    expect(screen.getByText(/Settings/)).toBeInTheDocument();

    render(
      <Providers>
        <ExportsPage />
      </Providers>,
    );

    expect(screen.getByText(/Export bundles/)).toBeInTheDocument();
  });
});
