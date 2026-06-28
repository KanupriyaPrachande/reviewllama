import { LayoutDashboard, GitPullRequest, BarChart3, Bell, SlidersHorizontal, Plug, Leaf } from 'lucide-react'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', key: 'overview' },
  { icon: GitPullRequest, label: 'PR reviews', key: 'pr-reviews' },
  { icon: BarChart3, label: 'Analytics', key: 'analytics' },
  { icon: Bell, label: 'Alerts', key: 'alerts' },
]

const SETTINGS_ITEMS = [
  { icon: SlidersHorizontal, label: 'Thresholds', key: 'thresholds' },
  { icon: Plug, label: 'Integrations', key: 'integrations' },
]

export default function Sidebar({ modelStats, activePage, onNavigate }) {
  return (
    <aside className="w-[240px] shrink-0 bg-bg-panel flex flex-col h-screen shadow-[2px_0_12px_rgba(0,0,0,0.04)]">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-sage-deep flex items-center justify-center">
          <Leaf size={16} className="text-bg-panel" />
        </div>
        <span className="font-sans text-[17px] font-semibold text-text-primary tracking-tight">
          ReviewLlama
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto font-ui">
        <div className="px-2.5 pb-2 text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">Navigate</div>
        {NAV_ITEMS.map(({ icon: Icon, label, key }) => (
          <button key={key} onClick={() => onNavigate(key)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-left transition-colors ${
              activePage === key ? 'bg-sage-bg text-sage-deep font-semibold' : 'text-text-secondary font-medium hover:text-text-primary hover:bg-bg-raised'
            }`}>
            <Icon size={17} />{label}
          </button>
        ))}
        <div className="px-2.5 pt-5 pb-2 text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">Configure</div>
        {SETTINGS_ITEMS.map(({ icon: Icon, label, key }) => (
          <button key={key} onClick={() => onNavigate(key)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-left transition-colors ${
              activePage === key ? 'bg-sage-bg text-sage-deep font-semibold' : 'text-text-secondary font-medium hover:text-text-primary hover:bg-bg-raised'
            }`}>
            <Icon size={17} />{label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-5 font-ui">
        <div className="text-[12px] font-semibold text-text-tertiary mb-2">Model performance</div>
        <div className="flex items-baseline gap-2 mb-2.5">
          <span className="text-[22px] font-sans font-bold text-brass-deep">{(modelStats.recall * 100).toFixed(1)}%</span>
          <span className="text-[13px] font-medium text-text-tertiary">recall</span>
        </div>
        <div className="h-2 bg-bg-inset rounded-full overflow-hidden mb-2">
          <div className="h-full bg-brass rounded-full" style={{ width: `${modelStats.recall * 100}%` }} />
        </div>
        <div className="text-[13px] font-medium text-text-secondary">{(modelStats.fpr * 100).toFixed(1)}% false positive rate</div>
      </div>
    </aside>
  )
}