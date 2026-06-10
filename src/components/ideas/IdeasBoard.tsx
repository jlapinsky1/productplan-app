import { useState } from 'react'
import { ThumbsUp, Plus, ChevronDown, Tag, ArrowRight } from 'lucide-react'
import { IDEAS, PRIORITY_COLUMNS } from '../../lib/mockData'
import { computeScore } from './PrioritizationBoard'
import { PrioritizationBoard } from './PrioritizationBoard'
import type { Idea, IdeaStatus } from '../../models'

const STATUS_CONFIG: Record<IdeaStatus, { label: string; color: string; bg: string }> = {
  backlog: { label: 'Backlog', color: 'text-gray-600', bg: 'bg-gray-100' },
  planned: { label: 'Planned', color: 'text-blue-600', bg: 'bg-blue-50' },
  in_progress: { label: 'In Progress', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  done: { label: 'Done', color: 'text-green-600', bg: 'bg-green-50' },
}

function StatusBadge({ status }: { status: IdeaStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

export function IdeasBoard() {
  const [ideas] = useState<Idea[]>(IDEAS)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [filterStatus, setFilterStatus] = useState<IdeaStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'score' | 'votes' | 'date'>('score')

  const filtered = ideas
    .filter(i => filterStatus === 'all' || i.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'score') {
        return computeScore(b.scores, PRIORITY_COLUMNS) - computeScore(a.scores, PRIORITY_COLUMNS)
      }
      if (sortBy === 'votes') return b.votes - a.votes
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div className="flex h-full">
      {/* Main list */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Ideas</h1>
            <p className="text-sm text-gray-500">{ideas.length} ideas · capture and prioritize what to build next</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus size={14} />
            Add Idea
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            <div className="flex gap-1">
              {(['all', 'backlog', 'planned', 'in_progress', 'done'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={[
                    'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
                    filterStatus === s
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:bg-gray-100',
                  ].join(' ')}
                >
                  {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white"
            >
              <option value="score">Priority Score</option>
              <option value="votes">Votes</option>
              <option value="date">Date Added</option>
            </select>
            <ChevronDown size={12} className="text-gray-400 -ml-5 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 w-10">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tags</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Requester</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Votes</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Score</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((idea, idx) => {
                const score = computeScore(idea.scores, PRIORITY_COLUMNS)
                const isSelected = selectedIdea?.id === idea.id
                return (
                  <tr
                    key={idea.id}
                    onClick={() => setSelectedIdea(isSelected ? null : idea)}
                    className={[
                      'cursor-pointer transition-colors',
                      isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <td className="px-6 py-3 text-xs text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-900">{idea.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{idea.description}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={idea.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {idea.tags.map(t => (
                          <span key={t} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            <Tag size={9} />{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{idea.requester}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex items-center justify-end gap-1 text-sm text-gray-600">
                        <ThumbsUp size={12} className="text-gray-400" />
                        {idea.votes}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={[
                        'text-sm font-semibold px-2 py-0.5 rounded',
                        score >= 70 ? 'text-green-700 bg-green-50' :
                        score >= 40 ? 'text-yellow-700 bg-yellow-50' :
                        'text-red-700 bg-red-50',
                      ].join(' ')}>
                        {score}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {idea.linkedBarId ? (
                        <span className="text-xs text-green-600 flex items-center justify-end gap-1">
                          <ArrowRight size={10} /> On Roadmap
                        </span>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation() }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          → Roadmap
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right detail panel */}
      {selectedIdea && (
        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <h2 className="text-sm font-semibold text-gray-900 leading-snug pr-2">{selectedIdea.title}</h2>
              <button
                onClick={() => setSelectedIdea(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none mt-0.5"
              >
                ×
              </button>
            </div>
            <StatusBadge status={selectedIdea.status} />
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</div>
              <p className="text-sm text-gray-600">{selectedIdea.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Requester</div>
                <div className="font-medium text-gray-700">{selectedIdea.requester}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Votes</div>
                <div className="font-medium text-gray-700">{selectedIdea.votes}</div>
              </div>
            </div>
            <PrioritizationBoard idea={selectedIdea} />
          </div>
        </div>
      )}
    </div>
  )
}
