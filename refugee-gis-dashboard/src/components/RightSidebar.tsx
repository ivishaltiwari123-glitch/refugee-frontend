import React from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Navigation, AlertTriangle, Truck, X, GripVertical, Loader, MapPin } from 'lucide-react'
import { useStore } from '../store/dashboardStore'

export const RightSidebar: React.FC = () => {
  const {
    trucks, waypoints, reorderWaypoints, removeWaypoint,
    activeAlerts, acknowledgeAlert,
    optimizingRoute, optimizeRoute,
    userRole,
  } = useStore()

  const statusColor = (s: string) =>
    s === 'en-route' ? '#10b981' : s === 'delivering' ? '#0ea5e9' : '#94a3b8'

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      {/* Route Planner */}
      <div className="p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2 mb-2">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Route Planner</span>
          {userRole !== 'Viewer' && (
            <span className="ml-auto text-xs text-slate-500">Click map to add</span>
          )}
        </div>

        {/* Waypoints list — draggable */}
        <div className="space-y-1 mb-2">
          {waypoints.map((wp, i) => (
            <motion.div
              key={wp.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg group"
              style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.4)' }}
            >
              <GripVertical className="w-3 h-3 text-slate-600 cursor-grab" />
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: wp.type === 'warehouse' ? '#1e40af' : '#7c3aed',
                  color: 'white',
                  fontSize: '9px',
                }}
              >
                {wp.type === 'warehouse' ? '🏭' : i}
              </div>
              <span className="text-xs text-slate-300 flex-1 truncate">{wp.label}</span>
              {userRole !== 'Viewer' && wp.type !== 'warehouse' && (
                <button
                  onClick={() => removeWaypoint(wp.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Route stats */}
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(30,41,59,0.4)' }}>
            <div className="text-xs font-mono font-semibold text-emerald-400">{waypoints.length - 1}</div>
            <div className="text-xs text-slate-500">Stops</div>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(30,41,59,0.4)' }}>
            <div className="text-xs font-mono font-semibold text-white">~47km</div>
            <div className="text-xs text-slate-500">Distance</div>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(30,41,59,0.4)' }}>
            <div className="text-xs font-mono font-semibold text-white">2.5h</div>
            <div className="text-xs text-slate-500">Est. Time</div>
          </div>
        </div>

        {(userRole === 'Admin' || userRole === 'Field') && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={optimizeRoute}
            disabled={optimizingRoute}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-700/50 hover:border-emerald-500/70 transition-all"
            style={{ background: 'rgba(16,185,129,0.1)' }}
          >
            {optimizingRoute ? (
              <><Loader className="w-3.5 h-3.5 animate-spin" /> Optimizing…</>
            ) : (
              <><Navigation className="w-3.5 h-3.5" /> Optimize Route</>
            )}
          </motion.button>
        )}
      </div>

      {/* Live Truck GPS */}
      <div className="p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Trucks</span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono">GPS</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {trucks.map(truck => (
            <motion.div
              key={truck.id}
              layout
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
              style={{ background: 'rgba(30,41,59,0.4)', border: `1px solid ${statusColor(truck.status)}22` }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0 truck-dot"
                style={{ background: statusColor(truck.status), boxShadow: `0 0 6px ${statusColor(truck.status)}` }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-200 truncate">{truck.name}</div>
                <div className="text-xs text-slate-500">{truck.cargo}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-medium" style={{ color: statusColor(truck.status) }}>
                  ETA {truck.eta}
                </div>
                <div className="text-xs text-slate-500 capitalize">{truck.status}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="p-3 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Active Alerts</span>
          <span className="ml-auto px-1.5 py-0.5 rounded-full text-xs font-mono font-bold text-white bg-red-500">
            {activeAlerts.filter(a => !a.acknowledged).length}
          </span>
        </div>
        <div className="space-y-1.5">
          <AnimatePresence>
            {activeAlerts.map(alert => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: alert.acknowledged ? 0.4 : 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg p-2.5 border"
                style={{
                  background: alert.acknowledged
                    ? 'rgba(30,41,59,0.3)'
                    : alert.severity === 'critical'
                    ? 'rgba(239,68,68,0.08)'
                    : 'rgba(245,158,11,0.08)',
                  borderColor: alert.acknowledged
                    ? 'rgba(51,65,85,0.3)'
                    : alert.severity === 'critical'
                    ? 'rgba(239,68,68,0.35)'
                    : 'rgba(245,158,11,0.35)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="text-xs font-bold"
                        style={{ color: alert.acknowledged ? '#64748b' : alert.severity === 'critical' ? '#ef4444' : '#f59e0b' }}
                      >
                        {!alert.acknowledged && <span className="alert-pulse inline-block">⚠ </span>}
                        {alert.zone}
                      </span>
                      <span className="text-xs text-slate-600 font-mono">{alert.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{alert.message}</p>
                  </div>
                  {!alert.acknowledged && userRole !== 'Viewer' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="shrink-0 text-xs text-slate-600 hover:text-slate-300 transition-colors mt-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {alert.acknowledged && (
                    <span className="shrink-0 text-xs text-slate-600">✓</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {activeAlerts.every(a => a.acknowledged) && (
            <div className="text-center py-4 text-xs text-slate-600">All alerts acknowledged ✓</div>
          )}
        </div>
      </div>
    </div>
  )
}
