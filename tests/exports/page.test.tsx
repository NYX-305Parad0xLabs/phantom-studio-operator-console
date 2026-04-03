import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import ExportsPage from "@/app/exports/page";
import { Providers } from "@/app/providers";

describe("ExportsPage", () => {
  it("renders render summary with layers and preset information", () => {
    render(
      <Providers>
        <ExportsPage />
      </Providers>,
    );

    expect(screen.getByText("Render summary")).toBeInTheDocument();
    expect(screen.getByText(/Render layers/)).toBeInTheDocument();
    expect(screen.getByText("Export preset")).toBeInTheDocument();
    expect(screen.getByText("Caption JSON")).toBeInTheDocument();
  });

  it("shows publish readiness and manifest statuses", () => {
    render(
      <Providers>
        <ExportsPage />
      </Providers>,
    );

    expect(screen.getByText("Publish readiness")).toBeInTheDocument();
    expect(screen.getByText(/Ready for human approval/i)).toBeInTheDocument();
    expect(screen.getByText(/Manifest recorded/i)).toBeInTheDocument();
  });
});
