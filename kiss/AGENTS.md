<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Critical Project Conventions & Rules

### Next.js Proxy Convention (DO NOT USE `middleware.ts`)
- **Use `./proxy.ts` ONLY**: Next.js in this project has migrated from `middleware.ts` to `proxy.ts`.
- **NEVER create `middleware.ts`**: Having both `middleware.ts` and `proxy.ts` causes the error:
  `Error: Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected. Please use "./proxy.ts" only.`
- **Direct exports in `proxy.ts`**:
  - `proxy.ts` must export a function (either as default export or named `proxy` export), e.g. `export default clerkMiddleware(async (auth, req) => { ... })`.
  - The `config` matcher must be defined and exported directly inside `proxy.ts` (not re-exported from another file), e.g. `export const config = { matcher: [...] }`.
