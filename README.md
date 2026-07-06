# ProductPlan

A product management platform for capturing ideas, planning roadmaps, tracking strategic objectives, and visualizing portfolio-level execution. Wired to a live Supabase backend and integrated with Jarvis (AI Chief of Staff) for automated initiative management.

## Modules

### Ideas (`/ideas`)

- **Idea backlog** with table view showing title, status, tags, requester, votes, and priority score
- **Filter by status:** All, Backlog, Planned, In Progress, Done
- **Filter by product** to scope ideas to a specific product area
- **Sort by:** Priority Score, Votes, or Date Added
- **Weighted prioritization scoring** — rate each idea across five dimensions:
  - _Benefit:_ Revenue Potential (3x), Customer Delight (2x), Strategic Value (2x)
  - _Cost:_ Effort (2x), Risk (1x)
  - Composite score (0–100) computed in real time with color-coded indicators (red/yellow/green)
- **Detail panel** expands on selection to show description, requester, tags, scoring board, and ShapeUp fields:
  - **Problem** — what user problem does this solve?
  - **Customer Evidence** — quotes, tickets, data supporting the need
  - **Appetite** — Small Batch / Big Batch / TBD
  - **Constraints** — known limitations or rabbit holes
- **Tag management** — add/remove tags directly from the detail panel
- Jarvis's Sage agent populates ShapeUp fields via conversational follow-up in Slack

### Roadmap (`/roadmap`)

- **Gantt-style timeline** with horizontal month-based scrolling and a "today" marker
- **Theme & container hierarchy** — organize bars under themes (e.g., Core Platform, Customer Intelligence) and containers (e.g., Ticket Management, Agent Productivity)
- **Collapsible themes** to show/hide groups of work
- **Roadmap bars** with color coding, date-based positioning, and progress fill (% complete)
- **Milestones** displayed as diamond markers on the timeline
- **Bar detail panel** showing title, date range, description, progress, tags, and status
- **Parked view** — a separate table of deferred initiatives that don't appear on the main timeline

### Strategy (`/strategy`)

- **OKR framework** with company-level and team-level objectives
- **Objective cards** showing title, description, RAG status (Red/Amber/Green), team, and a progress ring
- **Key results** expandable under each objective with current/target values, unit formatting ($, %, #), and progress bars
- **Initiatives nested under objectives** — each initiative shows:
  - Title with color-coded **status badge** (Draft, Active, In Progress, At Risk, Paused, Complete, Cancelled)
  - **Priority badge** (Critical, High, Medium, Low)
  - **Progress bar** with current/target values and success metric label
  - **Deadline** and **stakeholder names**
  - **Blockers** highlighted in red when present
  - **Operating owner** (who drives it — can be a Jarvis agent or a person)
- **Unlinked initiatives** — initiatives without an objective appear in a separate section
- Composite progress calculated as the average of key result completion percentages
- Linked roadmap items referenced on each objective

### Portfolio (`/portfolio`)

- **Three-level strategic timeline** visualizing the hierarchy: Objectives → Initiatives → Roadmap Bars
- **Auto-spanning dates** — parent items derive their date range from child work
- **Visual hierarchy** with distinct sizing and opacity per level
- **Show/Hide Connections toggle** to display linkages between hierarchy levels
- **RAG status legend** and hierarchy key

## Jarvis Integration

ProductPlan shares a Supabase instance with Jarvis (AI Chief of Staff). This enables:

- **Idea intake via Slack** — tell Jarvis about a new idea and Sage populates the ShapeUp fields (problem, evidence, appetite, constraints) through follow-up questions
- **Initiative management** — `pp_initiatives` is the single source of truth. When you tell Jarvis "new initiative: migrate enterprise customers", it captures stakeholders (name, role, email, Slack ID), success metrics, objective linkage, and writes directly to `pp_initiatives`. The data appears on the Strategy board immediately.
- **Initiative driving** — Jarvis reads active initiatives from `pp_initiatives`, identifies stalls via work items, diagnoses root causes, and takes autonomous actions (Slack messages, Jira tickets, escalations)
- **Dashboard sync** — active initiatives from `pp_initiatives` appear as goal nodes on the Jarvis dashboard Visual Hub, linked to their assigned agent

## Tech Stack

- React 19 + TypeScript
- TanStack Router + TanStack React Query
- Supabase (PostgreSQL + Realtime)
- Tailwind CSS 4
- Lucide React (icons)
- Vite

## Getting Started

```bash
npm install
npm run dev
```

## Data

All data is live from Supabase. Tables are prefixed `pp_` (e.g., `pp_ideas`, `pp_roadmap_bars`, `pp_objectives`, `pp_initiatives`). Company ID: `00000000-0000-0000-0000-000000000001`.
