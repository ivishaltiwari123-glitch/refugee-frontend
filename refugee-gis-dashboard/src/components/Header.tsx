import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Wifi, WifiOff, ChevronDown, Bell } from 'lucide-react'
import { useStore, UserRole } from '../store/dashboardStore'

export const Header: React.FC = () => {
  const { userRole, setUserRole, liveUpdates, toggleLiveUpdates, activeAlerts, stats } = useStore()
  const unacknowledged = activeAlerts.filter(a => !a.acknowledged).length

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/60"
      style={{ background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(20px)', zIndex: 100, position: 'relative' }}>

      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1e40af, #0ea5e9)' }}>
          <Shield className="w-5 h-5 text-white" />
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-white tracking-tight leading-none">
              Refugee Camp GIS Dashboard
            </h1>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded text-slate-400 border border-slate-700" style={{ background: 'rgba(30,41,59,0.8)' }}>
              v2.4.1
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Syria Operational Zone · <span className="text-cyan-400">UNHCR Classified</span>
          </p>
        </div>
      </div>

      {/* Center — KPI pill */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-slate-700/60" style={{ background: 'rgba(30,41,59,0.6)' }}>
          <span className="text-xs text-slate-400">Population</span>
          <span className="text-sm font-mono font-semibold text-white">{stats.totalPop.toLocaleString()}</span>
          <div className="w-px h-4 bg-slate-700" />
          <span className="text-xs text-slate-400">Trucks</span>
          <span className="text-sm font-mono font-semibold text-emerald-400">{stats.aidTrucks}</span>
          <div className="w-px h-4 bg-slate-700" />
          <span className="text-xs text-slate-400">Updated</span>
          <span className="text-sm font-mono text-cyan-400">{stats.lastUpdate}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Alerts bell */}
        <button className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors">
          <Bell className="w-4 h-4 text-slate-400" />
          {unacknowledged > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold"
              style={{ fontSize: '9px' }}
            >
              {unacknowledged}
            </motion.span>
          )}
        </button>

        {/* Live Updates Toggle */}
        <motion.button
          onClick={toggleLiveUpdates}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            liveUpdates
              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
              : 'border-red-500/50 text-red-400 bg-red-500/10'
          }`}
        >
          <div className="relative">
            {liveUpdates ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {liveUpdates && (
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 animate-ping" />
            )}
          </div>
          <span className="hidden sm:block">{liveUpdates ? 'LIVE' : 'PAUSED'}</span>
        </motion.button>

        {/* Role dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-medium text-slate-300 hover:border-blue-500/50 hover:text-white transition-all"
            style={{ background: 'rgba(30,41,59,0.6)' }}>
            <div className={`w-2 h-2 rounded-full ${
              userRole === 'Admin' ? 'bg-blue-400' : userRole === 'Field' ? 'bg-emerald-400' : 'bg-slate-400'
            }`} />
            {userRole}
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
          <div className="absolute right-0 top-full mt-1 rounded-xl border border-slate-700/60 overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50"
            style={{ background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(20px)', minWidth: '120px' }}>
            {(['Admin', 'Field', 'Viewer'] as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => setUserRole(role)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-slate-700/50 transition-colors ${
                  userRole === role ? 'text-white' : 'text-slate-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  role === 'Admin' ? 'bg-blue-400' : role === 'Field' ? 'bg-emerald-400' : 'bg-slate-400'
                }`} />
                {role}
                {userRole === role && <span className="ml-auto text-blue-400">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
