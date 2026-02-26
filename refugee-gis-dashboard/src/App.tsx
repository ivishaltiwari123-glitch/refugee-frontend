import React, { useEffect } from 'react'
import { Header } from './components/Header'
import { MapView } from './components/MapView'
import { LeftSidebar } from './components/LeftSidebar'
import { RightSidebar } from './components/RightSidebar'
import { AnalyticsPanel } from './components/AnalyticsPanel'
import { NewFlightModal, ExportModal, ProcessModal } from './components/Modals'
import { useStore } from './store/dashboardStore'

export default function App() {
  const { liveUpdates, updateTrucks, updateStats } = useStore()

  // Live updates interval
  useEffect(() => {
    if (!liveUpdates) return
    const interval = setInterval(() => {
      updateTrucks()
      updateStats()
    }, 10000)
    return () => clearInterval(interval)
  }, [liveUpdates, updateTrucks, updateStats])

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0f172a' }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <div
          className="hidden lg:flex flex-col border-r border-slate-700/50 shrink-0"
          style={{ width: '240px', background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)' }}
        >
          <LeftSidebar />
        </div>

        {/* Map */}
        <div className="flex-1 min-w-0 relative" style={{ height: '100%' }}>
          <MapView />
        </div>

        {/* Right Sidebar */}
        <div
          className="hidden lg:flex flex-col border-l border-slate-700/50 shrink-0"
          style={{ width: '240px', background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)' }}
        >
          <RightSidebar />
        </div>
      </div>

      {/* Mobile sidebars (stacked below map) */}
      <div className="lg:hidden flex flex-col border-t border-slate-700/50">
        <div style={{ background: 'rgba(15,23,42,0.95)' }}>
          <LeftSidebar />
        </div>
        <div className="border-t border-slate-700/50" style={{ background: 'rgba(15,23,42,0.95)' }}>
          <RightSidebar />
        </div>
      </div>

      {/* Bottom Analytics */}
      <div
        className="border-t border-slate-700/50 shrink-0"
        style={{ height: '160px', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)' }}
      >
        <AnalyticsPanel />
      </div>

      {/* Modals */}
      <NewFlightModal />
      <ExportModal />
      <ProcessModal />
    </div>
  )
}
