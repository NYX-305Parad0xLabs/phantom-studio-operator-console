import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import ReviewPage from "@/app/review/page";
import { Providers } from "@/app/providers";

describe("ReviewPage", () => {
  it("renders clip list and preview headings", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    expect(screen.getByText("Clip Review")).toBeInTheDocument();
    expect(screen.getByText("Candidates")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("allows toggling compare mode and selecting candidate", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    const compareButton = screen.getByRole("button", { name: "Compare" });
    fireEvent.click(compareButton);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
  });

  it("shows transcript excerpt", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    expect(screen.getByText(/Strong hook/i)).toBeInTheDocument();
  });
});
