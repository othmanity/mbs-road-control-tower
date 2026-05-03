# Rashid - Agentic AI Use Case: Urban Expansion Spatial Analysis Service

## 1. Use Case Description

### Overview

**Rashid** is an agentic AI digital worker specialized in geospatial business operations for the Saudi Ministry of Municipalities and Housing (MoMH). The demo use case focuses on **automated urban expansion analysis** -- enabling Rashid to receive a natural-language business request, autonomously retrieve relevant GIS datasets from the Spatial Data Infrastructure (SDI), perform multi-year spatial comparisons of city boundaries, and produce both statistical and visual outputs showing how major Saudi cities have expanded over time.

### The Problem

Today, when a business owner within MoMH requests a spatial analysis (e.g., "How much has Riyadh expanded in the last year?"), the GIS department must:

1. Manually interpret the request and determine what datasets are needed
2. Search and retrieve layers from the SDI (urban boundaries, satellite imagery, land use, subdivision plans)
3. Prepare comparable datasets across time periods
4. Perform the geospatial analysis (overlay, difference, area calculations)
5. Generate maps and statistical reports

This process takes **days to weeks per request**, is hard to scale across 17 municipalities, and produces inconsistent results depending on the analyst.

### The Agentic AI Solution

Rashid operates as an **autonomous spatial analysis agent** that:

- **Receives** a natural-language request from a business user via a conversational interface
- **Interprets** the request to determine scope (cities, time periods, analysis type)
- **Searches** the SDI catalog to identify relevant datasets
- **Retrieves** the required geospatial layers (shapefiles, feature services, imagery)
- **Analyzes** the data -- delineating boundaries, computing overlays, calculating expansion zones
- **Generates** outputs: interactive maps, boundary comparisons, and city-level statistics (previous area, current area, expansion in sq. km, growth %)
- **Presents** results with a human-in-the-loop review step before final delivery

### Autonomy Model (4 Levels)

| Level | Role | Description | Timeline |
|-------|------|-------------|----------|
| **L1** - Junior Analyst | User as Operator | Human makes all decisions, Rashid executes tasks | Year 1 |
| **L2** - Analyst | User as Collaborator | Human and Rashid plan and execute together | Year 2 |
| **L3** - Senior Analyst | User as Validator | Rashid works autonomously, human validates key decisions | Year 3 (Phase 1) |
| **L4** - Expert | User as Monitor | Rashid operates with high autonomy under human oversight | Year 3 (Phase 2) |

**For the demo, Rashid operates at L1** -- it performs the full workflow but every major step is visible and confirmable by the user.

### Demo Scenario

> **Request:** "Identify urban expansion in the major cities of the Kingdom over one year -- how much each city expanded between 2024 and 2025."

**Rashid's workflow:**
1. Parse the request --> scope: all major cities, time: 2024 vs 2025, metric: urban boundary expansion
2. Query SDI --> retrieve urban boundary layers for 2024 and 2025
3. Load and validate shapefiles (like the al-seh dataset provided)
4. Compute spatial difference between year boundaries
5. Calculate statistics per city
6. Render comparison maps with expansion zones highlighted
7. Present dashboard with maps + statistics table

### Expected Outputs

- Previous-year urban boundary (polygon layer)
- Current-year urban boundary (polygon layer)
- Expansion zones (difference polygons, highlighted on map)
- Statistics table per city:
  - Previous urban area (sq. km)
  - Current urban area (sq. km)
  - Expansion area (sq. km)
  - Growth percentage (%)

### Key Value Proposition

| Metric | Value |
|--------|-------|
| Equivalent FTEs at maturity | 5-8 staff |
| Annual savings at L4 | 1.5 - 2.4 million SAR |
| Coverage | 24/7 across all 17 municipalities |
| Strategic alignment | Vision 2030 (AI = 1.4% of GDP), Ma'arifa strategy (3.5B SAR) |

---

## 2. Wireframe Implementation Plan

### Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | **React + TypeScript** | Component-based, fast prototyping |
| Map Engine | **MapLibre GL JS** (or Leaflet) | Open-source, renders GeoJSON/shapefiles |
| UI Framework | **Tailwind CSS + shadcn/ui** | Clean, professional look matching MoMH branding |
| Chat Interface | Custom React component | Conversational UX for the agentic interaction |
| Data | Static GeoJSON files (converted from shapefiles) | Demo doesn't need live SDI |
| Mock Agent Logic | Hardcoded workflow steps with timed transitions | Simulates Rashid's agentic behavior |

### Color Palette (MoMH Branding)

- Primary: `#1B6B5A` (teal/green from the deck)
- Secondary: `#C8A951` (gold accents)
- Background: `#F5F3EE` (warm off-white)
- Text: `#1A1A2E` (dark navy)
- Accent: `#E8DCC8` (light sand)

### Wireframe Screens

#### Screen 1: Landing / Request Input

