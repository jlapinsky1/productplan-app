import { useState, useRef, useEffect } from 'react'
import { Plus, ChevronDown, ChevronRight, AlertTriangle, Users, Calendar, Link, Unlink } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useObjectives, useInitiatives } from '../../lib/hooks'
import { updateInitiativeObjective } from '../../lib/api'
import type { Objective, KeyResult, RagStatus, Initiative, InitiativePriority } from '../../models'

const RAG_CONFIG: Record<RagStatus, { label: string; bg: string; dot: string; text: string }> = {
  green: { label: 'On Track', bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-700' },
  amber: { label: 'At Risk', bg: 'bg-amber-50', dot: 'bg-amber-400', text: 'text-amber-700' },
  red: { label: 'Off Track', bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-700' },
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-600' },
  active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700' },
  at_risk: { label: 'At Risk', bg: 'bg-amber-50', text: 'text-amber-700' },
  paused: { label: 'Paused', bg: 'bg-gray-100', text: 'text-gray-500' },
  complete: { label: 'Complete', bg: 'bg-green-50', text: 'text-green-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-600' },
}

const PRIORITY_CONFIG: Record<InitiativePriority, { label: string; bg: string; text: string }> = {
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700' },
  high: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700' },
  medium: { label: 'Medium', bg: 'bg-blue-50', text: 'text-blue-600' },
  low: { label: 'Low', bg: 'bg-gray-100', text: 'text-gray-500' },
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

function initiativeProgress(init: Initiative): number {
  if (!init.targetValue || init.targetValue === 0) return 0
  return Math.min(100, Math.round((init.currentValue / init.targetValue) * 100))
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

function LinkObjectiveDropdown({ initiative, objectives }: { initiative: Initiative; objectives: Objective[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLink = async (objectiveId: string | null) => {
    setOpen(false)
    await updateInitiativeObjective(initiative.id, objectiveId)
    qc.invalidateQueries({ queryKey: ['initiatives'] })
  }

  if (initiative.objectiveId) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); handleLink(null) }}
        className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-500 transition-colors"
        title="Unlink from objective"
      >
        <Unlink size={10} />
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
      >
        <Link size={10} /> Link to Objective
      </button>
      {open && (
        <div className="absolute top-5 left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px]">
          {objectives.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">No objectives available</div>
          )}
          {objectives.map(obj => (
            <button
              key={obj.id}
              onClick={() => handleLink(obj.id)}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              {obj.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function InitiativeCard({ initiative, objectives }: { initiative: Initiative; objectives: Objective[] }) {
  const progress = initiativeProgress(initiative)
  const statusCfg = STATUS_CONFIG[initiative.status] ?? STATUS_CONFIG.draft
  const priorityCfg = PRIORITY_CONFIG[initiative.priority] ?? PRIORITY_CONFIG.medium

  return (
    <div className="px-5 py-3 flex items-start gap-3 border-b border-gray-50 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-semibold text-gray-800">{initiative.title}</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
            {statusCfg.label}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priorityCfg.bg} ${priorityCfg.text}`}>
            {priorityCfg.label}
          </span>
          <LinkObjectiveDropdown initiative={initiative} objectives={objectives} />
        </div>

        {initiative.businessGoal && (
          <p className="text-xs text-gray-500 mb-1.5 truncate">{initiative.businessGoal}</p>
        )}

        {/* Progress bar */}
        {initiative.targetValue > 0 && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {initiative.currentValue} / {initiative.targetValue} {initiative.successMetric}
            </span>
            <span className="text-xs font-semibold text-gray-700 w-8 text-right">{progress}%</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400">
          {initiative.deadline && (
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {initiative.deadline}
            </span>
          )}
          {initiative.stakeholders.length > 0 && (
            <span className="flex items-center gap-1">
              <Users size={10} />
              {initiative.stakeholders.map(s => s.name).join(', ')}
            </span>
          )}
          {initiative.operatingOwner && (
            <span>Driven by {initiative.operatingOwner}</span>
          )}
        </div>

        {initiative.blockers && (
          <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
            <AlertTriangle size={10} />
            {initiative.blockers}
          </div>
        )}
      </div>
    </div>
  )
}

function ObjectiveCard({ obj, initiatives, allObjectives }: { obj: Objective; initiatives: Initiative[]; allObjectives: Objective[] }) {
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
            {obj.teamName && <span>{obj.teamName}</span>}
            {obj.teamName && <span>·</span>}
            <span>{obj.keyResults.length} key results</span>
            <span>·</span>
            <span>{initiatives.length} initiatives</span>
            <span>·</span>
            <span>{obj.linkedBarIds.length} roadmap items</span>
          </div>
        </div>
        {expanded ? <ChevronDown size={16} className="text-gray-400 mt-1 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 mt-1 flex-shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          {/* Key Results */}
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

          {/* Initiatives */}
          {initiatives.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Initiatives</span>
              </div>
              {initiatives.map(init => (
                <InitiativeCard key={init.id} initiative={init} objectives={allObjectives} />
              ))}
            </div>
          )}

          <div className="px-5 py-2 bg-gray-50 border-t border-gray-100">
            <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add Key Result</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function StrategyBoard() {
  const { data: objectives = [], isLoading: loadingObj } = useObjectives()
  const { data: initiatives = [], isLoading: loadingInit } = useInitiatives()

  const company = objectives.filter(o => o.scope === 'company')
  const team = objectives.filter(o => o.scope === 'team')

  // Group initiatives by objectiveId
  const initByObjective = new Map<string, Initiative[]>()
  const unlinkedInitiatives: Initiative[] = []
  for (const init of initiatives) {
    if (init.objectiveId) {
      const list = initByObjective.get(init.objectiveId) ?? []
      list.push(init)
      initByObjective.set(init.objectiveId, list)
    } else {
      unlinkedInitiatives.push(init)
    }
  }

  if (loadingObj || loadingInit) {
    return <div className="flex items-center justify-center h-full text-gray-400">Loading strategy…</div>
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Strategy</h1>
          <p className="text-sm text-gray-500">Objectives, Key Results &amp; Initiatives — connect goals to execution</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
          <Plus size={14} /> New Objective
        </button>
      </div>

      <div className="p-6 space-y-8 max-w-4xl">
        {objectives.length === 0 && initiatives.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <p className="text-sm">No objectives or initiatives defined yet</p>
            <p className="text-xs mt-1">Tell Jarvis "new initiative" to get started</p>
          </div>
        )}

        {company.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-gray-800" />
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Objectives</h2>
            </div>
            <div className="space-y-3">
              {company.map(obj => (
                <ObjectiveCard key={obj.id} obj={obj} initiatives={initByObjective.get(obj.id) ?? []} allObjectives={objectives} />
              ))}
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
              {team.map(obj => (
                <ObjectiveCard key={obj.id} obj={obj} initiatives={initByObjective.get(obj.id) ?? []} allObjectives={objectives} />
              ))}
            </div>
          </section>
        )}

        {unlinkedInitiatives.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unlinked Initiatives</h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {unlinkedInitiatives.map(init => (
                <InitiativeCard key={init.id} initiative={init} objectives={objectives} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
