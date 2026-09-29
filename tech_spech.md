# TECH_SPEC.md: CuidaT Core System Specification

This document serves as the single source of truth for the development of CuidaT. Any AI coding agent must consult and adhere strictly to this specification before introducing structural, architectural, or logic changes.

---

## 1. Product Vision & Operational Constraints

CuidaT is a reactive web application designed for visual tracking, deterministic correlation, and management of symptoms, potential triggers, and medication schedules across pets, children, and adults.

- Core Use Cases & Behavioral Contracts:
  1. Quick Event Logging, Editing & Deletion:
     - Creation: User drags a badge (e.g., 🤢 Vomit) onto a calendar day or taps it on mobile, triggering `EventLogModal.vue`. User sets approximate time, selects intensity (1: Mild, 2: Moderate, 3: Severe), types sanitized notes (max 300 chars), and saves.
     - Modification / Removal: Clicking an existing event dot opens the modal in edit mode with prefilled values. The modal displays an explicit secondary destructive action ("Eliminar registro"), which triggers `deleteLog(id)` and removes the entry from reactive state/database.
  2. Deterministic Correlation Discovery:
     - Computation: The client or server runs `detectCorrelations()` matching every symptom against prior triggers occurring within an immediate-to-delayed window (`0 <= diffHours <= maxWindowHours`, default 48h). Events outside this window or where the symptom precedes the trigger are strictly ignored.
     - Visualization: Coincidences highlight matching calendar days and populate `MonthlyInsightsSummary.vue` with explicit medical disclaimers ("Coincidencias, no diagnósticos; consultar con profesional").
  3. Medication Leaflet / Booklet Ingestion & Adverse Effect Matching (Zero-Cost Vision):
     - Ingestion: User uploads a photo of a leaflet or pet vaccination card. The backend processes the file ephemerally in RAM (Buffer) and sends it to Gemini API via `POST /api/ai/scan-leaflet`.
     - Output: Returns structured JSON (`name`, `dosage`, `frequency`, `adverseEffects`) to populate new tracking definitions. Persisting Base64 images in PostgreSQL is strictly prohibited.
     - Pharmacovigilance Matching (ADR Guard): If an active correlation coincides with an item listed in `adverseEffects`, flag the correlation insight card with a dedicated tag: "Posible efecto adverso registrado en prospecto".
  4. Clinical Natural-Language Summary & PDF Export:
     - Trigger: User clicks "Ver resumen / Exportar" in the summary rail. The backend collects active month logs and invokes Gemini via `POST /api/ai/clinical-summary`.
     - Delivery: Gemini returns an objective clinical summary (symptom counts, frequency peaks, observed trigger pairings). The frontend renders the report with a 1-click download as a styled PDF using `jspdf` and `html2canvas`.
  5. Guest Mode Persistence & Zero-Data-Loss Migration:
     - Demo Workflow: Unregistered users track events locally under `@cuidat_guest_v1`.
     - Conversion: Upon registration, the frontend sends the local payload to `POST /api/auth/upgrade`. The backend creates the user and inserts all profiles/logs within a single atomic PostgreSQL transaction (`BEGIN ... COMMIT`) before wiping local storage.

- Dynamic Dock & Catalog Management:
  - Maximum Capacity: Maximum of 15 active item definitions per category (symptoms/triggers) per calendar profile.
  - Empty State: When a category has 0 items, render a clean empty slate message ("No hay elementos registrados") with a primary CTA button to create one.
  - Cascading Deletion Guard: Deleting an item definition that is already referenced by existing logs must prompt an explicit confirmation modal ("Este elemento tiene registros asociados en el calendario. ¿Seguro que deseas eliminarlo? Se borrarán todos los eventos vinculados").

- Critical Capabilities: Multi-profile management, hybrid tactile interface (Drag & Drop on desktop / Tap-to-select on mobile), deterministic time-window correlation engine (0–48h), anonymous guest session persisted in localStorage, 1-click evaluator demo mode, transactional user upgrade flow, progressive web app installation (PWA), and strict tenant isolation.
- Budget & Infrastructure Constraint: The system must be developed, run, and hosted under a strict €0 operational cost utilizing free-tier infrastructure and open-source packages.

---

