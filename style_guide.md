# STYLE_GUIDE.md: AI Coding Standards & Quality Directives

This document establishes mandatory programming standards, component constraints, and architectural conventions for all AI agents generating or refactoring code in the CuidaT codebase.

---

## 1. General TypeScript Standards

- Zero-any Policy: The `any` type is strictly prohibited. Use `unknown` alongside runtime type narrowing or Zod schema parsing.
- Explicit Return Types: Utility functions, service methods, and domain algorithms (especially in `shared/`) must explicitly state their return signature:
    - Correct: `export function calculateWindow(hours: number): TimeRange { ... }`
    - Incorrect: `export function calculateWindow(hours: number) { ... }`
- Type-Only Imports: Use explicit type imports to minimize runtime overhead and prevent circular bundling issues:
    - Correct: `import type { CalendarProfile, HealthEventLog, UserProfile } from '@cuidat/shared';`

---

## 2. Vue 3 & Composition API Directives

### Single-File Component (SFC) Ordering
Every `.vue` component must strictly observe the following block sequence:
1. `<script setup lang="ts">`
2. `<template>`
3. `<style scoped>` (reserved for edge cases; utility classes via Tailwind take precedence).

### Reactivity Conventions
- Uniform `ref()` Usage: Use `ref()` across both primitives and complex objects to maintain consistent `.value` ergonomics. Restrict `reactive()` to justified large-scale state structures.
- Props & Emits Declarations: Enforce compile-time type declarations:
    ```typescript
    const props = defineProps<{
      profileId: string;
      isOpen: boolean;
      activeLogId?: string | null;
    }>();

    const emit = defineEmits<{
      (e: 'close'): void;
      (e: 'save', payload: HealthEventLog): void;
      (e: 'delete', id: string): void;
    }>();
    ```
- Component File Budget: No `.vue` component may exceed 180 lines of code. Deconstruct complex interfaces into atomic child components (`CalendarGrid.vue`, `CalendarDayCell.vue`, `MonthlyInsightsSummary.vue`, `AppHeader.vue`, `DeleteAccountModal.vue`).

---

## 3. Pinia State Management

- Setup Stores Mandatory: Define Pinia stores using function syntax exclusively:
    ```typescript
    export const useEventStore = defineStore('events', () => {
      const logs = ref<HealthEventLog[]>([]);
      const activeFilter = ref<FilterType>('all');

      const filteredLogs = computed(() => {
        // Return filtered logs
      });

      function addLog(entry: HealthEventLog) {
        logs.value.push(entry);
      }

      function resetState() {
        logs.value = [];
        activeFilter.value = 'all';
      }

      return { logs, activeFilter, filteredLogs, addLog, resetState };
    });
    ```
- Reactivity Preservation: Never destructure stores directly in setup scripts or templates. Always wrap extracted state with `storeToRefs()`:
    ```typescript
    const eventStore = useEventStore();
    const { logs, activeFilter } = storeToRefs(eventStore);
    ```
- Pure Store Teardown: Stores holding tenant-isolated clinical data (`useEventStore`, `useProfileStore`, `useItemDefinitionStore`) must expose deterministic cleanup/reset methods invoked upon session logout or account erasure.

---

## 4. Naming Conventions

| Construct | Convention | Canonical Example |
| :--- | :--- | :--- |
| Component Files | PascalCase.vue | `CalendarDayCell.vue`, `SidebarDock.vue`, `DeleteAccountModal.vue` |
| Composables | camelCase.ts (use prefix) | `useCalendar.ts`, `useInteraction.ts`, `useAuth.ts` |
| Pinia Stores | camelCase.ts (use...Store pattern) | `useProfileStore.ts`, `useEventStore.ts`, `useAuthStore.ts` |
| Types & Interfaces | PascalCase (no I prefix) | `CalendarProfile`, `HealthEventLog`, `AuthResponse` |
| Functions & Variables | camelCase | `detectCorrelations()`, `activeDate`, `handleLogout()` |
| Global Constants | SCREAMING_SNAKE_CASE | `MAX_WINDOW_HOURS`, `GUEST_STORAGE_KEY`, `DELETION_CONFIRM_KEYWORD` |

---

## 5. Tailwind CSS & UI Assembly Rules

