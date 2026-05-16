# ai-mind-clone-fe-monorepo

Frontend monorepo for two uni-app mini programs and shared frontend packages.

## Stack

- pnpm workspace for package management
- Turborepo for task orchestration and cache
- uni-app + Vue 3 + Vite for mini programs
- TypeScript, ESLint, and Prettier for baseline quality

Changesets is intentionally not included for now. The packages in this repo are internal workspace packages, not independently published npm packages.

## Structure

```text
apps/
  miniapp-main/        # primary uni-app mini program
  miniapp-companion/   # second uni-app mini program
packages/
  request/             # uni.request wrapper and API client utilities
  utils/               # framework-agnostic helper functions
  ui/                  # shared uni-app/Vue components
  tsconfig/            # shared TypeScript configs
  eslint-config/       # shared ESLint flat configs
```

## Commands

Install dependencies:

```bash
corepack enable
pnpm install
```

Run mini programs:

```bash
pnpm dev:main
pnpm dev:companion
```

Build and check:

```bash
pnpm build:mp-weixin
pnpm lint
pnpm typecheck
```

## Notes

- Configure real WeChat Mini Program app IDs in each app's `src/manifest.json`.
- Add app-specific pages under `apps/*/src/pages`.
- Put shared API clients in `packages/request`, pure helpers in `packages/utils`, and reusable components in `packages/ui`.
