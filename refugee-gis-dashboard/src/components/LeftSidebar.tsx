import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Layers, Droplets, ChevronDown, Play, FileText, Plus, RefreshCw, Check, Loader, Upload, Satellite } from 'lucide-react'
import { useStore } from '../store/dashboardStore'
import { DRONE_FLIGHTS } from '../data/fakeData'

export const LeftSidebar: React.FC = () => {
  const {
    selectedFlight, setSelectedFlight,
    layers, toggleLayer,
    stats, resourceNeeds,
    userRole,
    processImages, processingImages,
    setShowNewFlightModal,
    setShowExportModal,
    showLayerPanel, setShowLayerPanel,
    uploadingImage, uploadStatus,
    uploadSatelliteImage,
    detections,
  } = useStore()

  const [flightOpen, setFlightOpen] = React.useState(false)
  const [showUploadPanel, setShowUploadPanel] = React.useState(false)
  const [latTop, setLatTop] = React.useState('32.2980')
  const [latBottom, setLatBottom] = React.useState('32.2890')
  const [lngLeft, setLngLeft] = React.useState('36.3150')
  const [lngRight, setLngRight] = React.useState('36.3320')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const layerConfig = [
    { key: 'tents' as const, label: 'Shelters (AI)', color: '#10b981', icon: '🏕️', count: detections.length > 0 ? detections.length : stats.tents },
    { key: 'roads' as const, label: 'Roads (AI)', color: '#eab308', icon: '🛤️' },
    { key: 'water' as const, label: 'Water Points', color: '#0ea5e9', icon: '💧', count: stats.waterPoints },
    { key: 'latrines' as const, label: 'Latrines', color: '#f97316', icon: '🚽', count: stats.latrines },
    { key: 'solar' as const, label: 'Solar Arrays', color: '#fde047', icon: '☀️' },
    { key: 'truckRoutes' as const, label: 'Aid Trucks', color: '#10b981', icon: '🚛', count: stats.aidTrucks },
    { key: 'orthomosaic' as const, label: 'Drone Ortho', color: '#a78bfa', icon: '🛸' },
  ]

  const currentFlight = DRONE_FLIGHTS.find(f => f.id === selectedFlight)!

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadSatelliteImage(
      file,
      parseFloat(latTop),
      parseFloat(latBottom),
      parseFloat(lngLeft),
      parseFloat(lngRight)
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>

      {/* Drone Flights */}
      <div className="p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2 mb-2">
          <Plane className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Drone Flights</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setFlightOpen(!flightOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-700/60 text-xs text-slate-300 hover:border-cyan-500/50 transition-all"
            style={{ background: 'rgba(30,41,59,0.6)' }}
          >
            <span className="text-cyan-400 font-mono font-medium">{currentFlight?.label}</span>
            <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${flightOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {flightOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full mt-1 left-0 right-0 rounded-lg border border-slate-700/60 overflow-hidden z-50"
                style={{ background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(20px)' }}
              >
                {DRONE_FLIGHTS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setSelectedFlight(f.id as any); setFlightOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700/50 transition-colors ${selectedFlight === f.id ? 'text-cyan-400' : 'text-slate-400'}`}
                  >
                    <div className="font-mono font-medium">{f.label.split('—')[0]}</div>
                    <div className="text-slate-500 mt-0.5">{f.label.split('—')[1]} · {f.images} images</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(30,41,59,0.4)' }}>
            <div className="text-xs font-mono font-semibold text-white">{currentFlight?.coverage}%</div>
            <div className="text-xs text-slate-500 mt-0.5">Coverage</div>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(30,41,59,0.4)' }}>
            <div className="text-xs font-mono font-semibold text-white">{currentFlight?.images}</div>
            <div className="text-xs text-slate-500 mt-0.5">Images</div>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(30,41,59,0.4)' }}>
            <div className="text-xs font-mono font-semibold text-emerald-400">✓ Done</div>
            <div className="text-xs text-slate-500 mt-0.5">Status</div>
          </div>
        </div>
      </div>

      {/* AI Satellite Detection Upload */}
      {userRole === 'Admin' && (
        <div className="p-3 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Satellite className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">AI Detection</span>
            </div>
            <button
              onClick={() => setShowUploadPanel(!showUploadPanel)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showUploadPanel ? 'Collapse' : 'Expand'}
            </button>
          </div>

          <AnimatePresence>
            {showUploadPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <div className="text-xs text-slate-500 mb-2">Enter bounding box of your satellite image:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Lat Top', val: latTop, set: setLatTop },
                    { label: 'Lat Bottom', val: latBottom, set: setLatBottom },
                    { label: 'Lng Left', val: lngLeft, set: setLngLeft },
                    { label: 'Lng Right', val: lngRight, set: setLngRight },
                  ].map(field => (
                    <div key={field.label}>
                      <div className="text-xs text-slate-500 mb-0.5">{field.label}</div>
                      <input
                        type="text"
                        value={field.val}
                        onChange={e => field.set(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-700 text-slate-300 font-mono"
                        style={{ background: 'rgba(15,23,42,0.8)' }}
                      />
                    </div>
                  ))}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: uploadingImage ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #065f46, #10b981)', color: '#fff' }}
                >
                  {uploadingImage ? (
                    <><Loader className="w-3.5 h-3.5 animate-spin" /> {uploadStatus}</>
                  ) : (
                    <><Upload className="w-3.5 h-3.5" /> Upload Satellite Image</>
                  )}
                </motion.button>

                {uploadStatus && !uploadingImage && (
                  <div className={`text-xs text-center font-mono ${uploadStatus.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {uploadStatus}
                  </div>
                )}

                {detections.length > 0 && (
                  <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <div className="text-sm font-mono font-bold text-emerald-400">{detections.length}</div>
                    <div className="text-xs text-slate-400">AI Detected Shelters</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* AI Layers */}
      <div className="p-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">AI Layers</span>
          </div>
          <button onClick={() => setShowLayerPanel(!showLayerPanel)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            {showLayerPanel ? 'Collapse' : 'Expand'}
          </button>
        </div>
        <AnimatePresence>
          {showLayerPanel && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1 overflow-hidden">
              {layerConfig.map(layer => (
                <button key={layer.key} onClick={() => toggleLayer(layer.key)} className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-700/30 transition-all">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm border transition-all ${layers[layer.key] ? 'border-transparent' : 'border-slate-600 bg-transparent'}`} style={{ background: layers[layer.key] ? layer.color : undefined }}>
                      {layers[layer.key] && <Check className="w-3 h-3 text-white" style={{ strokeWidth: 3 }} />}
                    </div>
                    <span className="text-xs">{layer.icon}</span>
                    <span className={`text-xs ${layers[layer.key] ? 'text-slate-300' : 'text-slate-500'}`}>{layer.label}</span>
                  </div>
                  {layer.count !== undefined && (
                    <span className="text-xs font-mono font-semibold" style={{ color: layer.color }}>{layer.count.toLocaleString()}</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resource Needs */}
      <div className="p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Resource Needs</span>
        </div>
        <div className="space-y-2.5">
          {[
            { label: 'Water', value: resourceNeeds.water, color: '#0ea5e9', icon: '💧' },
            { label: 'Food', value: resourceNeeds.food, color: '#10b981', icon: '🌾' },
            { label: 'Medical', value: resourceNeeds.medical, color: '#f97316', icon: '💊' },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">{item.icon} {item.label}</span>
                <span className="text-xs font-mono font-semibold" style={{ color: item.value > 60 ? '#ef4444' : item.value > 40 ? '#f59e0b' : '#10b981' }}>
                  {item.value.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,41,59,0.8)' }}>
                <motion.div className="h-full rounded-full" style={{ background: item.color }} initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 space-y-2 mt-auto">
        {(userRole === 'Admin' || userRole === 'Field') && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowNewFlightModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #1e40af, #0ea5e9)' }}>
            <Plus className="w-3.5 h-3.5" /> New Flight
          </motion.button>
        )}
        <motion.button whileTap={{ scale: 0.97 }} onClick={processImages} disabled={processingImages}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all border border-slate-700/60 hover:border-blue-500/50"
          style={{ background: 'rgba(30,41,59,0.6)', color: processingImages ? '#94a3b8' : '#e2e8f0' }}>
          {processingImages ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Processing…</> : <><RefreshCw className="w-3.5 h-3.5" /> Process Images</>}
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowExportModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all border border-slate-700/60 hover:border-slate-500"
          style={{ background: 'rgba(30,41,59,0.6)', color: '#e2e8f0' }}>
          <FileText className="w-3.5 h-3.5" /> Export PDF
        </motion.button>
        {userRole === 'Field' && (
          <motion.button whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-700/40 hover:border-emerald-500/60"
            style={{ background: 'rgba(16,185,129,0.1)' }}>
            <Play className="w-3.5 h-3.5" /> Start Route
          </motion.button>
        )}
      </div>
    </div>
  )
}
