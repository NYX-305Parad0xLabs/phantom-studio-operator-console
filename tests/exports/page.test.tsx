import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import ExportsPage from "@/app/exports/page";
import { Providers } from "@/app/providers";

describe("ExportsPage", () => {
  it("renders render summary and preset cards", () => {
    render(
      <Providers>
        <ExportsPage />
      </Providers>,
    );

    expect(screen.getByText("Render summary")).toBeInTheDocument();
    expect(screen.getByText(/Render layers/)).toBeInTheDocument();
    expect(screen.getByText("Export preset")).toBeInTheDocument();
  });

  it("shows readiness badges and captions info", () => {
    render(
      <Providers>
        <ExportsPage />
      </Providers>,
    );

    expect(screen.getAllByText(/Ready for human approval/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Blocked pending review/).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Blocked pending export issue/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Phase One Viral Short/)).toBeInTheDocument();
    expect(
      screen.getByText(/Original synthetic character disclosed/i),
    ).toBeInTheDocument();
  });
});
