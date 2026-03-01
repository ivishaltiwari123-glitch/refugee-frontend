import { create } from 'zustand'
import {
  fetchDashboard,
  fetchPopulationTrend,
  fetchFlights,
  postAcknowledgeAlert,
  postNewFlight,
  ApiPopulationPoint,
  ApiFlight,
} from '../data/apiClient'

export type UserRole = 'Admin' | 'Field' | 'Viewer'

export interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  zone: string
  message: string
  time: string
  acknowledged: boolean
}

export interface Truck {
  id: string
  name: string
  lat: number
  lng: number
  status: 'en-route' | 'delivering' | 'returning'
  cargo: string
  eta: string
}

export interface WaypointType {
  id: string
  label: string
  lat: number
  lng: number
  type: 'warehouse' | 'aid-point'
}

export interface LayerState {
  tents: boolean
  roads: boolean
  water: boolean
  latrines: boolean
  solar: boolean
  orthomosaic: boolean
  truckRoutes: boolean
}

export interface Stats {
  tents: number
  latrines: number
  waterPoints: number
  totalPop: number
  aidTrucks: number
  lastUpdate: string
}

export type DroneFlightId = string

interface DashboardStore {
  userRole: UserRole
  liveUpdates: boolean
  selectedFlight: DroneFlightId
  showNewFlightModal: boolean
  showExportModal: boolean
  showProcessModal: boolean
  showLayerPanel: boolean
  processingImages: boolean
  optimizingRoute: boolean
  apiConnected: boolean
  dataLoading: boolean
  layers: LayerState
  trucks: Truck[]
  waypoints: WaypointType[]
  activeAlerts: Alert[]
  stats: Stats
  resourceNeeds: { water: number; food: number; medical: number }
  populationTrend: ApiPopulationPoint[]
  flights: ApiFlight[]
  setUserRole: (role: UserRole) => void
  toggleLiveUpdates: () => void
  setSelectedFlight: (id: DroneFlightId) => void
  toggleLayer: (layer: keyof LayerState) => void
  setShowNewFlightModal: (v: boolean) => void
  setShowExportModal: (v: boolean) => void
  setShowProcessModal: (v: boolean) => void
  setShowLayerPanel: (v: boolean) => void
  addWaypoint: (wp: WaypointType) => void
  removeWaypoint: (id: string) => void
  reorderWaypoints: (from: number, to: number) => void
  loadDashboardData: () => Promise<void>
  acknowledgeAlert: (id: string) => Promise<void>
  processImages: () => void
  optimizeRoute: () => void
  updateTrucks: () => void
  updateStats: () => void
  launchFlight: (area: string, altitude: number) => Promise<void>
}

