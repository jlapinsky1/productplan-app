import { useState, useRef } from 'react'
import { Plus, ChevronRight, ChevronDown } from 'lucide-react'
import { useThemes, useRoadmapBars } from '../../lib/hooks'
import type { RoadmapBar } from '../../models'

const MONTH_WIDTH = 140 // px per month
const LANE_HEIGHT = 44  // px per bar row
const HEADER_HEIGHT = 40

function dateToX(date: string, startMonth: Date): number {
  const d = new Date(date)
  const diffMs = d.getTime() - startMonth.getTime()
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44)
  return diffMonths * MONTH_WIDTH
}

function barWidth(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMonths = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  return Math.max(diffMonths * MONTH_WIDTH, 60)
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="absolute bottom-1.5 left-2 right-2 h-1 bg-black/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-white/60 rounded-full transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

interface BarProps {
  bar: RoadmapBar
  startMonth: Date
  onClick: () => void
  selected: boolean
}

function BarItem({ bar, startMonth, onClick, selected }: BarProps) {
  const x = dateToX(bar.startDate, startMonth)
  const w = barWidth(bar.startDate, bar.endDate)

  return (
    <div
      onClick={onClick}
      className={[
        'absolute top-1 rounded-md px-2.5 cursor-pointer transition-all select-none overflow-hidden',
        'flex items-center',
        selected ? 'ring-2 ring-white ring-offset-1' : 'hover:brightness-110',
      ].join(' ')}
      style={{
        left: x,
        width: w,
        height: LANE_HEIGHT - 8,
        background: bar.color,
      }}
      title={`${bar.title} · ${bar.percentComplete}% complete`}
    >
      <span className="text-white text-xs font-medium truncate flex-1">{bar.title}</span>
      <ProgressBar percent={bar.percentComplete} />
    </div>
  )
}

interface BarDetailProps {
  bar: RoadmapBar
  onClose: () => void
}

function BarDetail({ bar, onClose }: BarDetailProps) {
  return (
    <div className="w-72 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
      <div className="px-4 py-4 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{bar.title}</h2>
          <span className="text-xs text-gray-500 mt-0.5 block">
            {bar.startDate} → {bar.endDate}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</div>
          <p className="text-sm text-gray-600">{bar.description}</p>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Progress</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${bar.percentComplete}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">{bar.percentComplete}%</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {bar.tags.map(t => (
            <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t}</span>
          ))}
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</div>
          <span className={[
            'text-xs font-medium px-2 py-0.5 rounded-full',
            bar.percentComplete === 100 ? 'bg-green-100 text-green-700' :
            bar.percentComplete > 0 ? 'bg-indigo-100 text-indigo-700' :
            'bg-gray-100 text-gray-600',
          ].join(' ')}>
            {bar.percentComplete === 100 ? 'Complete' : bar.percentComplete > 0 ? 'In Progress' : 'Planned'}
          </span>
        </div>
      </div>
    </div>
  )
}

