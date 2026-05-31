import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet-routing-machine'
import { useStore } from '../store/dashboardStore'
import { TENT_DATA, WATER_POINTS, LATRINES, SOLAR_PANELS, ROADS } from '../data/fakeData'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// UN Warehouse — fixed source point
const WAREHOUSE = { lat: 33.50, lng: 36.25 }

export const MapView: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<{ [key: string]: L.Layer[] }>({})
  const routingRef = useRef<any>(null)
  const { layers, trucks, waypoints, addWaypoint, userRole, detections } = useStore()

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    const map = L.map(containerRef.current, { center: [33.50, 36.30], zoom: 13, zoomControl: true })

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '©Esri ©NASA ©NGA ©USGS',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    // Click handler — route if Field/Admin, add waypoint otherwise
    map.on('click', (e: L.LeafletMouseEvent) => {
      const role = useStore.getState().userRole
      if (role === 'Viewer') return

      // Draw route from warehouse to clicked point
      if (routingRef.current) {
        map.removeControl(routingRef.current)
        routingRef.current = null
      }

      const dest = e.latlng

      try {
        const routing = (L as any).Routing.control({
          waypoints: [
            L.latLng(WAREHOUSE.lat, WAREHOUSE.lng),
            L.latLng(dest.lat, dest.lng),
          ],
          routeWhileDragging: false,
          show: false,
          addWaypoints: false,
          fitSelectedRoutes: false,
          lineOptions: {
            styles: [{ color: '#eab308', weight: 4, opacity: 0.9 }],
            extendToWaypoints: true,
            missingRouteTolerance: 0,
          },
          createMarker: (i: number, wp: any) => {
            const isSource = i === 0
            const icon = L.divIcon({
              html: `<div style="
                width:${isSource ? 32 : 28}px;height:${isSource ? 32 : 28}px;
                border-radius:50%;
                background:${isSource ? '#1e40af' : '#10b981'};
                border:3px solid white;
                display:flex;align-items:center;justify-content:center;
                font-size:14px;
                box-shadow:0 0 12px ${isSource ? '#3b82f6' : '#10b981'};
              ">${isSource ? '🏭' : '📍'}</div>`,
              className: '',
              iconSize: [isSource ? 32 : 28, isSource ? 32 : 28],
              iconAnchor: [isSource ? 16 : 14, isSource ? 16 : 14],
            })
            const marker = L.marker(wp.latLng, { icon })
            marker.bindPopup(`
              <div style="font-family:'IBM Plex Sans',sans-serif;min-width:160px">
                <div style="font-weight:600;color:${isSource ? '#3b82f6' : '#10b981'};margin-bottom:4px">
                  ${isSource ? '🏭 UN Warehouse' : '📍 Destination'}
                </div>
                <div style="font-size:11px;color:#94a3b8">
                  ${wp.latLng.lat.toFixed(5)}, ${wp.latLng.lng.toFixed(5)}
                </div>
              </div>
            `)
            return marker
          },
        })

        routing.on('routesfound', (e: any) => {
          const route = e.routes[0]
          const dist = (route.summary.totalDistance / 1000).toFixed(1)
          const time = Math.round(route.summary.totalTime / 60)

          // Show route info overlay
          const existing = document.getElementById('route-info')
          if (existing) existing.remove()

          const info = document.createElement('div')
          info.id = 'route-info'
          info.style.cssText = `
            position:absolute;bottom:48px;left:50%;transform:translateX(-50%);
            z-index:1000;padding:8px 16px;border-radius:8px;
            background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);
            font-family:'IBM Plex Sans',sans-serif;font-size:12px;color:#10b981;
            display:flex;gap:16px;align-items:center;pointer-events:none;
          `
          info.innerHTML = `
            <span>🚛 Route planned</span>
            <span>📏 ${dist} km</span>
            <span>⏱ ${time} min</span>
            <span style="color:#94a3b8;font-size:10px">Click map again to reroute</span>
          `
          containerRef.current?.appendChild(info)
        })

        routing.addTo(map)
        routingRef.current = routing
      } catch (err) {
        // Fallback — just draw straight line if routing fails
        const line = L.polyline([
          [WAREHOUSE.lat, WAREHOUSE.lng],
          [dest.lat, dest.lng],
        ], { color: '#10b981', weight: 3, dashArray: '8 4', opacity: 0.8 })
        line.addTo(map)
        if (layerRefs.current.route) layerRefs.current.route.forEach(l => l.remove())
        layerRefs.current.route = [line]

        addWaypoint({ id: `wp-custom-${Date.now()}`, label: 'Custom Point', lat: dest.lat, lng: dest.lng, type: 'aid-point' })
      }
    })

    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Draw all layers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    Object.values(layerRefs.current).flat().forEach(l => l.remove())
    layerRefs.current = {}

    if (layers.tents) {
      if (detections.length > 0) {
        layerRefs.current.tents = detections.map(det => {
          const color = det.confidence > 0.7 ? '#10b981' : det.confidence > 0.5 ? '#f59e0b' : '#ef4444'
          const icon = L.divIcon({
            html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px ${color};"></div>`,
            className: '', iconSize: [12, 12], iconAnchor: [6, 6],
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
                  <span style="color:#94a3b8">Lat</span>
                  <span style="color:#e2e8f0;font-family:monospace">${det.lat.toFixed(5)}</span>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span style="color:#94a3b8">Lng</span>
                  <span style="color:#e2e8f0;font-family:monospace">${det.lng.toFixed(5)}</span>
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
        layerRefs.current.tents = TENT_DATA.map(tent => {
          const size = 0.0003
          const poly = L.polygon([
            [tent.lat - size, tent.lng - size], [tent.lat + size, tent.lng - size],
            [tent.lat + size, tent.lng + size], [tent.lat - size, tent.lng + size],
          ], { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4, weight: 1.5 })
          return poly.addTo(map)
        })
      }
    }

    if (layers.roads) {
      layerRefs.current.roads = ROADS.map(coords => {
        return L.polyline(coords.map(c => [c[0], c[1]] as [number, number]), {
          color: '#eab308', weight: 3, opacity: 0.8, dashArray: '8, 4'
        }).addTo(map)
      })
    }

    if (layers.water) {
      layerRefs.current.water = WATER_POINTS.map(wp => {
        const icon = L.divIcon({
          html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${wp.status === 'critical' ? '#ef4444' : '#0ea5e9'};border:2px solid ${wp.status === 'critical' ? '#fca5a5' : '#7dd3fc'};box-shadow:0 0 8px ${wp.status === 'critical' ? '#ef4444' : '#0ea5e9'};"></div>`,
          className: '', iconSize: [20, 20], iconAnchor: [10, 20],
        })
        return L.marker([wp.lat, wp.lng], { icon }).addTo(map)
      })
    }

    if (layers.latrines) {
      layerRefs.current.latrines = LATRINES.map(lat => {
        const icon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:#f97316;border:2px solid #fed7aa;border-radius:3px;box-shadow:0 0 6px #f97316;transform:rotate(45deg);"></div>`,
          className: '', iconSize: [14, 14], iconAnchor: [7, 7],
        })
        return L.marker([lat.lat, lat.lng], { icon }).addTo(map)
      })
    }

    if (layers.solar) {
      layerRefs.current.solar = SOLAR_PANELS.map(sp => {
        const size = 0.0005
        return L.rectangle([[sp.lat - size/2, sp.lng - size], [sp.lat + size/2, sp.lng + size]], {
          color: '#eab308', fillColor: '#fde047', fillOpacity: 0.5, weight: 2,
        }).addTo(map)
      })
    }

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

    layerRefs.current.waypoints = useStore.getState().waypoints.map(wp => {
      const icon = L.divIcon({
        html: `<div style="padding:4px 8px;background:${wp.type === 'warehouse' ? '#1e40af' : '#7c3aed'};border:1px solid ${wp.type === 'warehouse' ? '#3b82f6' : '#a78bfa'};border-radius:6px;color:white;font-size:10px;white-space:nowrap;font-weight:500;">${wp.type === 'warehouse' ? '🏭' : '📍'} ${wp.label}</div>`,
        className: '', iconAnchor: [0, 10],
      })
      return L.marker([wp.lat, wp.lng], { icon }).addTo(map)
    })

  }, [layers, trucks, detections])

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
          {userRole !== 'Viewer' ? '[ CLICK MAP TO PLAN ROUTE ]' : '[ VIEWER MODE — READ ONLY ]'}
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
