# ReviewLlama Dashboard

Dark, IDE-inspired React dashboard for the ReviewLlama code review assistant.
Built with Vite + React + Tailwind, designed to feel like a real developer
tool rather than a generic admin template — JetBrains Mono for diffs and
data, real diff-red/diff-green coloring, and a confidence-ring on every
finding instead of a flat badge.

## Setup

```bash
cd dashboard
npm install
npm run dev
```

Opens at `http://localhost:5173`. The dev server proxies `/api/*` requests to
your FastAPI backend at `http://localhost:8000` (see `vite.config.js`).

## Live data vs demo data

The dashboard polls `/api/health` and `/api/reviews/stats` every 15 seconds.
If your backend isn't running, it falls back to realistic mock data
automatically (see `src/lib/api.js`) so the UI is always presentable — useful
for demos or screenshots without needing the backend up.

The top bar shows a "Live" badge (green, pulsing) when connected to a real
backend, or "Demo data" when running on mocks.

## Structure

```
src/
  components/
    Sidebar.jsx          Nav + live model performance (recall/FPR)
    TopBar.jsx            Live/demo status indicator
    MetricsRow.jsx         4-stat overview cards
    FindingCard.jsx        Diff viewer + confidence ring (signature element)
    PatternsPanel.jsx      Anti-pattern frequency bars
    BotPreviewPanel.jsx    GitHub bot comment preview
  lib/
    api.js                 Backend client with mock fallback
  App.jsx                  Layout + polling logic
```

## Next steps to make this fully live

1. Add a `GET /reviews/recent` endpoint to the backend that returns actual
   findings from Postgres (currently the feed uses mock findings even when
   `/health` and `/stats` are live)
2. Replace polling with a WebSocket connection for true real-time updates
   as PRs come in
3. Wire `onApplyFix` in `FindingCard.jsx` to actually call the GitHub API
   and post a suggested-change commit
