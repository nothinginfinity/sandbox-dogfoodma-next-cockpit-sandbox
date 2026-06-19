# Three.js UI MCP Standard

This sandbox is the working standard for creating mobile Three.js UI without regressions.

## Rule 1: Visual baseline first

The approved cockpit is the baseline. The protected visual routes are:

- `/`
- `/studio`
- `/preview`

These routes must not change visually unless a new visual version is explicitly approved.

## Rule 2: API first, UI second

New features should land as API/MCP surfaces before they appear in the visual cockpit.

Preferred path:

1. Add contract/spec file.
2. Add read-only API route.
3. Add MCP tool.
4. Run smoke/promotion checks.
5. Manually test in browser.
6. Only then expose in the cockpit UI.

## Rule 3: Scene spec over hand edits

Three.js UI should be generated from scene specs and component contracts, not improvised inside the Worker shell.

Core concepts:

- node = data object
- cluster = data source or app module
- motion = navigation mode
- drawer = telemetry surface
- button = action primitive
- route panel = MCP surface
- receipt = build proof

## Required guardrail endpoints

- `/api/visual-contract`
- `/api/promotion-check`
- `/api/scene-spec`

## Promotion rule

No sandbox can become a new repo/version until manual browser checks and API checks pass.
