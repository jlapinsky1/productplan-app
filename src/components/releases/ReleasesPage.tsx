import { useState } from 'react'
import { Rocket } from 'lucide-react'
import { useIdeas, useProducts } from '../../lib/hooks'

export function ReleasesPage() {
  const { data: ideas = [], isLoading } = useIdeas()
  const { data: products = [] } = useProducts()
  const [filterProduct, setFilterProduct] = useState<string>('all')
  const [filterRange, setFilterRange] = useState<'all' | '7d' | '30d' | '90d'>('all')

  const released = ideas
    .filter(i => i.status === 'released' || i.status === 'done')
    .filter(i => filterProduct === 'all' || i.productId === filterProduct)
    .filter(i => {
      if (filterRange === 'all') return true
      const days = filterRange === '7d' ? 7 : filterRange === '30d' ? 30 : 90
      const cutoff = Date.now() - days * 86400000
      return new Date(i.updatedAt).getTime() >= cutoff
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const productMap = new Map(products.map(p => [p.id, p.name]))

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-gray-400">Loading releases...</div>
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-1">
          <Rocket size={18} className="text-indigo-600" />
          <h1 className="text-lg font-semibold text-gray-900">Releases</h1>
        </div>
        <p className="text-sm text-gray-500">{released.length} released items &middot; track what marketing needs to message</p>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Product:</span>
          <select
            value={filterProduct}
            onChange={e => setFilterProduct(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white"
          >
            <option value="all">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Released:</span>
          <div className="flex gap-1">
            {(['all', '7d', '30d', '90d'] as const).map(r => (
              <button
                key={r}
                onClick={() => setFilterRange(r)}
                className={[
                  'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
                  filterRange === r
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100',
                ].join(' ')}
              >
                {r === 'all' ? 'All Time' : r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {released.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Rocket size={32} className="mb-2 text-gray-300" />
            <p className="text-sm">No releases yet</p>
            <p className="text-xs mt-1">Mark ideas as "Done" or "Released" to see them here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {released.map(idea => (
              <div key={idea.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{idea.title}</h3>
                      <span className={[
                        'text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                        idea.status === 'released'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-green-50 text-green-600',
                      ].join(' ')}>
                        {idea.status === 'released' ? 'Released' : 'Done'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate max-w-xl">{idea.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {idea.productId && (
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {productMap.get(idea.productId) ?? 'Unknown'}
                        </span>
                      )}
                      {idea.requester && (
                        <span className="text-xs text-gray-400">Requester: {idea.requester}</span>
                      )}
                      {idea.arr != null && (
                        <span className="text-xs text-gray-400">ARR: ${idea.arr.toLocaleString()}</span>
                      )}
                      {idea.tags.length > 0 && (
                        <div className="flex gap-1">
                          {idea.tags.map(t => (
                            <span key={t} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-xs text-gray-400">
                      {new Date(idea.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
