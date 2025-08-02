# IMPROVEMENTS.md  
PulseCRM Rebuild – What’s Better than the Replit Prototype
---

## 1. Architecture & Codebase
| Area | Replit Prototype | Rebuild |
|------|------------------|---------|
| Project layout | Single `server/` + `client/` folders | **Monorepo** (`apps/`, `packages/`) with Turbo & pnpm workspaces |
| Rendering | Create-React-App + Express | **Next.js 14** (App Router, RSC, edge API-routes) |
| Type safety | Partial TypeScript | **Strict TypeScript** end-to-end (DB → API → UI) |
| API style | REST hand-rolled routes | **tRPC v10** auto-typed procedures, React hooks |

## 2. Data & Realtime
|                           | Replit | Rebuild |
|---------------------------|--------|---------|
| ORM                       | Custom SQL strings | **Drizzle ORM** – migrations, seeding, Zod generation |
| Database                  | SQLite / local PG | **PostgreSQL 15** (Neon/Fly/Railway) |
| Realtime updates          | Basic WS broadcast | **Redis pub/sub** + WebSocket + tRPC subscriptions |
| Collaborative editing     | N/A | **Yjs + TipTap** CRDT shared notes |

## 3. Design System & UX
* Tailwind 3 + **Radix primitives via shadcn/ui** → accessible, themeable components.  
* Dark / light theme toggle with `next-themes`.  
* Responsive dashboard layout, mobile PWA installable.  
* Drag-and-drop widgets & schedule board (dnd-kit).  

## 4. Performance & Quality
| Metric | Prototype | Rebuild Target |
|--------|-----------|----------------|
| First Load JS | ~900 kB | **< 300 kB** (RSC & code-split) |
| Lighthouse Perf | 60-70 | **> 90** |
| Tests          | none  | **Vitest + RTL + Playwright** |
| Linting        | basic | **ESLint, Prettier, Husky, commitlint** |

## 5. Dev Experience
* **Turborepo** incremental caching → 3-5× faster builds.  
* One-command setup: `pnpm dev` spins DB migrations then launches dev server.  
* Shared ESLint/Tailwind/TSConfig presets in `@pulsecrm/config`.  
* Storybook for UI contracts; Drizzle Studio for DB browsing.

## 6. Security & Compliance
* Helmet-equivalent headers via `next-secure-headers`.  
* RBAC scaffold with Lucia Auth and Postgres adapter.  
* Parameterised queries, Zod validation at API boundary.  
* Dependabot + Snyk workflow for CVE scanning.

## 7. Deployment & Ops
|                       | Prototype (Replit) | Rebuild |
|-----------------------|--------------------|---------|
| Hosting               | Replit container   | **Docker image** → Railway / Fly / Render |
| CI/CD                 | Manual rebuild     | **GitHub Actions**: lint → test → build → deploy |
| Observability         | Console logs       | **Sentry + OpenTelemetry traces** |
| Scalability           | Single instance    | Horizontal WS + Redis broadcast; stateless API |

## 8. Feature Additions
* Schedule assignments, team management, document versioning.
* AI utilities switched to pluggable providers (OpenAI, Perplexity).
* Offline queue & background sync for tasks/jobs on mobile.

---

### TL;DR
The rebuild transitions PulseCRM from a proof-of-concept into a production-grade platform with a modern stack, better performance, stronger security, real collaboration features and a vastly improved developer workflow. 🚀
