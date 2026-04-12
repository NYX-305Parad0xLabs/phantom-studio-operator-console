# Release readiness checklist

Before a release:

1. Ensure all major UI surfaces (intake, review, publish, settings, provenance) render without TypeScript errors or missing imports.
2. Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
3. Execute `npm run verify` to repeat the above commands sequentially on every platform.
4. Run `npm run dev:smoke` to confirm each major route file exists.
5. Update `docs/backend-contracts.md` / `docs/provenance-viewer.md` if APIs or contract surfaces changed.
6. Tag `chore/operator-console-release-candidate` and push to origin before merging into `main`.