```
+------------------------------------------------------------------+
|  [MoMH Logo]          Rashid - Spatial Analysis Agent      [AR/EN]|
+------------------------------------------------------------------+
|                                                                    |
|  +------------------------------------------------------------+  |
|  |                                                              |  |
|  |          [Rashid Avatar - circular illustration]              |  |
|  |                                                              |  |
|  |     "Welcome. I'm Rashid, your geospatial analysis agent."  |  |
|  |     "Describe the spatial analysis you need."                |  |
|  |                                                              |  |
|  |  +--------------------------------------------------------+  |  |
|  |  | "Identify urban expansion in major cities over one year"|  |  |
|  |  +--------------------------------------------------------+  |  |
|  |                                          [Send ->]            |  |
|  |                                                              |  |
|  |  Quick Actions:                                              |  |
|  |  [Urban Expansion] [Land Use Change] [Infrastructure Gap]   |  |
|  |                                                              |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

**Key elements:**
- Rashid's avatar (from the identity card in the deck)
- Natural language input field
- Quick-action chips for common analysis types
- Arabic/English toggle

---

#### Screen 2: Agent Workflow Progress

```
+------------------------------------------------------------------+
|  [Logo]               Rashid - Analysis in Progress         [AR/EN]|
+------------------------------------------------------------------+
|                                                                    |
|  Request: "Urban expansion in major cities, 2024 vs 2025"         |
|                                                                    |
|  Workflow Steps:                                                   |
|  +------------------------------------------------------------+  |
|  | [checkmark] 1. Request interpreted                           |  |
|  |    Scope: 5 major cities | Period: 2024-2025                |  |
|  |    Analysis: Urban boundary expansion                        |  |
|  |                                                              |  |
|  | [checkmark] 2. SDI search completed                          |  |
|  |    Found: 12 relevant layers across 5 cities                |  |
|  |    [View datasets >]                                         |  |
|  |                                                              |  |
|  | [checkmark] 3. Data retrieved and validated                   |  |
|  |    Shapefiles loaded: 10/10 | Quality check: PASSED          |  |
|  |                                                              |  |
|  | [spinning] 4. Performing spatial analysis...                  |  |
|  |    Computing boundary differences for each city               |  |
|  |    [=========>          ] 60%                                 |  |
|  |                                                              |  |
|  | [pending] 5. Generating maps and statistics                   |  |
|  | [pending] 6. Results ready for review                         |  |
|  +------------------------------------------------------------+  |
|                                                                    |
|  Agent Status: [L1 - Operator Mode] | Confidence: 94%             |
+------------------------------------------------------------------+
```

**Key elements:**
- Step-by-step workflow tracker (maps to the 8-step Rashid workflow from PwC doc)
- Real-time progress indicator
- Expandable detail per step (datasets found, quality checks)
- Autonomy level badge (L1) and confidence score
- Each step is "confirmable" by the user (human-in-the-loop)

---

#### Screen 3: Results Dashboard

```
+------------------------------------------------------------------+
|  [Logo]           Rashid - Urban Expansion Results          [AR/EN]|
+------------------------------------------------------------------+
|                                                                    |
| +------------------------------+  +-----------------------------+ |
| |                              |  |  City Statistics             | |
| |     [Interactive Map]        |  |  +-------------------------+ | |
| |                              |  |  | City    | 2024  | 2025  | | |
| |   [2024 boundary - dashed]   |  |  |         | km2   | km2   | | |
| |   [2025 boundary - solid]    |  |  +---------+-------+-------+ | |
| |   [Expansion zones - orange] |  |  | Riyadh  | 1,890 | 1,945 | | |
| |                              |  |  | Jeddah  | 1,230 | 1,268 | | |
| |   Layer Controls:            |  |  | Dammam  |   540 |   562 | | |
| |   [x] 2024 Boundary          |  |  | Makkah  |   850 |   871 | | |
| |   [x] 2025 Boundary          |  |  | Madinah |   620 |   638 | | |
| |   [x] Expansion Zones        |  |  +---------+-------+-------+ | |
| |   [ ] Satellite Imagery      |  |                               | |
| |                              |  |  +-------------------------+ | |
| +------------------------------+  |  | Expansion  | Growth %   | | |
|                                    |  | 55 km2     | 2.91%      | | |
| +------------------------------+  |  | 38 km2     | 3.09%      | | |
| |  [Bar Chart]                 |  |  | 22 km2     | 4.07%      | | |
| |  Growth % by City            |  |  | 21 km2     | 2.47%      | | |
| |  Dammam ========= 4.07%     |  |  | 18 km2     | 2.90%      | | |
| |  Jeddah ======== 3.09%      |  |  +-------------------------+ | |
| |  Riyadh ======= 2.91%       |  |                               | |
| |  Madinah ====== 2.90%       |  |  Total Expansion: 154 km2    | |
| |  Makkah ===== 2.47%         |  |  Avg Growth: 3.09%           | |
| +------------------------------+  +-----------------------------+ |
|                                                                    |
|  [Download Report PDF]  [Export Shapefiles]  [Share with Team]    |
+------------------------------------------------------------------+
```

**Key elements:**
- Interactive map with toggle-able layers (2024 boundary, 2025 boundary, expansion zones)
- Statistics table with per-city breakdown
- Bar chart for comparative visualization
- Summary metrics (total expansion, average growth)
- Export actions (PDF report, shapefiles, sharing)

---

#### Screen 4: Rashid Agent Card (Side Panel)

```
+----------------------------------+
|  Digital Worker Identity          |
|  +------------------------------+|
|  |  [Rashid Avatar]              ||
|  |  Name: Rashid                 ||
|  |  ID: DW-GIS-2026-001         ||
|  |  Level: L1 (Junior Analyst)   ||
|  |  Department: GIS Management   ||
|  |  Agency: Urban Planning       ||
|  +------------------------------+|
|                                   |
|  Performance (last 90 days):      |
|  Task Success Rate: 98.2%        |
|  Tasks Completed: 347            |
|  Critical Errors: 0              |
|  Maturity Score: 12/25           |
|                                   |
|  Capabilities:                    |
|  [x] SDI data retrieval          |
|  [x] Spatial analysis            |
|  [x] Boundary comparison         |
|  [x] Statistical reporting       |
|  [ ] Advanced modeling (L2+)     |
|  [ ] Cross-Amanat analysis (L2+)|
+----------------------------------+
```

---

### Implementation Plan

#### Phase 1: Setup & Data Preparation (Days 1-2)

| Task | Details |
|------|---------|
| Project scaffolding | `create-react-app` or Vite + React + TypeScript |
| Convert shapefiles to GeoJSON | Use `ogr2ogr` on the al-seh shapefiles |
| Prepare mock data | Create sample GeoJSON for 5 major Saudi cities with 2024/2025 boundaries |
| Set up map library | Integrate MapLibre GL JS or Leaflet |
| Design system | Configure Tailwind with MoMH color palette and Arabic font (Tajawal) |

#### Phase 2: Core Screens (Days 3-5)

| Task | Details |
|------|---------|
| Screen 1 - Chat Input | Build conversational UI with Rashid avatar, text input, quick-action chips |
| Screen 2 - Workflow Tracker | Animated step progression with expandable details, progress bar |
| Screen 3 - Results Dashboard | Split layout: map (left) + stats table & chart (right), layer toggles |
| Screen 4 - Agent Card | Side panel component showing Rashid's identity and performance metrics |

#### Phase 3: Interactivity & Polish (Days 6-8)

| Task | Details |
|------|---------|
| Map interactions | Click city to zoom, hover for tooltip, toggle boundary layers |
| Simulated agent flow | Timed transitions through workflow steps (2-3 sec per step) |
| Chart rendering | Bar chart for growth %, optional pie chart for area distribution |
| RTL support | Arabic layout support, bidirectional text |
| Responsive design | Ensure usable on tablet for demo presentations |

#### Phase 4: Demo Package (Days 9-10)

| Task | Details |
|------|---------|
| Demo script | Pre-loaded scenario with the urban expansion request |
| PDF export mockup | Styled report template |
| Deploy | Static hosting (Vercel/Netlify) for easy demo access |
| Walkthrough video | Optional screen recording of the full flow |

### File Structure

```
rashid-wireframe/
  public/
    assets/
      rashid-avatar.png
      momh-logo.svg
  src/
    components/
      ChatInput.tsx           # Natural language request input
      WorkflowTracker.tsx     # Agent step progression
      MapView.tsx             # Interactive map with boundary layers
      StatsTable.tsx          # City-level statistics table
      GrowthChart.tsx         # Bar chart visualization
      AgentCard.tsx           # Rashid identity & performance panel
      LayerControls.tsx       # Map layer toggles
    data/
      cities-2024.geojson     # Previous year boundaries
      cities-2025.geojson     # Current year boundaries
      expansion-zones.geojson # Computed difference polygons
      mock-stats.json         # Pre-computed statistics
    hooks/
      useAgentSimulation.ts   # Simulates the agentic workflow progression
    styles/
      theme.ts                # MoMH color palette & typography
    App.tsx
    main.tsx
```

### What Makes This "Agentic"

This wireframe demonstrates agentic AI characteristics that go beyond a simple dashboard:

1. **Autonomy** -- Rashid independently determines which datasets to retrieve and how to analyze them, rather than following a rigid script
2. **Goal-directed reasoning** -- Given a high-level business request, it decomposes it into sub-tasks (scope definition, data retrieval, analysis, output generation)
3. **Tool use** -- It interfaces with the SDI catalog, GIS processing tools, and visualization engines as instruments to achieve the goal
4. **Human-in-the-loop** -- At L1, every step is visible and confirmable; as Rashid matures to L4, more steps become autonomous
5. **Progressive autonomy** -- The 4-level maturity framework is embedded in the UI, showing where Rashid currently operates and what capabilities unlock at higher levels
6. **Self-monitoring** -- The maturity scorecard and performance metrics (98%+ success rate, <2% error rate) are surfaced in the agent card

---

*This wireframe is designed to showcase Rashid's capabilities for the Urban Planning RRT Pipeline Project demo (Q3 2026) for the Ministry of Municipalities and Housing, as specified in the PwC engagement brief.*
