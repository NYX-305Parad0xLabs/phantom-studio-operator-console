import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import RunProvenancePage from "@/app/provenance/[runId]/page";
import { Providers } from "@/app/providers";

describe("RunProvenancePage", () => {
  it("renders provenance sections and audit trail", () => {
    render(
      <Providers>
        <RunProvenancePage params={{ runId: "run-123" }} />
      </Providers>,
    );

    expect(screen.getAllByText(/Provider traces/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Asset references/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Audit events/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Export bundle/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/bundle.json/).length).toBeGreaterThan(0);
  });
});
