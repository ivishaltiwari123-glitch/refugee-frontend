# 🌍 Refugee Camp GIS Dashboard

A production-ready GIS dashboard for humanitarian operations — built with React 18 + TypeScript + Tailwind CSS + Leaflet.js.

## ✨ Features

### Map (Leaflet.js)
- **Dark basemap** centered on Syria (33.5°N, 36.3°E)
- **AI Layer toggles**: Tents (red polygons, 1,247 detected), Roads (dashed yellow), Water points (drop markers), Latrines (orange diamonds), Solar arrays (yellow rectangles)
- **Click popups** with detailed information for every feature
- **Live truck GPS** — 3 animated truck markers updating every 10s
- **Waypoint system** — click map to add route waypoints (Admin/Field roles)

### Left Sidebar
- **Drone Flights dropdown** — Flight #47-44 with coverage stats
- **AI Detection stats** — live tent/latrine/water counts
- **Resource Needs** — animated progress bars (Water 67%, Food 45%, Medical 12%)
- **Action buttons**: New Flight, Process Images, Export PDF, Edit Layers (Admin), Start Route (Field)

### Right Sidebar
- **Route Planner** — draggable waypoints with distance/time estimates
- **Optimize Route button** — reshuffles waypoints with loading animation
- **Live Truck GPS** — real-time status, cargo, ETA per truck
- **Alert Panel** — 3 critical/warning alerts with acknowledge functionality

### Bottom Analytics
- **Population Trend** line chart (7-day history)
- **Aid Delivery Times** bar chart (color-coded by urgency)
- **Resource Stock** bar chart (critical items in red)
- **4 KPI cards**: Total population, Aid trucks, Last update, Water shortage

### Interactions
- Toggle all 7 layers on/off — updates map instantly
- Role-based UI: Admin, Field, Viewer with different button sets
- Live Updates toggle — fake WebSocket data refresh every 10s
- 3 working modals: New Flight (2-step), Export PDF (progress bar), Process Images (step-by-step)
- All buttons have loading states and success feedback

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [LINK](refugee-frontend.onrender.com)

## 🛠️ Tech Stack

| Package | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool |
| Tailwind CSS 3 | Styling |
| Leaflet 1.9 + react-leaflet | Map engine |
| Chart.js 4 + react-chartjs-2 | Analytics charts |
| Zustand | State management |
| Framer Motion | Animations |
| Lucide React | Icons |

## 📁 Structure

```
src/
├── components/
│   ├── Header.tsx          — Logo, live toggle, role selector
│   ├── MapView.tsx         — Leaflet map with all AI layers
│   ├── LeftSidebar.tsx     — Flights, layers, resources, actions
│   ├── RightSidebar.tsx    — Routes, trucks, alerts
│   ├── AnalyticsPanel.tsx  — 3 charts + KPI cards
│   └── Modals.tsx          — New Flight, Export, Process modals
├── store/
│   └── dashboardStore.ts   — Zustand global state
├── data/
│   └── fakeData.ts         — Realistic fake humanitarian data
├── App.tsx
├── main.tsx
└── index.css
```

## 🎨 Design System

- **Background**: `#0f172a` (dark navy)
- **Cards**: glassmorphism with `backdrop-filter: blur(12px)`
- **Accent blue**: `#1e40af` / `#0ea5e9`
- **Success**: `#10b981` | **Warning**: `#f59e0b` | **Critical**: `#ef4444`
- **Fonts**: IBM Plex Sans (UI) + JetBrains Mono (data/code)