export function RoadmapTimeline() {
  const { data: themes = [], isLoading: themesLoading } = useThemes()
  const { data: roadmapBars = [], isLoading: barsLoading } = useRoadmapBars()

  const [collapsedThemes, setCollapsedThemes] = useState<Set<string>>(new Set())
  const [selectedBar, setSelectedBar] = useState<RoadmapBar | null>(null)
  const [activeView, setActiveView] = useState<'timeline' | 'parked'>('timeline')
  const scrollRef = useRef<HTMLDivElement>(null)

  const startMonth = new Date('2026-04-01')
  const months: Date[] = Array.from({ length: 9 }, (_, i) => {
    const d = new Date(startMonth)
    d.setMonth(d.getMonth() + i)
    return d
  })
  const totalWidth = months.length * MONTH_WIDTH
  const LEFT_LABEL = 200

  const toggleTheme = (themeId: string) => {
    setCollapsedThemes(prev => {
      const next = new Set(prev)
      next.has(themeId) ? next.delete(themeId) : next.add(themeId)
      return next
    })
  }

  const parkedBars = roadmapBars.filter(b => b.isParked)
  const activeBars = roadmapBars.filter(b => !b.isParked)

  if (themesLoading || barsLoading) {
    return <div className="flex items-center justify-center h-full text-gray-400">Loading roadmap…</div>
  }

  // Build a "today" line using the actual date
  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Roadmap</h1>
            <p className="text-sm text-gray-500">Visual timeline · themes &amp; initiatives</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              {(['timeline', 'parked'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={[
                    'px-3 py-1.5 font-medium capitalize',
                    activeView === v ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {v === 'parked' ? `Parked (${parkedBars.length})` : 'Timeline'}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
              <Plus size={14} /> Add Bar
            </button>
          </div>
        </div>

        {activeView === 'parked' ? (
          /* Parked table */
          <div className="flex-1 overflow-y-auto">
            {parkedBars.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No parked items</div>
            ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Description</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tags</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parkedBars.map(bar => (
                  <tr key={bar.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: bar.color }} />
                        <span className="text-sm font-medium text-gray-900">{bar.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{bar.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {bar.tags.map(t => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                        → Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        ) : (
          /* Timeline */
          <div className="flex-1 overflow-auto" ref={scrollRef}>
            {activeBars.length === 0 && themes.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No roadmap items yet</div>
            ) : (
            <div style={{ minWidth: LEFT_LABEL + totalWidth + 32 }}>
              {/* Month headers */}
              <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                <div className="flex-shrink-0 border-r border-gray-200 bg-gray-50" style={{ width: LEFT_LABEL }} />
                {months.map(m => (
                  <div
                    key={m.toISOString()}
                    className="border-r border-gray-100 text-xs font-semibold text-gray-400 flex items-center justify-center flex-shrink-0"
                    style={{ width: MONTH_WIDTH, height: HEADER_HEIGHT }}
                  >
                    {m.toLocaleString('default', { month: 'short', year: '2-digit' })}
                  </div>
                ))}
              </div>

              {/* Today line placeholder row */}
              <div className="relative border-b border-gray-100" style={{ height: 24 }}>
                <div className="flex-shrink-0 absolute left-0 top-0 bottom-0 border-r border-gray-200 bg-white flex items-center px-3 text-xs text-gray-400 font-medium" style={{ width: LEFT_LABEL }}>
                  Timeline
                </div>
                <div className="absolute" style={{ left: LEFT_LABEL }}>
                  {/* Today line */}
                  {(() => {
                    const todayX = dateToX(todayStr, startMonth)
                    return (
                      <div
                        className="absolute top-0 w-px bg-red-400"
                        style={{ left: todayX, height: 9999 }}
                      >
                        <span className="absolute -top-4 -translate-x-1/2 text-xs text-red-500 font-medium whitespace-nowrap">Today</span>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Themes + lanes — bars grouped by theme */}
              {themes.map(theme => {
                const collapsed = collapsedThemes.has(theme.id)
                const themeBars = activeBars.filter(b => b.themeId === theme.id)

                return (
                  <div key={theme.id} className="border-b border-gray-200">
                    {/* Theme row */}
                    <div
                      className="flex items-center border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                      style={{ height: 32 }}
                      onClick={() => toggleTheme(theme.id)}
                    >
                      <div
                        className="flex-shrink-0 flex items-center gap-2 px-3"
                        style={{ width: LEFT_LABEL, borderRight: '1px solid #e5e7eb' }}
                      >
                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: theme.color }} />
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide truncate">{theme.name}</span>
                        {collapsed ? <ChevronRight size={12} className="ml-auto text-gray-400" /> : <ChevronDown size={12} className="ml-auto text-gray-400" />}
                      </div>
                      <div className="flex-1" />
                    </div>

                    {/* Bar rows within theme */}
                    {!collapsed && (
                      themeBars.length === 0 ? (
                        <div className="flex" style={{ height: LANE_HEIGHT }}>
                          <div className="flex-shrink-0 flex items-center px-4 border-r border-gray-200 bg-white" style={{ width: LEFT_LABEL }}>
                            <span className="text-xs text-gray-400 italic">No bars</span>
                          </div>
                          <div className="flex-1" />
                        </div>
                      ) : (
                        <div className="flex border-b border-gray-100" style={{ height: Math.max(1, themeBars.length) * LANE_HEIGHT }}>
                          <div className="flex-shrink-0 flex items-start px-4 pt-2.5 border-r border-gray-200 bg-white" style={{ width: LEFT_LABEL }}>
                            <span className="text-xs text-gray-500 font-medium">{themeBars.length} item{themeBars.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="relative flex-1" style={{ height: themeBars.length * LANE_HEIGHT }}>
                            {months.map((_, i) => (
                              <div
                                key={i}
                                className="absolute top-0 bottom-0 border-r border-gray-100"
                                style={{ left: i * MONTH_WIDTH, width: MONTH_WIDTH }}
                              />
                            ))}
                            {themeBars.map((bar, i) => (
                              <div
                                key={bar.id}
                                style={{ position: 'absolute', top: i * LANE_HEIGHT, left: 0, right: 0, height: LANE_HEIGHT }}
                              >
                                <BarItem
                                  bar={bar}
                                  startMonth={startMonth}
                                  onClick={() => setSelectedBar(selectedBar?.id === bar.id ? null : bar)}
                                  selected={selectedBar?.id === bar.id}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )
              })}

              {/* Bars without a theme */}
              {(() => {
                const unthemed = activeBars.filter(b => !b.themeId || !themes.some(t => t.id === b.themeId))
                if (unthemed.length === 0) return null
                return (
                  <div className="border-b border-gray-200">
                    <div className="flex items-center border-b border-gray-100" style={{ height: 32 }}>
                      <div
                        className="flex-shrink-0 flex items-center gap-2 px-3"
                        style={{ width: LEFT_LABEL, borderRight: '1px solid #e5e7eb' }}
                      >
                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0 bg-gray-400" />
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Unassigned</span>
                      </div>
                      <div className="flex-1" />
                    </div>
                    <div className="flex border-b border-gray-100" style={{ height: unthemed.length * LANE_HEIGHT }}>
                      <div className="flex-shrink-0 flex items-start px-4 pt-2.5 border-r border-gray-200 bg-white" style={{ width: LEFT_LABEL }}>
                        <span className="text-xs text-gray-500 font-medium">{unthemed.length} item{unthemed.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="relative flex-1" style={{ height: unthemed.length * LANE_HEIGHT }}>
                        {months.map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 border-r border-gray-100"
                            style={{ left: i * MONTH_WIDTH, width: MONTH_WIDTH }}
                          />
                        ))}
                        {unthemed.map((bar, i) => (
                          <div
                            key={bar.id}
                            style={{ position: 'absolute', top: i * LANE_HEIGHT, left: 0, right: 0, height: LANE_HEIGHT }}
                          >
                            <BarItem
                              bar={bar}
                              startMonth={startMonth}
                              onClick={() => setSelectedBar(selectedBar?.id === bar.id ? null : bar)}
                              selected={selectedBar?.id === bar.id}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
            )}
          </div>
        )}
      </div>

      {selectedBar && (
        <BarDetail bar={selectedBar} onClose={() => setSelectedBar(null)} />
      )}
    </div>
  )
}
