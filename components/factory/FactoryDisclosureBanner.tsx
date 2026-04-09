export function FactoryDisclosureBanner() {
  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <p className="font-semibold">Safety gate: disclosed synthetic content only.</p>
      <p>
        Rights assertion and disclosure are mandatory. Publish stays blocked until
        operator review approval.
      </p>
    </div>
  );
}
