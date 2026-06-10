import { useState } from 'react'
import { OBJECTIVES, INITIATIVES, ROADMAP_BARS } from '../../lib/mockData'
import type { RagStatus } from '../../models'

const MONTH_WIDTH = 120
const ROW_H = 40
const LEFT = 220
const START_MONTH = new Date('2026-04-01')

const months: Date[] = Array.from({ length: 9 }, (_, i) => {
  const d = new Date(START_MONTH)
  d.setMonth(d.getMonth() + i)
  return d
})

const RAG_COLORS: Record<RagStatus, string> = {
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
}

function dateX(date: string): number {
  const d = new Date(date)
  const diffMs = d.getTime() - START_MONTH.getTime()
  return (diffMs / (1000 * 60 * 60 * 24 * 30.44)) * MONTH_WIDTH
}

function barW(start: string, end: string): number {
  return Math.max(60, dateX(end) - dateX(start))
}

interface TimeBarProps {
  x: number
  w: number
  color: string
  label: string
  percent?: number
  level: 0 | 1 | 2
}

function TimeBar({ x, w, color, label, percent = 0, level }: TimeBarProps) {
  const heights = [28, 24, 20]
  const tops = [6, 8, 10]
  const h = heights[level]
  const top = tops[level]
  const opacity = level === 0 ? 1 : level === 1 ? 0.85 : 0.7

  return (
    <div
      className="absolute rounded flex items-center px-2 overflow-hidden cursor-pointer transition-all hover:brightness-110 select-none"
      style={{
        left: x,
        width: w,
        height: h,
        top,
        background: color,
        opacity,
      }}
      title={label}
    >
      <span className="text-white text-xs font-medium truncate">{label}</span>
      {percent > 0 && (
        <div className="absolute bottom-1 left-2 right-2 h-0.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/60 rounded-full" style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  )
}

export function PortfolioTimeline() {
  const [showConnections, setShowConnections] = useState(false)
  const totalWidth = months.length * MONTH_WIDTH

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Strategic Portfolio</h1>
          <p className="text-sm text-gray-500">Objectives → Initiatives → Roadmap bars</p>
        </div>
        <button
          onClick={() => setShowConnections(v => !v)}
          className={[
            'text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors',
            showConnections ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
          ].join(' ')}
        >
          {showConnections ? 'Hide' : 'Show'} Connections
        </button>
      </div>

      {/* Legend */}
      <div className="px-6 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-5 text-xs text-gray-500">
        <span className="font-medium text-gray-600">RAG:</span>
        {(['green', 'amber', 'red'] as RagStatus[]).map(r => (
          <span key={r} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: RAG_COLORS[r] }} />
            {r === 'green' ? 'On Track' : r === 'amber' ? 'At Risk' : 'Off Track'}
          </span>
        ))}
        <span className="ml-3 flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-indigo-400" /> Objective</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-indigo-300" /> Initiative</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-indigo-200" /> Roadmap Bar</span>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        <div style={{ minWidth: LEFT + totalWidth + 32 }}>
          {/* Month headers */}
          <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
            <div className="flex-shrink-0 border-r border-gray-200 bg-gray-50" style={{ width: LEFT }} />
            {months.map(m => (
              <div
                key={m.toISOString()}
                className="border-r border-gray-100 text-xs font-semibold text-gray-400 flex items-center justify-center flex-shrink-0"
                style={{ width: MONTH_WIDTH, height: 36 }}
              >
                {m.toLocaleString('default', { month: 'short', year: '2-digit' })}
              </div>
            ))}
          </div>

          {/* Objective rows */}
          {OBJECTIVES.map(obj => {
            const ragColor = RAG_COLORS[obj.ragStatus]
            const initiatives = INITIATIVES.filter(i => i.objectiveId === obj.id)
            const linkedBars = ROADMAP_BARS.filter(b => obj.linkedBarIds.includes(b.id) && !b.isParked)

            // derive objective span from linked bars
            const barDates = linkedBars
              .filter(b => b.startDate && b.endDate)
              .flatMap(b => [b.startDate, b.endDate])
            const objStart = barDates.length ? barDates.sort()[0] : '2026-06-01'
            const objEnd = barDates.length ? barDates.sort().reverse()[0] : '2026-09-30'

            return (
              <div key={obj.id} className="border-b border-gray-200">
                {/* Objective row */}
                <div className="flex border-b border-gray-100" style={{ height: ROW_H + 4 }}>
                  <div
                    className="flex-shrink-0 flex items-center gap-2 px-3 border-r border-gray-200 bg-white"
                    style={{ width: LEFT }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ragColor }} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{obj.title}</div>
                      <div className="text-xs text-gray-400">{obj.teamName}</div>
                    </div>
                  </div>
                  <div className="relative flex-1">
                    {months.map((_, i) => (
                      <div key={i} className="absolute top-0 bottom-0 border-r border-gray-50" style={{ left: i * MONTH_WIDTH }} />
                    ))}
                    <TimeBar
                      x={dateX(objStart)}
                      w={barW(objStart, objEnd)}
                      color={obj.color}
                      label={obj.title}
                      level={0}
                    />
                  </div>
                </div>

                {/* Initiative rows */}
                {initiatives.map(init => {
                  const initBars = ROADMAP_BARS.filter(b => obj.linkedBarIds.includes(b.id) && !b.isParked)
                  const initStart = initBars.length ? initBars.map(b => b.startDate).sort()[0] : '2026-06-15'
                  const initEnd = initBars.length ? initBars.map(b => b.endDate).sort().reverse()[0] : '2026-09-15'

                  return (
                    <div key={init.id}>
                      {/* Initiative row */}
                      <div className="flex border-b border-gray-50" style={{ height: ROW_H }}>
                        <div
                          className="flex-shrink-0 flex items-center px-3 pl-6 gap-2 border-r border-gray-200 bg-white"
                          style={{ width: LEFT }}
                        >
                          <div className="w-1 h-4 rounded-sm flex-shrink-0" style={{ background: obj.color, opacity: 0.5 }} />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-700 truncate">{init.title}</div>
                            <div className="text-xs text-gray-400 capitalize">{init.status.replace('_', ' ')}</div>
                          </div>
                        </div>
                        <div className="relative flex-1">
                          {months.map((_, i) => (
                            <div key={i} className="absolute top-0 bottom-0 border-r border-gray-50" style={{ left: i * MONTH_WIDTH }} />
                          ))}
                          <TimeBar
                            x={dateX(initStart)}
                            w={barW(initStart, initEnd)}
                            color={obj.color}
                            label={init.title}
                            level={1}
                          />
                        </div>
                      </div>

                      {/* Roadmap bars linked to this objective */}
                      {initBars.map(bar => (
                        <div key={bar.id} className="flex border-b border-gray-50" style={{ height: ROW_H - 4 }}>
                          <div
                            className="flex-shrink-0 flex items-center px-3 pl-10 gap-2 border-r border-gray-200 bg-gray-50/50"
                            style={{ width: LEFT }}
                          >
                            <div className="w-1 h-3 rounded-sm flex-shrink-0" style={{ background: bar.color, opacity: 0.4 }} />
                            <span className="text-xs text-gray-500 truncate">{bar.title}</span>
                          </div>
                          <div className="relative flex-1">
                            <TimeBar
                              x={dateX(bar.startDate)}
                              w={barW(bar.startDate, bar.endDate)}
                              color={bar.color}
                              label={bar.title}
                              percent={bar.percentComplete}
                              level={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
