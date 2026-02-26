import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plane, FileText, Loader, Check } from 'lucide-react'
import { useStore } from '../store/dashboardStore'

const Backdrop: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
)

const ModalCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-slate-700/60 ${className}`}
    style={{ background: 'rgba(15,23,42,0.98)', backdropFilter: 'blur(20px)', minWidth: '360px' }}>
    {children}
  </div>
)

// New Flight Modal
export const NewFlightModal: React.FC = () => {
  const { showNewFlightModal, setShowNewFlightModal } = useStore()
  const [step, setStep] = useState(1)
  const [flightName, setFlightName] = useState('Flight #48')
  const [area, setArea] = useState('North Zone')
  const [altitude, setAltitude] = useState('120')
  const [launching, setLaunching] = useState(false)
  const [launched, setLaunched] = useState(false)

  const launch = () => {
    setLaunching(true)
    setTimeout(() => {
      setLaunching(false)
      setLaunched(true)
      setTimeout(() => {
        setShowNewFlightModal(false)
        setLaunched(false)
        setStep(1)
      }, 1500)
    }, 2000)
  }

  return (
    <AnimatePresence>
      {showNewFlightModal && (
        <Backdrop onClose={() => setShowNewFlightModal(false)}>
          <ModalCard>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.2)' }}>
                  <Plane className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">New Drone Flight</h2>
                  <p className="text-xs text-slate-500">Step {step} of 2</p>
                </div>
              </div>
              <button onClick={() => setShowNewFlightModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Flight Name</label>
                    <input
                      value={flightName}
                      onChange={e => setFlightName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white border border-slate-700 focus:border-cyan-500 outline-none transition-colors font-mono"
                      style={{ background: 'rgba(30,41,59,0.6)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Survey Area</label>
                    <select
                      value={area}
                      onChange={e => setArea(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white border border-slate-700 focus:border-cyan-500 outline-none transition-colors"
                      style={{ background: 'rgba(30,41,59,0.6)' }}
                    >
                      {['North Zone', 'South Zone', 'East + Central', 'West Zone', 'Full Camp'].map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Altitude: {altitude}m AGL</label>
                    <input
                      type="range" min="80" max="200" value={altitude}
                      onChange={e => setAltitude(e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-600 mt-1">
                      <span>80m</span><span>200m</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="rounded-xl p-4 border border-slate-700/50" style={{ background: 'rgba(30,41,59,0.4)' }}>
                    <div className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Flight Summary</div>
                    {[
                      ['Flight', flightName],
                      ['Area', area],
                      ['Altitude', `${altitude}m AGL`],
                      ['Est. Duration', '~45 min'],
                      ['Est. Images', '~650 photos'],
                      ['Coverage', `~${Math.floor(70 + Math.random() * 25)}%`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1.5 border-b border-slate-700/30 last:border-0">
                        <span className="text-xs text-slate-500">{k}</span>
                        <span className="text-xs font-mono text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-700/40" style={{ background: 'rgba(245,158,11,0.05)' }}>
                    <span className="text-amber-400 text-xs mt-0.5">⚠</span>
                    <p className="text-xs text-amber-300/80">Ensure airspace clearance before launch. Verify drone battery ≥ 85%.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-700/50 flex gap-2">
              {step === 1 ? (
                <>
                  <button onClick={() => setShowNewFlightModal(false)}
                    className="flex-1 py-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:border-slate-500 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => setStep(2)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #1e40af, #0ea5e9)' }}>
                    Next →
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setStep(1)}
                    className="flex-1 py-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:border-slate-500 transition-colors">
                    ← Back
                  </button>
                  <motion.button
                    onClick={launch}
                    disabled={launching || launched}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-2"
                    style={{ background: launched ? '#10b981' : 'linear-gradient(135deg, #1e40af, #0ea5e9)' }}
                  >
                    {launched ? <><Check className="w-3.5 h-3.5" /> Launched!</> :
                     launching ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Launching…</> :
                     '🚁 Launch Flight'}
                  </motion.button>
                </>
              )}
            </div>
          </ModalCard>
        </Backdrop>
      )}
    </AnimatePresence>
  )
}

// Export Modal
export const ExportModal: React.FC = () => {
  const { showExportModal, setShowExportModal, stats } = useStore()
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(0)

  const doExport = () => {
    setExporting(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setExporting(false)
          setDone(true)
          return 100
        }
        return p + Math.random() * 15
      })
    }, 200)
  }

  return (
    <AnimatePresence>
      {showExportModal && (
        <Backdrop onClose={() => { setShowExportModal(false); setDone(false); setProgress(0) }}>
          <ModalCard>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(30,64,175,0.2)' }}>
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Export Report</h2>
              </div>
              <button onClick={() => { setShowExportModal(false); setDone(false); setProgress(0) }} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="space-y-2">
                {[
                  { label: 'Camp Overview', checked: true },
                  { label: 'AI Detection Statistics', checked: true },
                  { label: 'Resource Needs Analysis', checked: true },
                  { label: 'Route Optimization Report', checked: false },
                  { label: 'Population Trends', checked: true },
                  { label: 'Alert History', checked: false },
                ].map(item => (
                  <label key={item.label} className="flex items-center gap-3 py-1.5 cursor-pointer group">
                    <input type="checkbox" defaultChecked={item.checked}
                      className="w-3.5 h-3.5 rounded border-slate-600 accent-blue-500" />
                    <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                  </label>
                ))}
              </div>

              {(exporting || done) && (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>{done ? 'Export complete' : 'Generating PDF…'}</span>
                    <span className="font-mono">{Math.min(100, progress).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,41,59,0.8)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: done ? '#10b981' : 'linear-gradient(90deg, #1e40af, #0ea5e9)' }}
                      animate={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  {done && (
                    <p className="text-xs text-emerald-400 mt-2">
                      ✓ camp-report-{new Date().toISOString().slice(0,10)}.pdf ready
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-700/50 flex gap-2">
              <button onClick={() => { setShowExportModal(false); setDone(false); setProgress(0) }}
                className="flex-1 py-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:border-slate-500 transition-colors">
                Close
              </button>
              <motion.button
                onClick={done ? undefined : doExport}
                disabled={exporting}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: done ? '#10b981' : 'linear-gradient(135deg, #1e40af, #0ea5e9)' }}
              >
                {done ? <><Check className="w-3.5 h-3.5" /> Download</> :
                 exporting ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Generating…</> :
                 'Export PDF'}
              </motion.button>
            </div>
          </ModalCard>
        </Backdrop>
      )}
    </AnimatePresence>
  )
}

// Process Images Modal
export const ProcessModal: React.FC = () => {
  const { showProcessModal, setShowProcessModal, processingImages, stats } = useStore()
  const steps = ['Loading orthomosaic', 'Running object detection', 'Classifying structures', 'Updating database']
  const [currentStep, setCurrentStep] = React.useState(0)

  React.useEffect(() => {
    if (!showProcessModal || !processingImages) return
    setCurrentStep(0)
    const timers = steps.map((_, i) =>
      setTimeout(() => setCurrentStep(i + 1), (i + 1) * 800)
    )
    return () => timers.forEach(clearTimeout)
  }, [showProcessModal, processingImages])

  return (
    <AnimatePresence>
      {showProcessModal && (
        <Backdrop onClose={() => !processingImages && setShowProcessModal(false)}>
          <ModalCard>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
              <h2 className="text-sm font-semibold text-white">AI Image Processing</h2>
              {!processingImages && (
                <button onClick={() => setShowProcessModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="px-6 py-5">
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      i < currentStep ? 'bg-emerald-500' : i === currentStep && processingImages ? 'border-2 border-cyan-400' : 'border border-slate-700'
                    }`}>
                      {i < currentStep ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : i === currentStep && processingImages ? (
                        <Loader className="w-3 h-3 text-cyan-400 animate-spin" />
                      ) : (
                        <span className="text-xs text-slate-600">{i + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs ${i <= currentStep ? 'text-slate-300' : 'text-slate-600'}`}>{step}</span>
                    {i < currentStep && <span className="ml-auto text-xs text-emerald-400 font-mono">Done</span>}
                  </div>
                ))}
              </div>

              {!processingImages && currentStep >= steps.length && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-4 rounded-xl border border-emerald-700/40"
                  style={{ background: 'rgba(16,185,129,0.08)' }}
                >
                  <div className="text-sm font-semibold text-emerald-400 mb-2">✓ Processing Complete</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Tents', value: stats.tents },
                      { label: 'Latrines', value: stats.latrines },
                      { label: 'Water Pts', value: stats.waterPoints },
                    ].map(item => (
                      <div key={item.label} className="text-center">
                        <div className="text-sm font-mono font-bold text-white">{item.value.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {!processingImages && (
              <div className="px-6 pb-5">
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="w-full py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #0ea5e9)' }}
                >
                  Close
                </button>
              </div>
            )}
          </ModalCard>
        </Backdrop>
      )}
    </AnimatePresence>
  )
}