## 2. Design System, UI Tokens & Interaction Patterns

### Design Tokens (Tailwind CSS Extension)
- slate (#496580): Primary brand token. Core typography, structural boundaries, active borders, and primary interactive CTAs.
- peach (#FFDBBB): Warning & Symptom accent. Applied to symptom badges, alerts, and active severity states.
- sky (#BADDFF): Informational surface. Secondary cards, modal containers, and selection outlines.
- mint (#BAFFF5): Positive trigger & confirmation accent. Applied to triggers, completed doses, and correlation badges.
- tint (#E6F4FE): Soft contextual backgrounds, secondary chips, and interactive hover states.
- canvas (#FDFDFD): Clean base canvas and calendar day cells.

### Typography
- Primary Font Family: Nunito Sans, sans-serif.
- Mandatory Weights: 400 (Regular), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black). Loaded via Google Fonts CDN in index.html.

### Workspace Layout (Desktop vs. Mobile)
- 3-Column Grid Desktop Layout (workspace):
  - Left Rail (232px): SidebarDock.vue housing toggleable tabs for Symptoms and Triggers / Food.
  - Center Stage (1fr flex): CalendarGrid.vue containing month navigation, weekday headers, and a native CSS Grid (grid-cols-7).
  - Right Rail (276px): MonthlyInsightsSummary.vue displaying monthly metrics, exploratory correlation cards ("Patrón a explorar"), and deep-link actions ("Ver coincidencias").
- Responsive Collapse (< 900px): Single-column stacked layout. The summary rail drops below the primary grid or is accessible via navigation, and the dock shifts beneath the calendar.
- Filter Scope Disambiguation:
  - Top Filter Toolbar (FilterToolbar.vue): Restricts which log entries are rendered within calendar day cells (Show All, Symptoms Only, Triggers Only, Correlation Mode, or specific trigger chip).
  - Dock Tabs (SidebarDock.vue): Switches which palette of emoji tokens is available for dragging or tapping into the calendar.
- Consultation Focus View:
  - Accessible via a toggle in `FilterToolbar.vue` ("Modo Consulta").
  - When active, collapses the left dock rail, suppresses direct editing/creation triggers, and maximizes the calendar grid and correlation insights for clean, distraction-free clinical evaluation during doctor/vet visits.
- Interaction Contract (Hybrid Desktop/Mobile):
  - Desktop (>= 768px): HTML5 Drag-and-Drop from dock items into targeted calendar day cells.
  - Mobile (< 768px): Tap-to-select pattern. Tapping an emoji primes it in the dock; tapping a target calendar day places the event and opens the log modal, preventing mobile viewport scroll conflicts.

---

## 3. Technology Stack & Workspace Architecture
- Monorepo Structure: Managed via npm workspaces from the root repository:
  - shared: Pure TypeScript domain models, Zod validation schemas, and deterministic business rules.
  - client: Frontend client built with Vue 3 (SFC script setup lang="ts"), Vite, Pinia, and Tailwind CSS.
  - server: Backend REST API built with Node.js, Express, TypeScript, Zod, and security middleware.
- Client Utilities & Plugins:
  - dayjs (date manipulation), lucide-vue-next (icons), @formkit/drag-and-drop (accessible DnD), dompurify (anti-XSS sanitization).
  - vite-plugin-pwa: Zero-cost PWA runtime providing offline asset caching and web application manifest (`display: standalone`, `theme_color: #496580`, `background_color: #FDFDFD`) for native-like mobile home screen installation.
- Persistence & Cloud: PostgreSQL with UUID primary keys and date-range indexes. Deployed on zero-cost tiers (Neon.tech or Supabase Free).
- AI Integrations (Zero Cost): Google Gemini API (Google AI Studio Free Tier) via @google/genai utilizing strict JSON Structured Outputs (responseSchema). Base64 image storage in PostgreSQL is strictly prohibited; images are parsed ephemerally in server RAM buffers.

---

## 4. Scaffolding & Directory Tree

/root
├── package.json (npm workspaces: ["shared", "client", "server"])
├── /shared
│   ├── package.json
│   └── src/
│       ├── types.ts           # Shared domain models (Profiles, Logs, Items)
│       ├── schemas.ts         # Runtime Zod validation schemas
│       └── correlation.ts     # Pure deterministic correlation algorithms
├── /client
│   ├── index.html             # Google Fonts preconnect & root container
│   ├── vite.config.ts         # Vite configuration with vite-plugin-pwa
│   ├── tailwind.config.js     # Extended color palette & typography
│   └── src/
│       ├── components/
│       │   ├── calendar/      # CalendarGrid.vue, CalendarDayCell.vue
│       │   ├── dock/          # SidebarDock.vue, DraggableBadge.vue
│       │   ├── summary/       # MonthlyInsightsSummary.vue
│       │   └── modals/        # EventLogModal.vue (Create / Update / Delete)
│       ├── composables/       # useCalendar.ts, useInteraction.ts
│       ├── stores/            # useProfileStore.ts, useEventStore.ts, useAuthStore.ts, useItemDefinitionStore.ts
│       └── views/             # LandingView.vue, DashboardView.vue, SettingsView.vue
├── /server
│   └── src/
│       ├── controllers/       # Express HTTP controllers
│       ├── middlewares/       # AuthMiddleware, RateLimiter (express-rate-limit)
│       ├── repositories/      # Tenant-scoped PostgreSQL data access
│       ├── services/          # Business logic & Google Gemini AI service
│       └── db/                # SQL migration files, connection pooling, and seeds.sql
└── /tests
    ├── unit/                  # Vitest specs for shared domain & stores
    └── e2e/                   # Playwright critical journey specs

---

## 5. Environment Configuration (.env.example)

# Frontend (.env)
VITE_API_URL=http://localhost:3000

# Backend (.env)
PORT=3000
DATABASE_URL=postgresql://cuidat_user:secure_password@localhost:5432/cuidat_db?sslmode=require
JWT_SECRET=super_secret_session_key_min_32_chars
GEMINI_API_KEY=AIzaSy...

---

## 6. Relational Database Schema (PostgreSQL DDL)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE calendar_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    profile_type VARCHAR(50) NOT NULL, -- 'pet', 'child', 'adult', 'custom'
    avatar_icon VARCHAR(50) DEFAULT '👤',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE health_item_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_id UUID NOT NULL REFERENCES calendar_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'symptom', 'trigger', 'medication'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE health_event_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_id UUID NOT NULL REFERENCES calendar_profiles(id) ON DELETE CASCADE,
    item_definition_id UUID NOT NULL REFERENCES health_item_definitions(id) ON DELETE RESTRICT,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
    intensity SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 3), -- 1: Mild, 2: Moderate, 3: Severe
    notes VARCHAR(300),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_calendar_date ON health_event_logs(calendar_id, logged_at);

---

## 7. Deterministic Correlation Algorithm
File: shared/src/correlation.ts

export interface HealthEvent {
  id: string;
  loggedAt: string; // ISO 8601 UTC
  [key: string]: unknown;
}

export interface CorrelationMatch {
  triggerEvent: HealthEvent;
  symptomEvent: HealthEvent;
  deltaHours: number;
}

export function detectCorrelations(
  triggers: HealthEvent[],
  symptoms: HealthEvent[],
  maxWindowHours = 48
): CorrelationMatch[] {
  const matches: CorrelationMatch[] = [];

  for (const symptom of symptoms) {
    const symptomTime = new Date(symptom.loggedAt).getTime();

    for (const trigger of triggers) {
      const triggerTime = new Date(trigger.loggedAt).getTime();
      const diffMillis = symptomTime - triggerTime;
      const diffHours = diffMillis / (1000 * 60 * 60);

      // The trigger must precede the symptom within the maximum allowable window
      if (diffHours >= 0 && diffHours <= maxWindowHours) {
        matches.push({
          triggerEvent: trigger,
          symptomEvent: symptom,
          deltaHours: Math.round(diffHours * 10) / 10
        });
      }
    }
  }

  return matches.sort((a, b) => a.deltaHours - b.deltaHours);
}

---

## 8. Multi-Tenancy, Security & Guest Migration

- Timezone Governance: All event timestamps (`logged_at`) must be transmitted and stored strictly in UTC (ISO 8601 with `Z` suffix). Local timezone conversion occurs strictly at the presentation layer via `dayjs`.
- Repository-Level Isolation: All database reads, updates, and deletes must explicitly bind the authenticated user's ID via joins or ownership clauses:
  SELECT l.* FROM health_event_logs l
  JOIN calendar_profiles p ON l.calendar_id = p.id
  WHERE p.user_id = $current_user_id AND l.calendar_id = $calendar_id;
- Rate-Limiting: AI endpoints (/api/ai/*) must enforce an IP-based rate limit via express-rate-limit (maximum 5 requests per hour) to safeguard external API quotas.
- Input Sanitization: Free-text inputs (notes) must be sanitized using DOMPurify.sanitize() prior to client storage or DOM insertion.
- Standardized API Response Contract:
  - Success: { "success": true, "data": T }
  - Error: { "success": false, "code": "ERROR_CODE", "message": "Human-readable context" }
- System Health Monitoring: The backend must expose an unauthenticated `GET /api/health` endpoint returning { "status": "ok", "timestamp": string, "uptime": number } for cloud orchestrator liveness probes.
- Guest Storage & Account Migration: Unregistered demo data resides under the `@cuidat_guest_v1` localStorage key. `POST /api/auth/upgrade` moves the local payload into PostgreSQL within a single atomic database transaction (`BEGIN ... COMMIT`).
- Migration & Seed Governance: Database changes must strictly follow ordered SQL migration files (`server/src/db/migrations/00X_name.sql`) executed sequentially via an idempotent migration runner tracking an `applied_migrations` metadata table. A deterministic seed file (`server/src/db/seeds.sql`) must populate a full evaluator test scenario (`demo@cuidat.app`).
- Evaluator / Demo 1-Click Access:
  - The login interface must include a direct "Acceso Demo / Evaluador" CTA.
  - Clicking this button seeds the active session (locally in localStorage or via pre-seeded demo user) with a complete dataset: an active profile ("Moby"), populated symptom/trigger catalogues, and realistic correlated logs for the current month.
- Data Sovereignty & Portability:
  - Provide client-side export and import functionality allowing users to download their entire history as a JSON file and restore it on demand.

---

## 9. Zero-Cost AI Extraction & Summaries

- SDK: Official @google/genai library connecting to Google AI Studio.
- Buffer-Only Processing: Vision requests parsing medication packaging or veterinary booklets accept multipart files into server memory buffers. Persisting images in PostgreSQL is forbidden.
- Strict Structured Outputs: All AI endpoints require strict Zod-compatible schema validation:
  config: {
    responseMimeType: "application/json",
    responseSchema: clinicalSummaryJsonSchema
  }
- Leaflet Ingestion Schema Contract:
  The schema for `POST /api/ai/scan-leaflet` must strictly enforce:
  `name`: string (medication / vaccine name)
  `dosage`: string (prescribed dose)
  `frequency`: string (intake interval)
  `adverseEffects`: array of strings (known side effects to be cross-matched by ADR guard)

  ---

## 10. Architectural Decision Records (ADRs)

- ADR-001: Deterministic Math Engine vs. LLM for Correlation
  - Context: Detecting temporal links between triggers and symptoms (0–48h).
  - Decision: Implemented as a pure, deterministic TypeScript algorithm covered 100% by unit tests.
  - Consequence: Completely eliminates LLM hallucinations, ensuring predictable and medically responsible clinical pattern discovery.

- ADR-002: Ephemeral RAM Buffer for Medical Vision Ingestion
  - Context: Extracting dosage and leaflet instructions using Gemini Multimodal API.
  - Decision: Uploaded images are buffered transiently in server memory (RAM Buffer) and dispatched directly to the API, strictly forbidding Base64 storage in PostgreSQL.
  - Consequence: Adheres to Zero-Cost tier constraints (Neon 0.5 GB quota) and upholds OWASP data privacy principles.

- ADR-003: Hybrid Interaction Protocol (Desktop DnD vs. Mobile Tap-to-Select)
  - Context: Touch screens trigger viewport scroll events during HTML5 Drag-and-Drop operations.
  - Decision: Dynamic execution branching based on the 768px viewport breakpoint.
  - Consequence: Zero interaction friction on touch screens and full desktop ergonomy without third-party mobile polyfills.