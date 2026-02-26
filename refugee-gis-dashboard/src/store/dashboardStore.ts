import { create } from 'zustand'

export type UserRole = 'Admin' | 'Field' | 'Viewer'
export type DroneFlightId = 'flight-47' | 'flight-46' | 'flight-45' | 'flight-44'

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

interface DashboardStore {
  // UI state
  userRole: UserRole
  liveUpdates: boolean
  selectedFlight: DroneFlightId
  showNewFlightModal: boolean
  showExportModal: boolean
  showProcessModal: boolean
  showLayerPanel: boolean
  processingImages: boolean
  optimizingRoute: boolean
  activeAlerts: Alert[]
  
  // Map & layers
  layers: LayerState
  trucks: Truck[]
  waypoints: WaypointType[]
  
  // Stats
  stats: Stats
  resourceNeeds: { water: number; food: number; medical: number }
  
  // Actions
  setUserRole: (role: UserRole) => void
  toggleLiveUpdates: () => void
  setSelectedFlight: (id: DroneFlightId) => void
  toggleLayer: (layer: keyof LayerState) => void
  setShowNewFlightModal: (v: boolean) => void
  setShowExportModal: (v: boolean) => void
  setShowProcessModal: (v: boolean) => void
  setShowLayerPanel: (v: boolean) => void
  acknowledgeAlert: (id: string) => void
  processImages: () => void
  optimizeRoute: () => void
  updateTrucks: () => void
  updateStats: () => void
  addWaypoint: (wp: WaypointType) => void
  removeWaypoint: (id: string) => void
  reorderWaypoints: (from: number, to: number) => void
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

  layers: {
    tents: true,
    roads: true,
    water: true,
    latrines: true,
    solar: true,
    orthomosaic: false,
    truckRoutes: true,
  },

  trucks: [
    { id: 'T1', name: 'Truck Alpha', lat: 33.52, lng: 36.28, status: 'en-route', cargo: 'Water + Food', eta: '14:45' },
    { id: 'T2', name: 'Truck Bravo', lat: 33.49, lng: 36.33, status: 'delivering', cargo: 'Medical', eta: '15:10' },
    { id: 'T3', name: 'Truck Charlie', lat: 33.54, lng: 36.35, status: 'returning', cargo: 'Empty', eta: '16:00' },
  ],

  waypoints: [
    { id: 'wp-0', label: 'Central Warehouse', lat: 33.50, lng: 36.25, type: 'warehouse' },
    { id: 'wp-1', label: 'Zone A Aid Point', lat: 33.515, lng: 36.30, type: 'aid-point' },
    { id: 'wp-2', label: 'Zone C Water Station', lat: 33.495, lng: 36.32, type: 'aid-point' },
    { id: 'wp-3', label: 'Zone E Medical Post', lat: 33.505, lng: 36.34, type: 'aid-point' },
  ],

  activeAlerts: [
    { id: 'a1', severity: 'critical', zone: 'Zone A', message: 'Overcrowding — 340% capacity', time: '14:12', acknowledged: false },
    { id: 'a2', severity: 'critical', zone: 'Zone C', message: 'Water supply critically low', time: '14:28', acknowledged: false },
    { id: 'a3', severity: 'warning', zone: 'Zone B', message: 'Latrine capacity at 85%', time: '13:55', acknowledged: false },
  ],

  stats: {
    tents: 1247,
    latrines: 89,
    waterPoints: 23,
    totalPop: 8247,
    aidTrucks: 3,
    lastUpdate: '14:32',
  },

  resourceNeeds: { water: 67, food: 45, medical: 12 },

  setUserRole: (role) => set({ userRole: role }),
  toggleLiveUpdates: () => set((s) => ({ liveUpdates: !s.liveUpdates })),
  setSelectedFlight: (id) => set({ selectedFlight: id }),
  toggleLayer: (layer) => set((s) => ({ layers: { ...s.layers, [layer]: !s.layers[layer] } })),
  setShowNewFlightModal: (v) => set({ showNewFlightModal: v }),
  setShowExportModal: (v) => set({ showExportModal: v }),
  setShowProcessModal: (v) => set({ showProcessModal: v }),
  setShowLayerPanel: (v) => set({ showLayerPanel: v }),

  acknowledgeAlert: (id) => set((s) => ({
    activeAlerts: s.activeAlerts.map(a => a.id === id ? { ...a, acknowledged: true } : a)
  })),

  processImages: () => {
    set({ processingImages: true, showProcessModal: true })
    setTimeout(() => {
      set((s) => ({
        processingImages: false,
        stats: {
          ...s.stats,
          tents: s.stats.tents + Math.floor(Math.random() * 10),
          latrines: s.stats.latrines + (Math.random() > 0.7 ? 1 : 0),
        }
      }))
    }, 3500)
  },

  optimizeRoute: () => {
    set({ optimizingRoute: true })
    setTimeout(() => {
      set((s) => {
        const wps = [...s.waypoints]
        const [head, ...rest] = wps
        const shuffled = rest.sort(() => Math.random() - 0.5)
        return { waypoints: [head, ...shuffled], optimizingRoute: false }
      })
    }, 2000)
  },

  updateTrucks: () => set((s) => ({
    trucks: s.trucks.map(t => ({
      ...t,
      lat: t.lat + (Math.random() - 0.5) * 0.002,
      lng: t.lng + (Math.random() - 0.5) * 0.002,
    }))
  })),

  updateStats: () => set((s) => ({
    stats: {
      ...s.stats,
      totalPop: s.stats.totalPop + Math.floor((Math.random() - 0.4) * 20),
      lastUpdate: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    },
    resourceNeeds: {
      water: Math.min(100, Math.max(20, s.resourceNeeds.water + (Math.random() - 0.4) * 3)),
      food: Math.min(100, Math.max(10, s.resourceNeeds.food + (Math.random() - 0.5) * 2)),
      medical: Math.min(100, Math.max(5, s.resourceNeeds.medical + (Math.random() - 0.5) * 1)),
    }
  })),

  addWaypoint: (wp) => set((s) => ({ waypoints: [...s.waypoints, wp] })),
  removeWaypoint: (id) => set((s) => ({ waypoints: s.waypoints.filter(w => w.id !== id) })),
  reorderWaypoints: (from, to) => set((s) => {
    const wps = [...s.waypoints]
    const [item] = wps.splice(from, 1)
    wps.splice(to, 0, item)
    return { waypoints: wps }
  }),
}))
