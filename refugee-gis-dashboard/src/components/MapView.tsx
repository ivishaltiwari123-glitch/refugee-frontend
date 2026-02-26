import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useStore } from '../store/dashboardStore'
import { TENT_DATA, WATER_POINTS, LATRINES, SOLAR_PANELS, ROADS } from '../data/fakeData'

// Fix default icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export const MapView: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<{ [key: string]: L.Layer[] }>({})
  const { layers, trucks, waypoints, addWaypoint, userRole } = useStore()

  // Init map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [33.50, 36.30],
      zoom: 13,
      zoomControl: true,
    })

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap ©CartoDB',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    mapRef.current = map

    // Click to add waypoint in Field/Admin mode
    map.on('click', (e: L.LeafletMouseEvent) => {
      const role = useStore.getState().userRole
      if (role === 'Viewer') return
      const id = `wp-custom-${Date.now()}`
      addWaypoint({
        id,
        label: `Custom Point ${id.slice(-4)}`,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        type: 'aid-point'
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Draw AI layers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear existing layers
    Object.values(layerRefs.current).flat().forEach(l => l.remove())
    layerRefs.current = {}

    // --- TENTS ---
    if (layers.tents) {
      layerRefs.current.tents = TENT_DATA.map(tent => {
        const size = 0.0003
        const poly = L.polygon([
          [tent.lat - size, tent.lng - size],
          [tent.lat + size, tent.lng - size],
          [tent.lat + size, tent.lng + size],
          [tent.lat - size, tent.lng + size],
        ], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.4,
          weight: 1.5,
        })
        poly.bindPopup(`
          <div style="font-family:'IBM Plex Sans',sans-serif;min-width:200px">
            <div style="font-weight:600;font-size:14px;color:#e2e8f0;margin-bottom:8px">
              🏕️ Tent #${tent.id}
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:12px">
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">Zone</span>
                <span style="color:#e2e8f0;font-weight:500">Zone ${tent.zone}</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">Family Size</span>
                <span style="color:#e2e8f0;font-weight:500">${tent.family} persons</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">Needs</span>
                <span style="color:${tent.needs === 'None' ? '#10b981' : '#f59e0b'};font-weight:500">${tent.needs}</span>
              </div>
            </div>
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(51,65,85,0.5);font-size:11px;color:#64748b">
              AI Confidence: ${(85 + Math.random() * 14).toFixed(1)}%
            </div>
          </div>
        `)
        return poly.addTo(map)
      })
    }

    // --- ROADS ---
    if (layers.roads) {
      layerRefs.current.roads = ROADS.map(coords => {
        const polyline = L.polyline(coords.map(c => [c[0], c[1]] as [number, number]), {
          color: '#eab308',
          weight: 3,
          opacity: 0.8,
          dashArray: '8, 4',
        })
        polyline.bindPopup(`
          <div style="font-family:'IBM Plex Sans',sans-serif">
            <div style="font-weight:600;color:#e2e8f0">🛤️ Aid Road</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:4px">Passable — Last surveyed today</div>
          </div>
        `)
        return polyline.addTo(map)
      })
    }

    // --- WATER POINTS ---
    if (layers.water) {
      layerRefs.current.water = WATER_POINTS.map(wp => {
        const icon = L.divIcon({
          html: `<div style="
            width:20px;height:20px;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            background:${wp.status === 'critical' ? '#ef4444' : wp.status === 'warning' ? '#f59e0b' : '#0ea5e9'};
            border:2px solid ${wp.status === 'critical' ? '#fca5a5' : wp.status === 'warning' ? '#fde68a' : '#7dd3fc'};
            box-shadow:0 0 8px ${wp.status === 'critical' ? '#ef4444' : '#0ea5e9'};
          "></div>`,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 20],
        })
        const marker = L.marker([wp.lat, wp.lng], { icon })
        marker.bindPopup(`
          <div style="font-family:'IBM Plex Sans',sans-serif;min-width:180px">
            <div style="font-weight:600;font-size:14px;color:#0ea5e9;margin-bottom:8px">💧 Water Point #${wp.id}</div>
            <div style="font-size:12px;display:flex;flex-direction:column;gap:4px">
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">Status</span>
                <span style="color:${wp.status === 'critical' ? '#ef4444' : wp.status === 'warning' ? '#f59e0b' : '#10b981'};font-weight:600">${wp.status.toUpperCase()}</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">Daily usage</span>
                <span style="color:#e2e8f0">${wp.dailyUsage.toLocaleString()}L</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">Capacity</span>
                <span style="color:#e2e8f0">${wp.capacity.toLocaleString()}L</span>
              </div>
              <div style="margin-top:4px;background:#1e293b;border-radius:4px;overflow:hidden;height:6px">
                <div style="height:100%;width:${(wp.dailyUsage/wp.capacity*100).toFixed(0)}%;background:${wp.status === 'critical' ? '#ef4444' : '#0ea5e9'}"></div>
              </div>
            </div>
          </div>
        `)
        return marker.addTo(map)
      })
    }

    // --- LATRINES ---
    if (layers.latrines) {
      layerRefs.current.latrines = LATRINES.map(lat => {
        const icon = L.divIcon({
          html: `<div style="
            width:14px;height:14px;
            background:#f97316;
            border:2px solid #fed7aa;
            border-radius:3px;
            box-shadow:0 0 6px #f97316;
            transform:rotate(45deg);
          "></div>`,
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })
        const marker = L.marker([lat.lat, lat.lng], { icon })
        marker.bindPopup(`
          <div style="font-family:'IBM Plex Sans',sans-serif">
            <div style="font-weight:600;color:#f97316;margin-bottom:6px">🚽 Latrine Block #${lat.id}</div>
            <div style="font-size:12px;display:flex;flex-direction:column;gap:3px">
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">Capacity</span>
                <span style="color:${lat.capacity > 80 ? '#ef4444' : '#10b981'};font-weight:500">${lat.capacity}%</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">Daily users</span>
                <span style="color:#e2e8f0">${lat.users}</span>
              </div>
            </div>
          </div>
        `)
        return marker.addTo(map)
      })
    }

    // --- SOLAR ---
    if (layers.solar) {
      layerRefs.current.solar = SOLAR_PANELS.map(sp => {
        const size = 0.0005
        const rect = L.rectangle([
          [sp.lat - size/2, sp.lng - size],
          [sp.lat + size/2, sp.lng + size],
        ], {
          color: '#eab308',
          fillColor: '#fde047',
          fillOpacity: 0.5,
          weight: 2,
        })
        rect.bindPopup(`
          <div style="font-family:'IBM Plex Sans',sans-serif">
            <div style="font-weight:600;color:#eab308;margin-bottom:6px">☀️ Solar Array #${sp.id}</div>
            <div style="font-size:12px;display:flex;flex-direction:column;gap:3px">
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">Output</span>
                <span style="color:#e2e8f0">${sp.watts}W</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">Status</span>
                <span style="color:${sp.status === 'active' ? '#10b981' : '#f59e0b'};font-weight:500">${sp.status}</span>
              </div>
            </div>
          </div>
        `)
        return rect.addTo(map)
      })
    }

    // --- TRUCKS ---
    if (layers.truckRoutes) {
      const currentTrucks = useStore.getState().trucks
      layerRefs.current.trucks = currentTrucks.map(truck => {
        const color = truck.status === 'en-route' ? '#10b981' : truck.status === 'delivering' ? '#0ea5e9' : '#94a3b8'
        const icon = L.divIcon({
          html: `<div style="
            width:28px;height:28px;border-radius:50%;
            background:${color};
            border:3px solid white;
            display:flex;align-items:center;justify-content:center;
            font-size:14px;
            box-shadow:0 0 12px ${color};
            font-family:sans-serif;
          ">🚛</div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })
        const marker = L.marker([truck.lat, truck.lng], { icon })
        marker.bindPopup(`
          <div style="font-family:'IBM Plex Sans',sans-serif">
            <div style="font-weight:600;color:${color};margin-bottom:6px">${truck.name}</div>
            <div style="font-size:12px;display:flex;flex-direction:column;gap:3px">
              <div style="display:flex;justify-content:space-between;gap:16px">
                <span style="color:#94a3b8">Status</span>
                <span style="color:${color};font-weight:500">${truck.status}</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">Cargo</span>
                <span style="color:#e2e8f0">${truck.cargo}</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8">ETA</span>
                <span style="color:#e2e8f0">${truck.eta}</span>
              </div>
            </div>
          </div>
        `)
        return marker.addTo(map)
      })
    }

    // --- WAYPOINTS ---
    layerRefs.current.waypoints = useStore.getState().waypoints.map(wp => {
      const icon = L.divIcon({
        html: `<div style="
          padding:4px 8px;
          background:${wp.type === 'warehouse' ? '#1e40af' : '#7c3aed'};
          border:1px solid ${wp.type === 'warehouse' ? '#3b82f6' : '#a78bfa'};
          border-radius:6px;
          color:white;
          font-size:10px;
          font-family:'IBM Plex Sans',sans-serif;
          white-space:nowrap;
          font-weight:500;
        ">${wp.type === 'warehouse' ? '🏭' : '📍'} ${wp.label.split(' ')[0]} ${wp.label.split(' ')[1] || ''}</div>`,
        className: '',
        iconAnchor: [0, 10],
      })
      return L.marker([wp.lat, wp.lng], { icon }).addTo(map)
    })

  }, [layers, trucks])

  // Update trucks position
  useEffect(() => {
    const map = mapRef.current
    if (!map || !layers.truckRoutes) return

    // Re-render truck markers on trucks change
    if (layerRefs.current.trucks) {
      layerRefs.current.trucks.forEach(l => l.remove())
    }
    layerRefs.current.trucks = trucks.map(truck => {
      const color = truck.status === 'en-route' ? '#10b981' : truck.status === 'delivering' ? '#0ea5e9' : '#94a3b8'
      const icon = L.divIcon({
        html: `<div style="
          width:28px;height:28px;border-radius:50%;
          background:${color};
          border:3px solid white;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;
          box-shadow:0 0 12px ${color};
        ">🚛</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })
      return L.marker([truck.lat, truck.lng], { icon }).addTo(map)
    })
  }, [trucks])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {/* Scan line overlay */}
      <div className="scan-line pointer-events-none" />
      {/* Corner decoration */}
      <div className="absolute top-2 left-2 pointer-events-none z-10">
        <div className="text-xs font-mono text-cyan-500/60 select-none">
          SYR·33.50N·36.30E
        </div>
      </div>
      <div className="absolute top-2 right-14 pointer-events-none z-10">
        <div className="text-xs font-mono text-cyan-500/60 select-none">
          {userRole !== 'Viewer' ? '[ CLICK MAP TO ADD WAYPOINT ]' : '[ VIEWER MODE — READ ONLY ]'}
        </div>
      </div>
    </div>
  )
}
