/**
 * src/data/apiClient.ts
 */

const API_BASE = "https://refugee-backend.onrender.com"

async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`)
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
  return res.json()
}

export interface ApiPopulationPoint {
  data_date: string
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

export interface ApiDetection {
  id: number
  object_type: string
  confidence: number
  lat: number
  lng: number
  detected_at: string
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
  resource_needs: Record<string, number>
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

export async function fetchDashboard(): Promise<ApiDashboard> {
  return apiFetch<ApiDashboard>('/api/dashboard')
}

export async function fetchPopulationTrend(days = 30): Promise<ApiPopulationPoint[]> {
  const data = await apiFetch<{ data: ApiPopulationPoint[] }>(`/api/population/trend?days=${days}`)
  return data.data
}

export async function fetchFlights(): Promise<ApiFlight[]> {
  const data = await apiFetch<{ flights: ApiFlight[] }>('/api/flights')
  return data.flights
}

export async function fetchDetections(): Promise<ApiDetection[]> {
  const data = await apiFetch<{ detections: ApiDetection[] }>('/api/detection/latest')
  return data.detections
}

export async function uploadImageForDetection(
  file: File,
  latTop: number,
  latBottom: number,
  lngLeft: number,
  lngRight: number
): Promise<{ count: number; detections: ApiDetection[] }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('lat_top', String(latTop))
  formData.append('lat_bottom', String(latBottom))
  formData.append('lng_left', String(lngLeft))
  formData.append('lng_right', String(lngRight))

  const res = await fetch(`${API_BASE}/api/detection/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`)
  return res.json()
}

export async function postAcknowledgeAlert(alertId: number): Promise<void> {
  await fetch(`${API_BASE}/api/alerts/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert_id: alertId, acknowledged_by: 'dashboard-user' }),
  })
}

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

export async function fetchHealth(): Promise<{ status: string; database: string }> {
  return apiFetch('/health')
}