export const useStore = create<DashboardStore>((set, get) => ({
  userRole: 'Admin',
  liveUpdates: true,
  selectedFlight: 'flight-47',
  showNewFlightModal: false,
  showExportModal: false,
  showProcessModal: false,
  showLayerPanel: true,
  processingImages: false,
  optimizingRoute: false,
  apiConnected: false,
  dataLoading: true,

  layers: {
    tents: true, roads: true, water: true,
    latrines: true, solar: true, orthomosaic: false, truckRoutes: true,
  },

  trucks: [
    { id: 'T1', name: 'Truck Alpha',   lat: 33.52, lng: 36.28, status: 'en-route',   cargo: 'Water + Food', eta: '14:45' },
    { id: 'T2', name: 'Truck Bravo',   lat: 33.49, lng: 36.33, status: 'delivering', cargo: 'Medical',      eta: '15:10' },
    { id: 'T3', name: 'Truck Charlie', lat: 33.54, lng: 36.35, status: 'returning',  cargo: 'Empty',        eta: '16:00' },
  ],

  waypoints: [
    { id: 'wp-0', label: 'Central Warehouse',   lat: 33.50,  lng: 36.25, type: 'warehouse' },
    { id: 'wp-1', label: 'Zone A Aid Point',     lat: 33.515, lng: 36.30, type: 'aid-point' },
    { id: 'wp-2', label: 'Zone C Water Station', lat: 33.495, lng: 36.32, type: 'aid-point' },
    { id: 'wp-3', label: 'Zone E Medical Post',  lat: 33.505, lng: 36.34, type: 'aid-point' },
  ],

  activeAlerts: [
    { id: 'a1', severity: 'critical', zone: 'Zone A', message: 'Overcrowding — 340% capacity', time: '14:12', acknowledged: false },
    { id: 'a2', severity: 'critical', zone: 'Zone C', message: 'Water supply critically low',  time: '14:28', acknowledged: false },
    { id: 'a3', severity: 'warning',  zone: 'Zone B', message: 'Latrine capacity at 85%',      time: '13:55', acknowledged: false },
  ],

  stats: { tents: 1247, latrines: 89, waterPoints: 23, totalPop: 234511, aidTrucks: 3, lastUpdate: '--:--' },
  resourceNeeds: { water: 67, food: 45, medical: 12 },
  populationTrend: [],
  flights: [],

  // ── Load all real data from FastAPI ──────────────────────────
  loadDashboardData: async () => {
    set({ dataLoading: true })
    try {
      const [dashboard, trend, flights] = await Promise.all([
        fetchDashboard(),
        fetchPopulationTrend(30),
        fetchFlights(),
      ])

      const mappedAlerts: Alert[] = dashboard.alerts.map(a => ({
        id: String(a.id),
        severity: a.severity as Alert['severity'],
        zone: a.zone,
        message: a.message,
        time: new Date(a.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        acknowledged: a.acknowledged,
      }))

      const mappedTrucks: Truck[] = dashboard.trucks.map(t => ({
        id: t.id, name: t.name, lat: t.lat, lng: t.lng,
        status: (t.status as Truck['status']) || 'en-route',
        cargo: t.cargo || 'Unknown', eta: t.eta || '--:--',
      }))

      const rn = dashboard.resource_needs
      set({
        apiConnected: true,
        dataLoading: false,
        stats: {
          tents:       dashboard.stats.tents,
          latrines:    dashboard.stats.latrines,
          waterPoints: dashboard.stats.water_points,
          totalPop:    dashboard.stats.total_population,
          aidTrucks:   dashboard.stats.aid_trucks,
          lastUpdate:  dashboard.stats.last_update,
        },
        activeAlerts:    mappedAlerts.length > 0 ? mappedAlerts : get().activeAlerts,
        trucks:          mappedTrucks.length  > 0 ? mappedTrucks : get().trucks,
        resourceNeeds: {
          water:   rn['water']   ?? 67,
          food:    rn['food']    ?? 45,
          medical: rn['medical'] ?? 12,
        },
        populationTrend: trend,
        flights,
        selectedFlight: flights[0]?.id ?? 'flight-47',
      })
    } catch (err) {
      console.warn('API unavailable — using fallback data:', err)
      set({ apiConnected: false, dataLoading: false })
    }
  },

  acknowledgeAlert: async (id: string) => {
    set(s => ({ activeAlerts: s.activeAlerts.map(a => a.id === id ? { ...a, acknowledged: true } : a) }))
    try { await postAcknowledgeAlert(Number(id)) } catch {}
  },

  launchFlight: async (area: string, altitude: number) => {
    const { flights } = get()
    const nextNum = flights.length > 0 ? Math.max(...flights.map(f => f.flight_number)) + 1 : 48
    try {
      await postNewFlight({ flight_number: nextNum, area, altitude_m: altitude })
      const updated = await fetchFlights()
      set({ flights: updated, selectedFlight: updated[0]?.id ?? 'flight-47' })
    } catch (err) { console.warn('Could not create flight:', err) }
  },

  processImages: () => {
    set({ processingImages: true, showProcessModal: true })
    setTimeout(() => {
      set(s => ({
        processingImages: false,
        stats: { ...s.stats, tents: s.stats.tents + Math.floor(Math.random() * 10), latrines: s.stats.latrines + (Math.random() > 0.7 ? 1 : 0) },
      }))
    }, 3500)
  },

  optimizeRoute: () => {
    set({ optimizingRoute: true })
    setTimeout(() => {
      set(s => {
        const [head, ...rest] = s.waypoints
        return { waypoints: [head, ...rest.sort(() => Math.random() - 0.5)], optimizingRoute: false }
      })
    }, 2000)
  },

  updateTrucks: () => set(s => ({
    trucks: s.trucks.map(t => ({ ...t, lat: t.lat + (Math.random() - 0.5) * 0.002, lng: t.lng + (Math.random() - 0.5) * 0.002 }))
  })),

  updateStats: () => set(s => ({
    stats: { ...s.stats, lastUpdate: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
  })),

  setUserRole: (role) => set({ userRole: role }),
  toggleLiveUpdates: () => set(s => ({ liveUpdates: !s.liveUpdates })),
  setSelectedFlight: (id) => set({ selectedFlight: id }),
  toggleLayer: (l) => set(s => ({ layers: { ...s.layers, [l]: !s.layers[l] } })),
  setShowNewFlightModal: (v) => set({ showNewFlightModal: v }),
  setShowExportModal: (v) => set({ showExportModal: v }),
  setShowProcessModal: (v) => set({ showProcessModal: v }),
  setShowLayerPanel: (v) => set({ showLayerPanel: v }),
  addWaypoint: (wp) => set(s => ({ waypoints: [...s.waypoints, wp] })),
  removeWaypoint: (id) => set(s => ({ waypoints: s.waypoints.filter(w => w.id !== id) })),
  reorderWaypoints: (from, to) => set(s => {
    const wps = [...s.waypoints]
    const [item] = wps.splice(from, 1)
    wps.splice(to, 0, item)
    return { waypoints: wps }
  }),
}))
