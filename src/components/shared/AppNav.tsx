import { Link, useRouterState } from '@tanstack/react-router'
import { Lightbulb, Map, Target, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/ideas', label: 'Ideas', icon: Lightbulb, description: 'Capture & prioritize' },
  { to: '/roadmap', label: 'Roadmap', icon: Map, description: 'Visual timeline' },
  { to: '/strategy', label: 'Strategy', icon: Target, description: 'Objectives & KRs' },
  { to: '/portfolio', label: 'Portfolio', icon: BarChart3, description: 'Strategic overview' },
]

export function AppNav() {
  const { location } = useRouterState()

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Map size={14} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">Product Plan</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, description }) => {
          const active = location.pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')}
            >
              <Icon
                size={16}
                className={active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}
              />
              <div>
                <div className={`text-sm font-medium ${active ? 'text-indigo-700' : ''}`}>{label}</div>
                <div className="text-xs text-gray-400">{description}</div>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">Product Plan v1.0</div>
      </div>
    </aside>
  )
}
