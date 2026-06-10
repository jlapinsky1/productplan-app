import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { OBJECTIVES } from '../../lib/mockData'
import type { Objective, KeyResult, RagStatus } from '../../models'

const RAG_CONFIG: Record<RagStatus, { label: string; bg: string; dot: string; text: string }> = {
  green: { label: 'On Track', bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-700' },
  amber: { label: 'At Risk', bg: 'bg-amber-50', dot: 'bg-amber-400', text: 'text-amber-700' },
  red: { label: 'Off Track', bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-700' },
}

function krProgress(kr: KeyResult): number {
  if (kr.targetValue === 0) return 0
  return Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100))
}

function formatValue(value: number, unit: KeyResult['unit']): string {
  if (unit === 'dollar') return `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
  if (unit === 'percent') return `${value}%`
  return String(value)
}

function avgProgress(obj: Objective): number {
  if (obj.keyResults.length === 0) return 0
  return Math.round(obj.keyResults.reduce((sum, kr) => sum + krProgress(kr), 0) / obj.keyResults.length)
}

function ProgressRing({ percent, color }: { percent: number; color: string }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const dash = (percent / 100) * circ

  return (
    <svg width={44} height={44} className="flex-shrink-0">
      <circle cx={22} cy={22} r={r} fill="none" stroke="#f3f4f6" strokeWidth={4} />
      <circle
        cx={22} cy={22} r={r} fill="none"
        stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
      <text x={22} y={26} textAnchor="middle" fontSize={10} fontWeight="700" fill="#374151">
        {percent}%
      </text>
    </svg>
  )
}

function ObjectiveCard({ obj }: { obj: Objective }) {
  const [expanded, setExpanded] = useState(true)
  const rag = RAG_CONFIG[obj.ragStatus]
  const progress = avgProgress(obj)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <ProgressRing percent={progress} color={obj.color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900">{obj.title}</h3>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${rag.bg} ${rag.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${rag.dot}`} />
              {rag.label}
            </span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{obj.scope}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{obj.description}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>{obj.teamName}</span>
            <span>·</span>
            <span>{obj.keyResults.length} key results</span>
            <span>·</span>
            <span>{obj.linkedBarIds.length} roadmap items</span>
          </div>
        </div>
        {expanded ? <ChevronDown size={16} className="text-gray-400 mt-1 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 mt-1 flex-shrink-0" />}
      </div>

      {/* Key Results */}
      {expanded && (
        <div className="border-t border-gray-100">
          {obj.keyResults.map((kr, i) => {
            const p = krProgress(kr)
            return (
              <div
                key={kr.id}
                className={`px-5 py-3 flex items-center gap-4 ${i < obj.keyResults.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 mb-1.5">{kr.title}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${p}%`, background: obj.color }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatValue(kr.currentValue, kr.unit)} / {formatValue(kr.targetValue, kr.unit)}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{p}%</span>
                  </div>
                </div>
              </div>
            )
          })}
          <div className="px-5 py-2 bg-gray-50 border-t border-gray-100">
            <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add Key Result</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function StrategyBoard() {
  const company = OBJECTIVES.filter(o => o.scope === 'company')
  const team = OBJECTIVES.filter(o => o.scope === 'team')

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Strategy</h1>
          <p className="text-sm text-gray-500">Objectives &amp; Key Results — connect goals to your roadmap</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
          <Plus size={14} /> New Objective
        </button>
      </div>

      <div className="p-6 space-y-8 max-w-4xl">
        {company.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-gray-800" />
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Objectives</h2>
            </div>
            <div className="space-y-3">
              {company.map(obj => <ObjectiveCard key={obj.id} obj={obj} />)}
            </div>
          </section>
        )}

        {team.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Team Objectives</h2>
            </div>
            <div className="space-y-3">
              {team.map(obj => <ObjectiveCard key={obj.id} obj={obj} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
