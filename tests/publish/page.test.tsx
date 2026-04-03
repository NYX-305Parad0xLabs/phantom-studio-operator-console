import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import PublishPage from "@/app/publish/page";
import { Providers } from "@/app/providers";

describe("PublishPage", () => {
  it("renders scheduler and status cards with mock write indicator", () => {
    render(
      <Providers>
        <PublishPage />
      </Providers>,
    );

    expect(screen.getByText(/Publish scheduling/)).toBeInTheDocument();
    expect(screen.getByText(/Publish status/)).toBeInTheDocument();
    expect(screen.getByText(/Publish attempts/)).toBeInTheDocument();
    expect(screen.getAllByText(/Mock writes/i).length).toBeGreaterThan(0);
  });

  it("shows fallback message when live writes are disabled", () => {
    render(
      <Providers>
        <PublishPage />
      </Providers>,
    );

    const submitButton = screen.getByRole("button", {
      name: /Simulate scheduling/i,
    });
    fireEvent.click(submitButton);

    expect(
      screen.getByText(/Live writes are disabled; scheduling remains mocked/i),
    ).toBeInTheDocument();
  });
});
