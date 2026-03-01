/**
 * src/data/apiClient.ts
 * =====================
 * All API calls to the FastAPI backend.
 * Replaces fakeData.ts with real Supabase data.
 *
 * Local:      http://localhost:8000  (reads from .env.development)
 * Production: your Vercel URL        (reads from .env.production)
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://refugee-backend-production.up.railway.app'

// ─── Generic fetch ────────────────────────────────────────────
async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`)
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
  return res.json()
}

// ─── Types ────────────────────────────────────────────────────
export interface ApiPopulationPoint {
  data_date: string      // "2026-01-31"
  individuals: number
}

export interface ApiTruck {
  id: string
  name: string
  status: string
  cargo: string
  lat: number
  lng: number
  eta: string
  updated_at: string
}

export interface ApiAlert {
  id: number
  severity: string
  zone: string
  message: string
  acknowledged: boolean
  created_at: string
}

export interface ApiDashboard {
  stats: {
    total_population: number
    population_as_of: string
    tents: number
    latrines: number
    water_points: number
    aid_trucks: number
    last_update: string
  }
  population_trend: ApiPopulationPoint[]
  trucks: ApiTruck[]
  alerts: ApiAlert[]
  resource_needs: Record<string, number>   // { water: 67, food: 45, medical: 12 }
  flights: ApiFlight[]
}

export interface ApiFlight {
  id: string
  flight_number: number
  area: string
  altitude_m: number
  status: string
  coverage_pct: number
  image_count: number
  flight_date: string
}

// ─── API calls ────────────────────────────────────────────────

/** Single call — returns everything the dashboard needs */
export async function fetchDashboard(): Promise<ApiDashboard> {
  return apiFetch<ApiDashboard>('/api/dashboard')
}

/** Population trend for chart (last N days) */
export async function fetchPopulationTrend(days = 30): Promise<ApiPopulationPoint[]> {
  const data = await apiFetch<{ data: ApiPopulationPoint[] }>(`/api/population/trend?days=${days}`)
  return data.data
}

/** All drone flights */
export async function fetchFlights(): Promise<ApiFlight[]> {
  const data = await apiFetch<{ flights: ApiFlight[] }>('/api/flights')
  return data.flights
}

/** Acknowledge an alert — POST to backend → updates Supabase */
export async function postAcknowledgeAlert(alertId: number): Promise<void> {
  await fetch(`${API_BASE}/api/alerts/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert_id: alertId, acknowledged_by: 'dashboard-user' }),
  })
}

/** Create new flight */
export async function postNewFlight(data: {
  flight_number: number
  area: string
  altitude_m: number
  pilot_name?: string
}): Promise<void> {
  await fetch(`${API_BASE}/api/flights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/** Health check — used to detect if backend is reachable */
export async function fetchHealth(): Promise<{ status: string; database: string }> {
  return apiFetch('/health')
}
