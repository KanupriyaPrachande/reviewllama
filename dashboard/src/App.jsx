import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import MetricsRow from './components/MetricsRow.jsx'
import FindingCard from './components/FindingCard.jsx'
import SeverityBreakdown from './components/SeverityBreakdown.jsx'
import CodeReviewPanel from './components/CodeReviewPanel.jsx'
import PRReviewsPage from './pages/PRReviewsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import AlertsPage from './pages/AlertsPage.jsx'
import ThresholdsPage from './pages/ThresholdsPage.jsx'
import IntegrationsPage from './pages/IntegrationsPage.jsx'
import { fetchStats, fetchHealth, fetchRecentFindings, fetchSeverityBreakdown } from './lib/api.js'

const EMPTY_STATS = { prs_reviewed_today: 0, issues_flagged_today: 0, critical_today: 0, auto_fix_rate: 0, avg_review_seconds: 0 }
const EMPTY_BREAKDOWN = { critical: 0, warning: 0, info: 0 }

function OverviewPage({ stats, breakdown, findings, onDismiss }) {
  return (
    <main className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6">
      <MetricsRow stats={stats} />
      <CodeReviewPanel />
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-text-primary">Live review feed</h2>
          <span className="text-[13px] text-text-tertiary font-medium">updated just now</span>
        </div>
        {findings.length === 0 ? (
          <div className="bg-bg-panel rounded-2xl p-8 text-center shadow-[0_2px_14px_rgba(0,0,0,0.07)]">
            <p className="text-[15px] text-text-secondary font-medium">No reviews yet.</p>
            <p className="text-[13px] text-text-tertiary mt-1.5">Paste code above and click "Review code" to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {findings.map(f => <FindingCard key={f.id} finding={f} onDismiss={onDismiss} />)}
          </div>
        )}
      </div>
      <div className="pb-5"><SeverityBreakdown breakdown={breakdown} /></div>
    </main>
  )
}

export default function App() {
  const [activePage, setActivePage] = useState('overview')
  const [stats, setStats] = useState(EMPTY_STATS)
  const [breakdown, setBreakdown] = useState(EMPTY_BREAKDOWN)
  const [apiStatus, setApiStatus] = useState('checking')
  const [findings, setFindings] = useState([])
  const [dismissedIds, setDismissedIds] = useState(new Set())

  useEffect(() => {
    let mounted = true
    async function load() {
      const health = await fetchHealth()
      const statsData = await fetchStats()
      const recentFindings = await fetchRecentFindings()
      const severityData = await fetchSeverityBreakdown()
      if (!mounted) return
      setApiStatus(health.status)
      setStats(statsData)
      setFindings(recentFindings)
      setBreakdown(severityData)
    }
    load()
    const interval = setInterval(load, 15000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  const visibleFindings = findings.filter(f => !dismissedIds.has(f.id))

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar modelStats={{ recall: 0.731, fpr: 0.078 }} activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar apiStatus={apiStatus} />
        {activePage === 'overview' && <OverviewPage stats={stats} breakdown={breakdown} findings={visibleFindings} onDismiss={id => setDismissedIds(prev => new Set(prev).add(id))} />}
        {activePage === 'pr-reviews' && <PRReviewsPage />}
        {activePage === 'analytics' && <AnalyticsPage />}
        {activePage === 'alerts' && <AlertsPage />}
        {activePage === 'thresholds' && <ThresholdsPage />}
        {activePage === 'integrations' && <IntegrationsPage />}
      </div>
    </div>
  )
}