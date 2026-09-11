\# TECH\_SPEC.md: CuidaT Core System Specification

&nbsp;

This document serves as the single source of truth for the development of CuidaT. Any AI coding agent must consult and adhere strictly to this specification before introducing structural, architectural, or logic changes.

&nbsp;

\---

&nbsp;

\#\# 1\. Product Vision & Operational Constraints

CuidaT is a reactive web application designed for visual tracking, correlation, and management of symptoms, potential triggers, and medication schedules across pets, children, and adults.

\- Core Use Cases & Behavioral Contracts:

  1\. Quick Event Logging, Editing & Deletion:

     \- Creation: User drags a badge (e.g., 🤢 Vomit) onto a calendar day or taps it on mobile, triggering \`EventLogModal.vue\`. User sets approximate time, selects intensity (1: Mild, 2: Moderate, 3: Severe), types sanitized notes (max 300 chars), and saves.

     \- Modification / Removal: Clicking an existing event dot opens the modal in edit mode with prefilled values. The modal displays an explicit secondary destructive action ("Eliminar registro"), which triggers \`deleteLog(id)\` and removes the entry from reactive state/database.

  2\. Deterministic Correlation Discovery:

     \- Computation: The client or server runs \`detectCorrelations()\` matching every symptom against prior triggers occurring within a strict 12–48h window (\`0 \<= diffHours \<= maxWindowHours\`). Events outside this window or where the symptom precedes the trigger are ignored.

     \- Visualization: Coincidences highlight matching calendar days and populate \`MonthlyInsightsSummary.vue\` with explicit medical disclaimers ("Coincidencias, no diagnósticos; consultar con profesional").

  3\. Medication Leaflet / Booklet Ingestion (Zero-Cost Vision):

     \- Ingestion: User uploads a photo of a leaflet or pet vaccination card. The backend processes the file ephemerally in RAM (Buffer) and sends it to Gemini API via \`POST /api/ai/scan-leaflet\`.

     \- Output: Returns structured JSON (\`name\`, \`dosage\`, \`frequency\`) to populate new tracking definitions. Persisting Base64 images in PostgreSQL is strictly prohibited.

  4\. Clinical Natural-Language Summary & PDF Export:

     \- Trigger: User clicks "Ver resumen / Exportar" in the summary rail. The backend collects active month logs and invokes Gemini via \`POST /api/ai/clinical-summary\`.

     \- Delivery: Gemini returns an objective clinical summary (symptom counts, frequency peaks, observed trigger pairings). The frontend renders the report with a 1-click download as a styled PDF using \`jspdf\` and \`html2canvas\`.

  5\. Guest Mode Persistence & Zero-Data-Loss Migration:

     \- Demo Workflow: Unregistered users track events locally under \`@cuidat\_guest\_v1\`.

     \- Conversion: Upon registration, the frontend sends the local payload to \`POST /api/auth/upgrade\`. The backend creates the user and inserts all profiles/logs within a single atomic PostgreSQL transaction (\`BEGIN ... COMMIT\`) before wiping local storage.

&nbsp;

&nbsp;

&nbsp;

\- Critical Capabilities: Multi-profile management, hybrid tactile interface (Drag & Drop on desktop / Tap-to-select on mobile), deterministic time-window correlation engine (12–48h), anonymous guest session persisted in localStorage, transactional user upgrade flow, and strict tenant isolation.

\- Budget & Infrastructure Constraint: The system must be developed, run, and hosted under a strict €0 operational cost utilizing free-tier infrastructure and open-source packages.

\---

&nbsp;

\#\# 2\. Design System, UI Tokens & Interaction Patterns

&nbsp;

\#\#\# Design Tokens (Tailwind CSS Extension)

\- slate (\#496580): Primary brand token. Core typography, structural boundaries, active borders, and primary interactive CTAs.

\- peach (\#FFDBBB): Warning & Symptom accent. Applied to symptom badges, alerts, and active severity states.

\- sky (\#BADDFF): Informational surface. Secondary cards, modal containers, and selection outlines.

\- mint (\#BAFFF5): Positive trigger & confirmation accent. Applied to triggers, completed doses, and correlation badges.

\- tint (\#E6F4FE): Soft contextual backgrounds, secondary chips, and interactive hover states.

\- canvas (\#FDFDFD): Clean base canvas and calendar day cells.

&nbsp;

\#\#\# Typography

\- Primary Font Family: Nunito Sans, sans-serif.

\- Mandatory Weights: 400 (Regular), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black). Loaded via Google Fonts CDN in index.html.

&nbsp;

\#\#\# Workspace Layout (Desktop vs. Mobile)

\- 3-Column Grid Desktop Layout (workspace):

  \- Left Rail (232px): SidebarDock.vue housing toggleable tabs for Symptoms and Triggers / Food.

  \- Center Stage (1fr flex): CalendarGrid.vue containing month navigation, weekday headers, and a native CSS Grid (grid-cols-7).

  \- Right Rail (276px): MonthlyInsightsSummary.vue displaying monthly metrics, exploratory correlation cards ("Patrón a explorar"), and deep-link actions ("Ver coincidencias").

\- Responsive Collapse (\< 900px): Single-column stacked layout. The summary rail drops below the primary grid or is accessible via navigation, and the dock shifts beneath the calendar.

\- Filter Scope Disambiguation:

  \- Top Filter Toolbar (FilterToolbar.vue): Restricts which log entries are rendered within calendar day cells (Show All, Symptoms Only, Triggers Only, Correlation Mode, or specific trigger chip).

  \- Dock Tabs (SidebarDock.vue): Switches which palette of emoji tokens is available for dragging or tapping into the calendar.

\- Interaction Contract (Hybrid Desktop/Mobile):

  \- Desktop (\>= 768px): HTML5 Drag-and-Drop from dock items into targeted calendar day cells.

  \- Mobile (\< 768px): Tap-to-select pattern. Tapping an emoji primes it in the dock; tapping a target calendar day places the event and opens the log modal, preventing mobile viewport scroll conflicts.

&nbsp;

\---

&nbsp;

\#\# 3\. Technology Stack & Workspace Architecture

\- Monorepo Structure: Managed via npm workspaces from the root repository:

  \- shared: Pure TypeScript domain models, Zod validation schemas, and deterministic business rules.

  \- client: Frontend client built with Vue 3 (SFC script setup lang="ts"), Vite, Pinia, and Tailwind CSS.

  \- server: Backend REST API built with Node.js, Express, TypeScript, Zod, and security middleware.

\- Client Utilities: dayjs (date manipulation), lucide-vue-next (icons), @formkit/drag-and-drop (accessible DnD), dompurify (anti-XSS sanitization).

\- Persistence & Cloud: PostgreSQL with UUID primary keys and date-range indexes. Deployed on zero-cost tiers (Neon.tech or Supabase Free).

\- AI Integrations (Zero Cost): Google Gemini API (Google AI Studio Free Tier) via @google/genai utilizing strict JSON Structured Outputs (responseSchema). Base64 image storage in PostgreSQL is strictly prohibited; images are parsed ephemerally in server RAM buffers.

&nbsp;

\---

&nbsp;

\#\# 4\. Scaffolding & Directory Tree

&nbsp;

/root

├── package.json (npm workspaces: \["shared", "client", "server"\])

├── /shared

│   ├── package.json

│   └── src/

│       ├── types.ts           \# Shared domain models (Profiles, Logs, Items)

│       ├── schemas.ts         \# Runtime Zod validation schemas

│       └── correlation.ts     \# Pure deterministic correlation algorithms

├── /client

│   ├── index.html             \# Google Fonts preconnect & root container

│   ├── tailwind.config.js     \# Extended color palette & typography

│   └── src/

│       ├── components/

│       │   ├── calendar/      \# CalendarGrid.vue, CalendarDayCell.vue

│       │   ├── dock/          \# SidebarDock.vue, DraggableBadge.vue

│       │   ├── summary/       \# MonthlyInsightsSummary.vue

│       │   └── modals/        \# EventLogModal.vue (Create / Update / Delete)

│       ├── composables/       \# useCalendar.ts, useInteraction.ts

│       ├── stores/            \# useProfileStore.ts, useEventStore.ts, useAuthStore.ts

│       └── views/             \# LandingView.vue, DashboardView.vue, SettingsView.vue

├── /server

│   └── src/

│       ├── controllers/       \# Express HTTP controllers

│       ├── middlewares/       \# AuthMiddleware, RateLimiter (express-rate-limit)

│       ├── repositories/      \# Tenant-scoped PostgreSQL data access

│       ├── services/          \# Business logic & Google Gemini AI service

│       └── db/                \# SQL migration files and connection pooling

└── /tests

    ├── unit/                  \# Vitest specs for shared domain & stores

    └── e2e/                   \# Playwright critical journey specs

&nbsp;

\---

&nbsp;

\#\# 5\. Environment Configuration (.env.example)

&nbsp;

\# Frontend (.env)

VITE\_API\_URL=http://localhost:3000

&nbsp;

\# Backend (.env)

PORT=3000

DATABASE\_URL=postgresql://cuidat\_user:secure\_password@localhost:5432/cuidat\_db

JWT\_SECRET=super\_secret\_session\_key\_min\_32\_chars

GEMINI\_API\_KEY=AIzaSy...

&nbsp;

\---

&nbsp;

\#\# 6\. Relational Database Schema (PostgreSQL DDL)

&nbsp;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

&nbsp;

CREATE TABLE users (

    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

    email VARCHAR(255) UNIQUE,

    is\_anonymous BOOLEAN DEFAULT FALSE,

    created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

&nbsp;

CREATE TABLE calendar\_profiles (

    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

    user\_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,

    profile\_type VARCHAR(50) NOT NULL, \-- 'pet', 'child', 'adult', 'custom'

    avatar\_icon VARCHAR(50) DEFAULT '👤',

    created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

&nbsp;

CREATE TABLE health\_item\_definitions (

    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

    calendar\_id UUID NOT NULL REFERENCES calendar\_profiles(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,

    emoji VARCHAR(10) NOT NULL,

    category VARCHAR(50) NOT NULL, \-- 'symptom', 'trigger', 'medication'

    is\_active BOOLEAN DEFAULT TRUE,

    created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

&nbsp;

CREATE TABLE health\_event\_logs (

    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

    calendar\_id UUID NOT NULL REFERENCES calendar\_profiles(id) ON DELETE CASCADE,

    item\_definition\_id UUID NOT NULL REFERENCES health\_item\_definitions(id) ON DELETE RESTRICT,

    logged\_at TIMESTAMP WITH TIME ZONE NOT NULL,

    intensity SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 3), \-- 1: Mild, 2: Moderate, 3: Severe

    notes VARCHAR(300),

    created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

&nbsp;

CREATE INDEX idx\_logs\_calendar\_date ON health\_event\_logs(calendar\_id, logged\_at);

&nbsp;

\---

&nbsp;

\#\# 7\. Deterministic Correlation Algorithm

File: shared/src/correlation.ts

&nbsp;

export interface HealthEvent {

  id: string;

  loggedAt: string; // ISO 8601 UTC

  \[key: string\]: unknown;

}

&nbsp;

export interface CorrelationMatch {

  triggerEvent: HealthEvent;

  symptomEvent: HealthEvent;

  deltaHours: number;

}

&nbsp;

export function detectCorrelations(

  triggers: HealthEvent\[\],

  symptoms: HealthEvent\[\],

  maxWindowHours \= 48

): CorrelationMatch\[\] {

  const matches: CorrelationMatch\[\] \= \[\];

&nbsp;

  for (const symptom of symptoms) {

    const symptomTime \= new Date(symptom.loggedAt).getTime();

&nbsp;

    for (const trigger of triggers) {

      const triggerTime \= new Date(trigger.loggedAt).getTime();

      const diffMillis \= symptomTime \- triggerTime;

      const diffHours \= diffMillis / (1000 \* 60 \* 60);

&nbsp;

      // The trigger must precede the symptom within the maximum allowable window

      if (diffHours \>= 0 && diffHours \<= maxWindowHours) {

        matches.push({

          triggerEvent: trigger,

          symptomEvent: symptom,

          deltaHours: Math.round(diffHours \* 10\) / 10

        });

      }

    }

  }

&nbsp;

  return matches.sort((a, b) \=\> a.deltaHours \- b.deltaHours);

}

&nbsp;

\---

&nbsp;

\#\# 8\. Multi-Tenancy, Security & Guest Migration

\- Timezone Governance: All event timestamps (\`logged\_at\`) must be transmitted and stored strictly in UTC (ISO 8601 with \`Z\` suffix). Local timezone conversion occurs strictly at the presentation layer via \`dayjs\`.

\- Repository-Level Isolation: All database reads, updates, and deletes must explicitly bind the authenticated user's ID via joins or ownership clauses:

  SELECT l.\* FROM health\_event\_logs l

  JOIN calendar\_profiles p ON l.calendar\_id \= p.id

  WHERE p.user\_id \= $current\_user\_id AND l.calendar\_id \= $calendar\_id;

\- Rate-Limiting: AI endpoints (/api/ai/\*) must enforce an IP-based rate limit via express-rate-limit (maximum 5 requests per hour) to safeguard external API quotas.

\- Input Sanitization: Free-text inputs (notes) must be sanitized using DOMPurify.sanitize() prior to client storage or DOM insertion.

\- Standardized API Response Contract:

  \- Success: { "success": true, "data": T }

  \- Error: { "success": false, "code": "ERROR\_CODE", "message": "Human-readable context" }

\- System Health Monitoring: The backend must expose an unauthenticated \`GET /api/health\` endpoint returning \`{ "status": "ok", "timestamp": string, "uptime": number }\` for cloud orchestrator liveness probes.

\- Guest Storage & Account Migration: Unregistered demo data resides under the @cuidat\_guest\_v1 localStorage key. POST /api/auth/upgrade moves the local payload into PostgreSQL within a single atomic database transaction (BEGIN ... COMMIT).

\- Migration Governance: Database changes must strictly follow ordered SQL migration files (\`server/src/db/migrations/00X\_name.sql\`) executed sequentially via an idempotent migration runner tracking an \`applied\_migrations\` metadata table.

\---

&nbsp;

\#\# 9\. Zero-Cost AI Extraction & Summaries

\- SDK: Official @google/genai library connecting to Google AI Studio.

\- Buffer-Only Processing: Vision requests parsing medication packaging or veterinary booklets accept multipart files into server memory buffers. Persisting images in PostgreSQL is forbidden.

\- Strict Structured Outputs: All AI endpoints require strict Zod-compatible schema validation:

  config: {

    responseMimeType: "application/json",

    responseSchema: clinicalSummaryJsonSchema

  }

&nbsp;

&nbsp;