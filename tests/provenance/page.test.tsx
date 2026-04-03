import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import RunProvenancePage from "@/app/provenance/[runId]/page";
import { Providers } from "@/app/providers";

describe("RunProvenancePage", () => {
  it("renders manifest, provider traces, and review trail", () => {
    render(
      <Providers>
        <RunProvenancePage params={{ runId: "run-123" }} />
      </Providers>,
    );

    expect(screen.getByText("Export manifest")).toBeInTheDocument();
    expect(screen.getAllByText(/Provider traces/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Audit events/)).toBeInTheDocument();
    expect(screen.getAllByText(/Review trail/).length).toBeGreaterThan(0);
  });
});
