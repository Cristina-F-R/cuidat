\# STYLE\_GUIDE.md: AI Coding Standards & Quality Directives

&nbsp;

This document establishes mandatory programming standards, component constraints, and architectural conventions for all AI agents generating or refactoring code in the CuidaT codebase.

&nbsp;

\---

&nbsp;

\#\# 1\. General TypeScript Standards

\- Zero-any Policy: The any type is strictly prohibited. Use unknown alongside runtime type narrowing or Zod schema parsing.

\- Explicit Return Types: Utility functions, service methods, and domain algorithms (especially in shared/) must explicitly state their return signature:

  \- Correct: export function calculateWindow(hours: number): TimeRange { ... }

  \- Incorrect: export function calculateWindow(hours: number) { ... }

\- Type-Only Imports: Use explicit type imports to minimize runtime overhead and prevent circular bundling issues:

  \- Correct: import type { CalendarProfile, HealthEventLog } from '@cuidat/shared';

&nbsp;

\---

&nbsp;

\#\# 2\. Vue 3 & Composition API Directives

&nbsp;

\#\#\# Single-File Component (SFC) Ordering

Every .vue component must strictly observe the following block sequence:

1\. \<script setup lang="ts"\>

2\. \<template\>

3\. \<style scoped\> (reserved for edge cases; utility classes via Tailwind take precedence).

&nbsp;

\#\#\# Reactivity Conventions

\- Uniform ref() Usage: Use ref() across both primitives and complex objects to maintain consistent .value ergonomics. Restrict reactive() to justified large-scale state structures.

\- Props & Emits Declarations: Enforce compile-time type declarations:

  const props \= defineProps\<{

    profileId: string;

    isOpen: boolean;

    activeLogId?: string | null;

  }\>();

&nbsp;

  const emit \= defineEmits\<{

    (e: 'close'): void;

    (e: 'save', payload: HealthEventLog): void;

    (e: 'delete', id: string): void;

  }\>();

\- Component File Budget: No .vue component may exceed 180 lines of code. Deconstruct complex interfaces into atomic child components (CalendarGrid.vue, CalendarDayCell.vue, MonthlyInsightsSummary.vue).

&nbsp;

\---

&nbsp;

\#\# 3\. Pinia State Management

\- Setup Stores Mandatory: Define Pinia stores using function syntax exclusively:

  export const useEventStore \= defineStore('events', () \=\> {

    const logs \= ref\<HealthEventLog\[\]\>(\[\]);

    const activeFilter \= ref\<FilterType\>('all');

&nbsp;

    const filteredLogs \= computed(() \=\> {

      // Return filtered logs

    });

&nbsp;

    function addLog(entry: HealthEventLog) {

      logs.value.push(entry);

    }

&nbsp;

    return { logs, activeFilter, filteredLogs, addLog };

  });

\- Reactivity Preservation: Never destructure stores directly in setup scripts or templates. Always wrap extracted state with storeToRefs():

  const eventStore \= useEventStore();

  const { logs, activeFilter } \= storeToRefs(eventStore);

&nbsp;

\---

&nbsp;

\#\# 4\. Naming Conventions

&nbsp;

| Construct | Convention | Canonical Example |

| :--- | :--- | :--- |

| Component Files | PascalCase.vue | CalendarDayCell.vue, SidebarDock.vue |

| Composables | camelCase.ts (use prefix) | useCalendar.ts, useInteraction.ts |

| Pinia Stores | camelCase.ts (use...Store pattern) | useProfileStore.ts, useEventStore.ts |

| Types & Interfaces | PascalCase (no I prefix) | CalendarProfile, HealthEventLog |

| Functions & Variables | camelCase | detectCorrelations(), activeDate |

| Global Constants | SCREAMING\_SNAKE\_CASE | MAX\_WINDOW\_HOURS, GUEST\_STORAGE\_KEY |

&nbsp;

\---

&nbsp;

\#\# 5\. Tailwind CSS & UI Assembly Rules

\- Color Token Integrity: Arbitrary hex values are banned in component templates. Use only tokens extended in tailwind.config.js:

  \- text-slate, bg-slate, border-slate (structural text, icons, buttons)

  \- bg-peach, text-slate (symptoms, warnings, severity indicators)

  \- bg-sky (informational cards and secondary panels)

  \- bg-mint, text-slate (triggers, confirmations, correlation badges)

  \- bg-tint (soft background surfaces, pill containers)

  \- bg-canvas (clean canvas and cell backgrounds)

\- Class Ordering Protocol:

  1\. Box Model & Positioning (grid, flex, relative, w-full)

  2\. Spacing & Sizing (p-4, gap-3, min-h-\[87px\])

  3\. Typography (font-sans, text-sm, font-extrabold, text-slate)

  4\. Visual Surfaces (bg-canvas, rounded-2xl, border)

  5\. Interactive Modifiers (hover:, focus:, transition-all)

&nbsp;

\---

&nbsp;

\#\# 6\. Defensive Security & Network Rules

\- Sanitization Protocol: Every string accepted from user-editable inputs must pass through DOMPurify.sanitize() prior to reactivity assignment or storage:

  import DOMPurify from 'dompurify';

  const cleanNotes \= DOMPurify.sanitize(rawNotes.trim());

\- Robust Async Handling: API requests must reside within typed try/catch boundaries exposing reactive isLoading and error states to prevent unhandled rejection crashes.

\- Domain Error Hierarchy: Standard \`throw new Error(...)\` is prohibited in application services and controllers. Enforce custom domain classes derived from \`AppError\` (\`ValidationError\`, \`NotFoundError\`, \`UnauthorizedError\`) with explicit HTTP status mapping and machine-readable error codes.

\#\# 7\. Version Control & Git Guidelines

\- Strict Conventional Commits standard required: \`feat(...)\`, \`fix(...)\`, \`test(...)\`, \`refactor(...)\`, \`docs(...)\`, \`chore(...)\`.

\- Commits must be atomic, isolated to specific domain or component boundaries.

&nbsp;

&nbsp;