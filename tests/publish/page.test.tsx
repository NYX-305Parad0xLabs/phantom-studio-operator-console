import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import PublishPage from "@/app/publish/page";
import { Providers } from "@/app/providers";

describe("PublishPage", () => {
  it("renders scheduler and status cards", () => {
    render(
      <Providers>
        <PublishPage />
      </Providers>,
    );

    expect(screen.getByText(/Publish scheduling/)).toBeInTheDocument();
    expect(screen.getByText(/Publish status/)).toBeInTheDocument();
    expect(screen.getByText(/Publish attempts/)).toBeInTheDocument();
  });

  it("validates schedule input before submit", () => {
    render(
      <Providers>
        <PublishPage />
      </Providers>,
    );

    const submitButton = screen.getByRole("button", { name: /Schedule publish/i });
    fireEvent.click(submitButton);

    expect(screen.getByRole("button", { name: /Schedule publish/i })).toBeInTheDocument();
    expect(screen.getByText(/Publishing requires an approved review decision/i)).toBeInTheDocument();
  });
});
