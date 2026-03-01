import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './components/Header'
import { MapView } from './components/MapView'
import { LeftSidebar } from './components/LeftSidebar'
import { RightSidebar } from './components/RightSidebar'
import { AnalyticsPanel } from './components/AnalyticsPanel'
import { NewFlightModal, ExportModal, ProcessModal } from './components/Modals'
import { useStore } from './store/dashboardStore'

export default function App() {
  const { liveUpdates, updateTrucks, updateStats, loadDashboardData, dataLoading, apiConnected } = useStore()

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (!liveUpdates) return
    const interval = setInterval(() => {
      updateTrucks()
      updateStats()
    }, 10000)
    return () => clearInterval(interval)
  }, [liveUpdates])

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0f172a' }}>
      <AnimatePresence>
        {!dataLoading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-1 text-xs font-mono"
            style={{
              background: apiConnected ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              borderBottom: `1px solid ${apiConnected ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
              color: apiConnected ? '#10b981' : '#f59e0b',
            }}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {apiConnected ? 'Connected to FastAPI backend — live UNHCR + OCHA data' : 'Backend offline — showing fallback demo data'}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dataLoading && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4"
            style={{ background: '#0f172a' }}>
            <div className="text-white font-semibold text-lg">Refugee Camp GIS Dashboard</div>
            <div className="text-slate-400 text-sm">Loading UNHCR data from Supabase…</div>
          </motion.div>
        )}
      </AnimatePresence>
      <Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="hidden lg:flex flex-col border-r border-slate-700/50 shrink-0"
          style={{ width: '240px', background: 'rgba(15,23,42,0.9)' }}>
          <LeftSidebar />
        </div>
        <div className="flex-1 min-w-0 relative"><MapView /></div>
        <div className="hidden lg:flex flex-col border-l border-slate-700/50 shrink-0"
          style={{ width: '240px', background: 'rgba(15,23,42,0.9)' }}>
          <RightSidebar />
        </div>
      </div>
      <div className="border-t border-slate-700/50 shrink-0"
        style={{ height: '160px', background: 'rgba(15,23,42,0.95)' }}>
        <AnalyticsPanel />
      </div>
      <NewFlightModal />
      <ExportModal />
      <ProcessModal />
    </div>
  )
}
