import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://reviewllama-production.up.railway.app/reviews/alerts', { signal: AbortSignal.timeout(3000) })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setAlerts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="flex-1 overflow-y-auto px-7 py-6 font-ui flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-text-primary">Critical alerts</h2>
        <span className="text-[13px] text-text-tertiary font-medium">{alerts.length} critical finding{alerts.length !== 1 ? 's' : ''} total</span>
      </div>
      {loading ? (
        <div className="bg-bg-panel rounded-2xl p-8 text-center shadow-[0_2px_14px_rgba(0,0,0,0.07)]">
          <p className="text-[14px] text-text-secondary font-medium">Loading...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-bg-panel rounded-2xl p-8 text-center shadow-[0_2px_14px_rgba(0,0,0,0.07)]">
          <p className="text-[15px] text-text-secondary font-medium">No critical alerts.</p>
          <p className="text-[13px] text-text-tertiary mt-1.5">Critical findings will appear here automatically.</p>
        </div>
      ) : alerts.map(a => (
        <div key={a.id} className="bg-bg-panel rounded-2xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.07)] border-l-[4px] border-l-severity-critical">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={16} className="text-severity-critical" />
              <span className="text-[14px] font-semibold text-text-primary">
                {a.issue_category ? a.issue_category.toUpperCase() : 'CRITICAL'} — PR #{a.pr_number}
              </span>
            </div>
            <span className="text-[12px] text-text-tertiary font-medium">{timeAgo(a.reviewed_at)}</span>
          </div>
          <p className="text-[13px] text-text-secondary leading-relaxed mb-1.5">{a.message}</p>
          <span className="text-[12px] font-mono text-text-tertiary">{a.file_path}:{a.line} · {a.repo}</span>
        </div>
      ))}
    </main>
  )
}