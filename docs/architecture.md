# Operator Console Architecture

- **App shell**: A sidebar + top-bar layout built with Tailwind, shadcn-inspired components, and a job status indicator powered by a lightweight Zustand store.
- **Routing**: Next.js App Router exposes dedicated pages (`/intake`, `/runs`, `/review`, etc.) so operators can traverse the workflow lifecycle.
- **State & data**: TanStack Query (via `app/providers.tsx`) will orchestrate API calls; the `ControlPlaneClient` and `ProviderGatewayClient` modules define typed request scaffolding for both backends.
- **Styling**: Tailwind CSS (dark-first) with custom `paradox-*` tokens and component primitives (`Button`, `Badge`, `Card`) keep the UI consistent.
- **Env/config**: `lib/config.ts` centralizes control-plane/provider URLs plus token placeholders so deployments can switch endpoints without code changes.
