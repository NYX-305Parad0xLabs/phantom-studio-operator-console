import Link from "next/link";

import { Card } from "@/components/ui/card";

export default function FactoryLandingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold text-white">UGC Factory</h1>
      <p className="text-paradox-gray-300">
        Guided operator flow: intake to plan to run to review to export.
      </p>
      <Card className="space-y-4 p-6">
        <p className="text-sm text-paradox-gray-300">
          Start with intake to create a factory plan with safety assertions.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/factory/intake"
            className="inline-flex items-center rounded-xl bg-paradox-accent px-4 py-2 font-semibold text-black"
          >
            Open intake
          </Link>
          <Link
            href="/factory/run"
            className="inline-flex items-center rounded-xl border border-paradox-gray-700 px-4 py-2 text-sm text-paradox-gray-200"
          >
            Open run diagnostics
          </Link>
        </div>
      </Card>
    </div>
  );
}
