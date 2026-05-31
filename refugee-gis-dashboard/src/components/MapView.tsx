import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useStore } from '../store/dashboardStore'
import { TENT_DATA, WATER_POINTS, LATRINES, SOLAR_PANELS, ROADS } from '../data/fakeData'

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
  const { layers, trucks, waypoints, addWaypoint, userRole, detections } = useStore()

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    const map = L.map(containerRef.current, { center: [33.50, 36.30], zoom: 13, zoomControl: true })
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '©Esri ©NASA ©NGA ©USGS',
    maxZoom: 19,
    }).addTo(map)
    mapRef.current = map
    map.on('click', (e: L.LeafletMouseEvent) => {
      const role = useStore.getState().userRole
      if (role === 'Viewer') return
      addWaypoint({ id: `wp-custom-${Date.now()}`, label: `Custom Point`, lat: e.latlng.lat, lng: e.latlng.lng, type: 'aid-point' })
    })
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Draw all layers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    Object.values(layerRefs.current).flat().forEach(l => l.remove())
    layerRefs.current = {}

    // TENTS — real AI detections if available, else fake data
    if (layers.tents) {
      if (detections.length > 0) {
        // Real AI detections from Supabase
        layerRefs.current.tents = detections.map(det => {
          const color = det.confidence > 0.7 ? '#10b981' : det.confidence > 0.5 ? '#f59e0b' : '#ef4444'
          const icon = L.divIcon({
            html: `<div style="
              width:12px;height:12px;border-radius:50%;
              background:${color};
              border:2px solid white;
              box-shadow:0 0 6px ${color};
            "></div>`,
            className: '',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          })
          const marker = L.marker([det.lat, det.lng], { icon })
          marker.bindPopup(`
            <div style="font-family:'IBM Plex Sans',sans-serif;min-width:180px">
              <div style="font-weight:600;font-size:13px;color:${color};margin-bottom:6px">🏕️ AI Detected Shelter</div>
              <div style="font-size:12px;display:flex;flex-direction:column;gap:3px">
                <div style="display:flex;justify-content:space-between">
                  <span style="color:#94a3b8">Confidence</span>
                  <span style="color:${color};font-weight:600">${(det.confidence * 100).toFixed(1)}%</span>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span style="color:#94a3b8">Type</span>
                  <span style="color:#e2e8f0">${det.object_type}</span>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span style="color:#94a3b8">Lat</span>
                  <span style="color:#e2e8f0 font-mono">${det.lat.toFixed(5)}</span>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span style="color:#94a3b8">Lng</span>
                  <span style="color:#e2e8f0;font-mono">${det.lng.toFixed(5)}</span>
                </div>
              </div>
              <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(51,65,85,0.5);font-size:10px;color:#64748b">
                Source: Roboflow AI — Satellite Imagery
              </div>
            </div>
          `)
          return marker.addTo(map)
        })
      } else {
        // Fallback fake tent data
        layerRefs.current.tents = TENT_DATA.map(tent => {
          const size = 0.0003
          const poly = L.polygon([
            [tent.lat - size, tent.lng - size], [tent.lat + size, tent.lng - size],
            [tent.lat + size, tent.lng + size], [tent.lat - size, tent.lng + size],
          ], { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4, weight: 1.5 })
          poly.bindPopup(`<div style="font-family:'IBM Plex Sans',sans-serif"><div style="font-weight:600;color:#e2e8f0">🏕️ Tent #${tent.id}</div></div>`)
          return poly.addTo(map)
        })
      }
    }

    // ROADS
    if (layers.roads) {
      layerRefs.current.roads = ROADS.map(coords => {
        const polyline = L.polyline(coords.map(c => [c[0], c[1]] as [number, number]), { color: '#eab308', weight: 3, opacity: 0.8, dashArray: '8, 4' })
        return polyline.addTo(map)
      })
    }

    // WATER POINTS
    if (layers.water) {
      layerRefs.current.water = WATER_POINTS.map(wp => {
        const icon = L.divIcon({
          html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${wp.status === 'critical' ? '#ef4444' : '#0ea5e9'};border:2px solid ${wp.status === 'critical' ? '#fca5a5' : '#7dd3fc'};box-shadow:0 0 8px ${wp.status === 'critical' ? '#ef4444' : '#0ea5e9'};"></div>`,
          className: '', iconSize: [20, 20], iconAnchor: [10, 20],
        })
        const marker = L.marker([wp.lat, wp.lng], { icon })
        marker.bindPopup(`<div style="font-family:'IBM Plex Sans',sans-serif"><div style="font-weight:600;color:#0ea5e9">💧 Water Point #${wp.id}</div></div>`)
        return marker.addTo(map)
      })
    }

    // LATRINES
    if (layers.latrines) {
      layerRefs.current.latrines = LATRINES.map(lat => {
        const icon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:#f97316;border:2px solid #fed7aa;border-radius:3px;box-shadow:0 0 6px #f97316;transform:rotate(45deg);"></div>`,
          className: '', iconSize: [14, 14], iconAnchor: [7, 7],
        })
        return L.marker([lat.lat, lat.lng], { icon }).addTo(map)
      })
    }

    // SOLAR
    if (layers.solar) {
      layerRefs.current.solar = SOLAR_PANELS.map(sp => {
        const size = 0.0005
        return L.rectangle([[sp.lat - size/2, sp.lng - size], [sp.lat + size/2, sp.lng + size]], {
          color: '#eab308', fillColor: '#fde047', fillOpacity: 0.5, weight: 2,
        }).addTo(map)
      })
    }

    // TRUCKS
    if (layers.truckRoutes) {
      const currentTrucks = useStore.getState().trucks
      layerRefs.current.trucks = currentTrucks.map(truck => {
        const color = truck.status === 'en-route' ? '#10b981' : truck.status === 'delivering' ? '#0ea5e9' : '#94a3b8'
        const icon = L.divIcon({
          html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 12px ${color};">🚛</div>`,
          className: '', iconSize: [28, 28], iconAnchor: [14, 14],
        })
        const marker = L.marker([truck.lat, truck.lng], { icon })
        marker.bindPopup(`<div style="font-family:'IBM Plex Sans',sans-serif"><div style="font-weight:600;color:${color}">${truck.name}</div><div style="font-size:12px;color:#94a3b8">${truck.cargo} · ETA ${truck.eta}</div></div>`)
        return marker.addTo(map)
      })
    }

    // WAYPOINTS
    layerRefs.current.waypoints = useStore.getState().waypoints.map(wp => {
      const icon = L.divIcon({
        html: `<div style="padding:4px 8px;background:${wp.type === 'warehouse' ? '#1e40af' : '#7c3aed'};border:1px solid ${wp.type === 'warehouse' ? '#3b82f6' : '#a78bfa'};border-radius:6px;color:white;font-size:10px;white-space:nowrap;font-weight:500;">${wp.type === 'warehouse' ? '🏭' : '📍'} ${wp.label}</div>`,
        className: '', iconAnchor: [0, 10],
      })
      return L.marker([wp.lat, wp.lng], { icon }).addTo(map)
    })

  }, [layers, trucks, detections])

  // Update truck positions
  useEffect(() => {
    const map = mapRef.current
    if (!map || !layers.truckRoutes) return
    if (layerRefs.current.trucks) layerRefs.current.trucks.forEach(l => l.remove())
    layerRefs.current.trucks = trucks.map(truck => {
      const color = truck.status === 'en-route' ? '#10b981' : truck.status === 'delivering' ? '#0ea5e9' : '#94a3b8'
      const icon = L.divIcon({
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 12px ${color};">🚛</div>`,
        className: '', iconSize: [28, 28], iconAnchor: [14, 14],
      })
      return L.marker([truck.lat, truck.lng], { icon }).addTo(map)
    })
  }, [trucks])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <div className="scan-line pointer-events-none" />
      <div className="absolute top-2 left-2 pointer-events-none z-10">
        <div className="text-xs font-mono text-cyan-500/60 select-none">SYR·33.50N·36.30E</div>
      </div>
      <div className="absolute top-2 right-14 pointer-events-none z-10">
        <div className="text-xs font-mono text-cyan-500/60 select-none">
          {userRole !== 'Viewer' ? '[ CLICK MAP TO ADD WAYPOINT ]' : '[ VIEWER MODE — READ ONLY ]'}
        </div>
      </div>
      {detections.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 rounded-lg px-3 py-2" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)' }}>
          <div className="text-xs font-mono text-emerald-400">🛰️ AI Detections: {detections.length} shelters</div>
        </div>
      )}
    </div>
  )
}
