# Phase 2 Execution (Weeks 3-6)

## Objective
Improve user-perceived performance and close conversion leaks in the business funnel.

## Scope
1. Performance and payload control
   - Add build-time bundle budget checks and fail CI/local build when thresholds are exceeded.
   - Introduce chunking guidance and measurement output for regression tracking.
2. Conversion plumbing
   - Replace fake timeout submit behavior in call/demo flows with real persistence.
   - Store submissions with retry-safe writes and clear success/failure UX.
3. Operational visibility
   - Add lightweight instrumentation for key funnel events (form submit started/succeeded/failed).

## Workstreams
1. `P2-WS1` Performance guardrails
   - Owner: delegated agent
   - Files (expected): `vite.config.ts`, optional build script/docs updates
   - Acceptance:
     - Build surfaces actionable over-budget failures.
     - Baseline thresholds documented.
2. `P2-WS2` Demo intake backend plumbing
   - Owner: delegated agent
   - Files (expected): `src/pages/BookDemoPage.tsx`, Supabase table/schema docs, shared submit helper
   - Acceptance:
     - No fake timeout submit path.
     - Submission result persisted and errors surfaced.
3. `P2-WS3` Call intake backend plumbing
   - Owner: delegated agent
   - Files (expected): `src/pages/BookCallPage.tsx`, shared submit helper
   - Acceptance:
     - No fake timeout submit path.
     - Submission result persisted and errors surfaced.

## Status
1. Phase 2 workstreams defined.
2. Delegation in progress through `.clawdbot` orchestrator.
