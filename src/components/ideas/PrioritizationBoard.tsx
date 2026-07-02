import { useState } from 'react'
import { usePriorityColumns } from '../../lib/hooks'
import type { Idea, IdeaScore, PriorityColumn } from '../../models'

function computeScore(scores: IdeaScore[], columns: PriorityColumn[]): number {
  let totalPoints = 0
  let maxPoints = 0

  for (const col of columns) {
    const scoreEntry = scores.find(s => s.columnId === col.id)
    const raw = scoreEntry?.score ?? 0
    // benefit: high raw = high points; cost: low raw = high points (inverted)
    const points = col.type === 'benefit' ? raw * col.weight : (6 - raw) * col.weight
    const max = 5 * col.weight
    totalPoints += points
    maxPoints += max
  }

  if (maxPoints === 0) return 0
  return Math.round((totalPoints / maxPoints) * 100)
}

interface Props {
  idea: Idea
  onScoreChange?: (ideaId: string, columnId: string, score: number) => void
}

export function PrioritizationBoard({ idea, onScoreChange }: Props) {
  const { data: priorityColumns = [] } = usePriorityColumns()
  const [scores, setScores] = useState<IdeaScore[]>(idea.scores)

  const handleScore = (columnId: string, score: number) => {
    setScores(prev => {
      const existing = prev.find(s => s.columnId === columnId)
      if (existing) {
        return prev.map(s => s.columnId === columnId ? { ...s, score } : s)
      }
      return [...prev, { ideaId: idea.id, columnId, score }]
    })
    onScoreChange?.(idea.id, columnId, score)
  }

  const compositeScore = computeScore(scores, priorityColumns)

  const benefitCols = priorityColumns.filter(c => c.type === 'benefit')
  const costCols = priorityColumns.filter(c => c.type === 'cost')

  const ScoreDots = ({ columnId, value }: { columnId: string; value: number }) => (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => handleScore(columnId, n)}
          className={[
            'w-6 h-6 rounded-full text-xs font-semibold transition-all border',
            n <= value
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-white text-gray-400 border-gray-200 hover:border-indigo-300',
          ].join(' ')}
        >
          {n}
        </button>
      ))}
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Prioritization Score</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Composite</span>
          <span className={[
            'text-sm font-bold px-2.5 py-0.5 rounded-full',
            compositeScore >= 70 ? 'bg-green-100 text-green-700' :
            compositeScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700',
          ].join(' ')}>
            {compositeScore}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">
            Benefit
          </div>
          {benefitCols.map(col => {
            const entry = scores.find(s => s.columnId === col.id)
            return (
              <div key={col.id} className="flex items-center justify-between py-1.5">
                <div className="text-sm text-gray-600 w-36">{col.name}</div>
                <ScoreDots columnId={col.id} value={entry?.score ?? 0} />
                <div className="text-xs text-gray-400 w-16 text-right">w:{col.weight}x</div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
            Cost
          </div>
          {costCols.map(col => {
            const entry = scores.find(s => s.columnId === col.id)
            return (
              <div key={col.id} className="flex items-center justify-between py-1.5">
                <div className="text-sm text-gray-600 w-36">{col.name}</div>
                <ScoreDots columnId={col.id} value={entry?.score ?? 0} />
                <div className="text-xs text-gray-400 w-16 text-right">w:{col.weight}x</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { computeScore }
