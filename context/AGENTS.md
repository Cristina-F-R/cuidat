# CuidaT Agent Rules

## TypeScript
- Never use `any`. Prefer explicit domain types; accept `unknown` only at untrusted boundaries and narrow it before use.
- Use type-only imports for types.
- Give exported utilities and domain functions explicit return types.

## Vue Components
- Use Vue 3 Composition API with `<script setup lang="ts">`.
- Keep every `.vue` component at or below 180 lines. Split larger views into focused components.
- Declare typed props and emits. Prefer `ref()` for component state.
- Keep the component block order: script, template, then optional scoped style.

## Layout and Styling
- Use native CSS Grid for page, workspace, and calendar layouts; the calendar uses seven equal columns.
- Preserve the design tokens in `client/tailwind.config.js`: slate, peach, sky, mint, tint, and canvas.
- Prefer Tailwind utilities and shared CSS tokens; do not add arbitrary hex colors in templates.

## Calendar Input
- At viewport widths of 768px and above, support HTML5 drag-and-drop from a dock item to a calendar day.
- Below 768px, use tap-to-select: tapping a dock item selects it, then tapping a day opens the event form for that date. Do not require dragging on touch screens.
- Keep both input paths routed through the same event-creation handler and avoid blocking normal mobile scrolling.
- Collapse the three-column workspace to one column below 900px.