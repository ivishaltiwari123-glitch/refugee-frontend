import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { useStore } from '../store/dashboardStore'
import { POPULATION_HISTORY, AID_DELIVERY_TIMES, RESOURCE_STOCK } from '../data/fakeData'
import { BarChart2, TrendingUp, Package } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler)

const chartDefaults = {
  plugins: { legend: { display: false }, tooltip: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderColor: 'rgba(30,64,175,0.5)',
    borderWidth: 1,
    titleColor: '#94a3b8',
    bodyColor: '#e2e8f0',
    titleFont: { family: 'JetBrains Mono', size: 10 },
    bodyFont: { family: 'IBM Plex Sans', size: 11 },
    padding: 8,
  }},
  scales: {
    x: { grid: { color: 'rgba(51,65,85,0.3)' }, ticks: { color: '#475569', font: { size: 9, family: 'JetBrains Mono' } } },
    y: { grid: { color: 'rgba(51,65,85,0.3)' }, ticks: { color: '#475569', font: { size: 9, family: 'JetBrains Mono' } } },
  },
  maintainAspectRatio: false,
  animation: { duration: 600 },
}

export const AnalyticsPanel: React.FC = () => {
  const { stats, resourceNeeds } = useStore()

  const popData = {
    labels: POPULATION_HISTORY.map(d => d.day),
    datasets: [{
      label: 'Population',
      data: POPULATION_HISTORY.map(d => d.pop),
      fill: true,
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14,165,233,0.12)',
      tension: 0.4,
      pointBackgroundColor: '#0ea5e9',
      pointRadius: 3,
    }]
  }

  const aidData = {
    labels: AID_DELIVERY_TIMES.map(d => d.route),
    datasets: [{
      label: 'Minutes',
      data: AID_DELIVERY_TIMES.map(d => d.minutes),
      backgroundColor: AID_DELIVERY_TIMES.map(d =>
        d.minutes > 35 ? 'rgba(239,68,68,0.6)' : d.minutes > 25 ? 'rgba(245,158,11,0.6)' : 'rgba(16,185,129,0.6)'
      ),
      borderColor: AID_DELIVERY_TIMES.map(d =>
        d.minutes > 35 ? '#ef4444' : d.minutes > 25 ? '#f59e0b' : '#10b981'
      ),
      borderWidth: 1,
      borderRadius: 4,
    }]
  }

  const stockData = {
    labels: RESOURCE_STOCK.map(d => d.item),
    datasets: [{
      label: 'Stock %',
      data: RESOURCE_STOCK.map(d => d.stock),
      backgroundColor: RESOURCE_STOCK.map(d =>
        d.stock < d.critical ? 'rgba(239,68,68,0.7)' : d.stock < 50 ? 'rgba(245,158,11,0.7)' : 'rgba(14,165,233,0.7)'
      ),
      borderColor: RESOURCE_STOCK.map(d =>
        d.stock < d.critical ? '#ef4444' : d.stock < 50 ? '#f59e0b' : '#0ea5e9'
      ),
      borderWidth: 1,
      borderRadius: 4,
    }]
  }

  return (
    <div className="flex items-stretch gap-3 h-full px-3 py-2">
      {/* KPI Cards */}
      <div className="flex flex-col gap-1.5 shrink-0" style={{ width: '150px' }}>
        {[
          { label: 'Total Population', value: stats.totalPop.toLocaleString(), color: '#0ea5e9', sub: '+82 this week' },
          { label: 'Aid Trucks Active', value: stats.aidTrucks, color: '#10b981', sub: '1 returning' },
          { label: 'Last Update', value: stats.lastUpdate, color: '#f59e0b', sub: 'Auto refresh 10s' },
          { label: 'Water Shortage', value: `${resourceNeeds.water.toFixed(0)}%`, color: resourceNeeds.water > 60 ? '#ef4444' : '#10b981', sub: 'demand vs supply' },
        ].map(kpi => (
          <div key={kpi.label} className="flex-1 rounded-lg px-2.5 py-2 flex flex-col justify-between"
            style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.4)' }}>
            <div className="text-xs text-slate-500 leading-none">{kpi.label}</div>
            <div className="text-base font-mono font-bold leading-none" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs text-slate-600 leading-none">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart 1: Population Trend */}
      <div className="flex-1 rounded-xl p-3 flex flex-col" style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.4)' }}>
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Population Trend</span>
        </div>
        <div className="flex-1 min-h-0">
          <Line data={popData} options={chartDefaults as any} />
        </div>
      </div>

      {/* Chart 2: Aid Delivery Times */}
      <div className="flex-1 rounded-xl p-3 flex flex-col" style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.4)' }}>
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aid Delivery (min)</span>
        </div>
        <div className="flex-1 min-h-0">
          <Bar data={aidData} options={chartDefaults as any} />
        </div>
      </div>

      {/* Chart 3: Resource Stock */}
      <div className="flex-1 rounded-xl p-3 flex flex-col" style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.4)' }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Package className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resource Stock %</span>
        </div>
        <div className="flex-1 min-h-0">
          <Bar data={stockData} options={chartDefaults as any} />
        </div>
      </div>
    </div>
  )
}
