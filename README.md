# MBS Road Control Tower

Leadership-facing **control tower** for the Prince Mohammed bin Salman Road corridor (Jeddah → Makkah, 75 km).

Built for the Saudi **Ministry of Municipalities & Housing (MoMAH)** to track progress on the 4 root-cause categories identified in the April 2026 report:

1. Lack of a single supervising authority
2. Spread of visual distortions (تشوه بصري)
3. Weak infrastructure level
4. Unused economic opportunities

## Architecture

| Piece | Stack | Hosting |
|---|---|---|
| **Frontend** | React 19 · Vite · TypeScript · Tailwind · Leaflet · recharts · jsPDF | Vercel |
| **Backend** | Express · Anthropic SDK (Claude) | Railway |
| **Data** | Synthetic PoC data for 3 zones (Z8, Z35, Z70), one per geographic sub-stretch | In-repo (`src/data/`, `src/kb/`) |

## Local development

```bash
# 1. Install deps
npm install

# 2. Copy env template and add your Anthropic API key
cp .env.example .env
# edit .env → ANTHROPIC_API_KEY=sk-ant-...

# 3. Run frontend + backend together
npm run dev:all
```

- Frontend: http://localhost:5173 (or next free port)
- Backend health: http://localhost:3001/api/health

You can also run them separately: `npm run dev` (frontend) and `npm run server` (backend).

## Production environment variables

**Railway (backend):**
- `ANTHROPIC_API_KEY` — required
- `ANTHROPIC_MODEL` — optional (default `claude-sonnet-4-6`)
- `PORT` — Railway sets this automatically

**Vercel (frontend):**
- `VITE_API_BASE_URL` — URL of the Railway backend (no trailing slash)

## What's where

```
src/
  pages/              6 leadership pages (Overview, Map, ZoneDetail, Activities, Reports, Chat)
  components/         Header, Sidebar, KpiTile, CorridorStrip, FindingCard
  data/               Synthetic data (corridor + 75 zones, findings, agencies, KPIs)
  kb/                 Knowledge base (facts snapshot + 47 Q&A pairs)
  utils/              PDF exporters

server/
  index.ts            Express + Anthropic streaming /api/chat endpoint
```