- Color Token Integrity: Arbitrary hex values are banned in component templates. Use only tokens extended in `tailwind.config.js`:
    - `text-slate`, `bg-slate`, `border-slate` (structural text, icons, buttons)
    - `bg-peach`, `text-slate` (symptoms, warnings, severity indicators)
    - `bg-sky` (informational cards and secondary panels)
    - `bg-mint`, `text-slate` (triggers, confirmations, correlation badges)
    - `bg-tint` (soft background surfaces, pill containers)
    - `bg-canvas` (clean canvas and cell backgrounds)
- Class Ordering Protocol:
    1. Box Model & Positioning (`grid`, `flex`, `relative`, `w-full`)
    2. Spacing & Sizing (`p-4`, `gap-3`, `min-h-[87px]`)
    3. Typography (`font-sans`, `text-sm`, `font-extrabold`, `text-slate`)
    4. Visual Surfaces (`bg-canvas`, `rounded-2xl`, `border`)
    5. Interactive Modifiers (`hover:`, `focus:`, `transition-all`)

### Session & Identity Component Specifications
- Header Connectivity & Session Badges (`AppHeader.vue`):
  - Guest Mode: Neutral badge using `bg-slate-100 text-slate-600 border border-slate-200` with text "Modo Local".
  - Authenticated Mode: Active status badge using `bg-mint/40 text-slate-800 border border-mint` with text "Sincronizado" and an optional cloud/check icon.
- Profile Dropdown Menu:
  - Must open relative to the user email pill with a subtle shadow (`shadow-lg`), rounded corners (`rounded-xl`), and background `bg-canvas border border-slate-100`.
  - Non-destructive actions (Portability / Logout) use standard hover: `hover:bg-tint text-slate-700`.
  - Destructive action ("Eliminar cuenta"): Explicit alert styling: `text-red-600 hover:bg-red-50`.
- Double-Verification Destructive Modals (`DeleteAccountModal.vue`):
  - The confirmation button MUST remain in a strictly disabled visual and functional state (`opacity-50 cursor-not-allowed bg-slate-300`) until the user types the exact case-sensitive string `"ELIMINAR"` in a sanitized input field.
  - Active destructive CTA: `bg-red-600 hover:bg-red-700 text-white font-bold transition-colors`.

---

## 6. Defensive Security & GDPR Governance

- Sanitization Protocol (Cross-Site Scripting - OWASP A03): Every string accepted from user-editable inputs must pass through `DOMPurify.sanitize()` prior to reactivity assignment or storage:
    ```typescript
    import DOMPurify from 'dompurify';
    const cleanNotes = DOMPurify.sanitize(rawNotes.trim());
    ```
- Broken Access Control Mitigation (OWASP A01): Every database query MUST scope tenancy via `WHERE user_id = current_user_id` inside repository abstractions. Direct Insecure Object Reference (IDOR) vulnerabilities will fail automated security review.
- Atomic Account Erasure (GDPR Art. 17 - Right to be Forgotten):
  - Invocations to `DELETE /api/auth/account` must execute within a strict PostgreSQL transaction deleting the user row and propagating cascading removals (`ON DELETE CASCADE`) to all child health tables.
  - Client state must immediately wipe authentication cookies/tokens and invoke store cleanup routines (`resetState()`) to eliminate in-memory residual health data.
- Client-Side Data Portability (GDPR Art. 20):
  - JSON serialization for data export must occur strictly client-side using `URL.createObjectURL(new Blob([...], { type: 'application/json' }))`.
  - The object URL must be revoked (`URL.revokeObjectURL(url)`) immediately after initiating the download to prevent client memory leaks.
- Domain Error Hierarchy: Standard `throw new Error(...)` is prohibited in application services and controllers. Enforce custom domain classes derived from `AppError` (`ValidationError`, `NotFoundError`, `UnauthorizedError`) with explicit HTTP status mapping and machine-readable error codes.

---

## 7. Version Control, Quality Gates & Git Guidelines

- Strict Conventional Commits standard required:
  - Features: `feat(auth): implement profile dropdown and logout flow`, `feat(gdpr): add account erasure with cascading delete`.
  - Fixes: `fix(api): resolve CORS preflight handling on error responses`.
  - Architecture/Docs: `docs(specs): update tech_spec and style_guide for phase 3.1`.
- Automated Quality Gate: The CI pipeline (GitHub Actions) serves as an automated quality gate enforcing zero typecheck errors (`tsc -b`), clean linting, and 100% passing Vitest and Playwright test suites before merging.