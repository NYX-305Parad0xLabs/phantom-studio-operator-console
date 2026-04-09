import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import IntakePage from "@/app/factory/intake/page";
import { Providers } from "@/app/providers";
import { ControlPlaneClient } from "@/lib/api/controlPlane";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("Factory intake page", () => {
  it("renders safety fields and creates plan", async () => {
    vi.spyOn(ControlPlaneClient, "createFactoryPlanRecord").mockResolvedValue({
      state: "mocked",
      data: {
        id: 101,
        workflow_run_id: 1,
        product_input: { product_name: "Test", product_brief: "Brief" },
        influencer_lock_id: "luna-v2",
        target_platform: "tiktok",
        scene_breakdown: [],
        provider_handoff_payload: {},
        disclosure_text: "This is AI-generated synthetic content.",
        rights_asserted: true,
        review_required: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    render(
      <Providers>
        <IntakePage />
      </Providers>,
    );

    expect(screen.getByText(/rights are asserted/i)).toBeInTheDocument();
    expect(screen.getByText(/disclosed as synthetic/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Create plan/i }));

    expect(await screen.findByText(/Factory Intake/i)).toBeInTheDocument();
    expect(pushMock).toHaveBeenCalledWith("/factory/plan?planId=101&state=mocked");
  });
});
