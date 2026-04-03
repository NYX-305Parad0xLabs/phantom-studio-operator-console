import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import Home from "@/app/page";
import IntakePage from "@/app/intake/page";
import ReviewPage from "@/app/review/page";
import ExportsPage from "@/app/exports/page";
import ProvenancePage from "@/app/provenance/page";
import PublishPage from "@/app/publish/page";
import SettingsPage from "@/app/settings/page";
import { Providers } from "@/app/providers";

const renderWithProviders = (node: ReactElement) =>
  render(<Providers>{node}</Providers>);

describe("Smoke routes", () => {
  it("renders the dashboard overview", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Active runs")).toBeInTheDocument();
    expect(screen.getByText("One killer short")).toBeInTheDocument();
  });

  it("renders the intake path with live badges", () => {
    renderWithProviders(<IntakePage />);
    expect(screen.getByText("Submit a source for Phantom Studio")).toBeInTheDocument();
    expect(screen.getByText("Recent jobs")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("renders the review surface with mock indicators", () => {
    renderWithProviders(<ReviewPage />);
    expect(screen.getByText("Clip Review")).toBeInTheDocument();
    expect(screen.getAllByText("Caption Review").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Mock captions")).toBeInTheDocument();
    expect(screen.getByText("Mock translations")).toBeInTheDocument();
    expect(screen.getByText("Mock voice")).toBeInTheDocument();
    expect(screen.getByText("Mock lip-sync")).toBeInTheDocument();
  });

  it("renders the export review panel", () => {
    renderWithProviders(<ExportsPage />);
    expect(screen.getByText("Render summary")).toBeInTheDocument();
    expect(screen.getByText("Mock render")).toBeInTheDocument();
    expect(screen.getByText("Mock export")).toBeInTheDocument();
    expect(screen.getByText("Publish readiness")).toBeInTheDocument();
  });

  it("renders the provenance experience", () => {
    renderWithProviders(<ProvenancePage />);
    expect(screen.getByText("Export manifest")).toBeInTheDocument();
    expect(screen.getByText("Provider traces")).toBeInTheDocument();
    expect(screen.getByText("Export bundle")).toBeInTheDocument();
  });

  it("renders the publish scheduling surface", () => {
    renderWithProviders(<PublishPage />);
    expect(screen.getByText("Publish scheduling")).toBeInTheDocument();
    expect(screen.getByText("Prepare outbound job")).toBeInTheDocument();
    expect(screen.getByText(/Mock writes only/i)).toBeInTheDocument();
  });

  it("renders settings with integration and health badges", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText("Integration mode: mock")).toBeInTheDocument();
    expect(screen.getByText("Health dashboard")).toBeInTheDocument();
  });
});
