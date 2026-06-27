# ProductPlan

A product management platform for capturing ideas, planning roadmaps, tracking strategic objectives, and visualizing portfolio-level execution.

## Modules

### Ideas (`/ideas`)

- **Idea backlog** with table view showing title, status, tags, requester, votes, and priority score
- **Filter by status:** All, Backlog, Planned, In Progress, Done
- **Sort by:** Priority Score, Votes, or Date Added
- **Weighted prioritization scoring** — rate each idea across five dimensions:
  - _Benefit:_ Revenue Potential (3x), Customer Delight (2x), Strategic Value (2x)
  - _Cost:_ Effort (2x), Risk (1x)
  - Composite score (0–100) computed in real time with color-coded indicators (red/yellow/green)
- **Detail panel** expands on selection to show description, requester, tags, and the interactive scoring board

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
- **Composite progress** calculated as the average of key result completion percentages
- **Linked roadmap items** referenced on each objective

### Portfolio (`/portfolio`)

- **Three-level strategic timeline** visualizing the hierarchy: Objectives → Initiatives → Roadmap Bars
- **Auto-spanning dates** — parent items derive their date range from child work
- **Visual hierarchy** with distinct sizing and opacity per level
- **Show/Hide Connections toggle** to display linkages between hierarchy levels
- **RAG status legend** and hierarchy key

## Tech Stack

- React 19 + TypeScript
- TanStack Router
- Tailwind CSS 4
- Lucide React (icons)
- Vite

## Getting Started

```bash
npm install
npm run dev
```

## Current State

This is a frontend prototype using mock data. There is no backend, authentication, or data persistence — all state lives client-side. Action buttons (Add Idea, Add Bar, New Objective, Add Key Result) are present in the UI but not yet wired to creation flows.
