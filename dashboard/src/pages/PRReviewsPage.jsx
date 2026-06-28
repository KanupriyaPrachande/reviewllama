import { useEffect, useState } from 'react'
import { ShieldAlert, KeyRound, CircleSlash, Sparkles } from 'lucide-react'
import { fetchAllFindings } from '../lib/api.js'

const SEVERITY_STYLES = {
  critical: { text: 'text-severity-critical', bg: 'bg-severity-criticalBg' },
  warning: { text: 'text-severity-warning', bg: 'bg-severity-warningBg' },
  info: { text: 'text-severity-info', bg: 'bg-severity-infoBg' },
}

const LABEL_ICONS = {
  sql_injection: ShieldAlert,
  hardcoded_secret: KeyRound,
  null_dereference: CircleSlash,
}

const LABEL_TEXT = {
  sql_injection: 'SQL injection',
  hardcoded_secret: 'Hardcoded credential',
  null_dereference: 'Null dereference',
  other: 'Potential issue',
}

const FILTERS = [
  { key: null, label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warning' },
  { key: 'info', label: 'Info' },
]

export default function PRReviewsPage() {
  const [findings, setFindings] = useState([])
  const [activeFilter, setActiveFilter] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchAllFindings(activeFilter).then((data) => {
      if (mounted) {
        setFindings(data)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [activeFilter])

  return (
    <main className="flex-1 overflow-y-auto px-7 py-6 font-ui">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[18px] font-semibold text-text-primary">All PR reviews</h2>
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                activeFilter === f.key
                  ? 'bg-sage-deep text-bg-panel'
                  : 'bg-bg-panel text-text-secondary hover:text-text-primary shadow-[0_1px_6px_rgba(0,0,0,0.06)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-bg-panel rounded-2xl p-8 text-center shadow-[0_2px_14px_rgba(0,0,0,0.07)]">
          <p className="text-[14px] text-text-secondary font-medium">Loading...</p>
        </div>
      ) : findings.length === 0 ? (
        <div className="bg-bg-panel rounded-2xl p-8 text-center shadow-[0_2px_14px_rgba(0,0,0,0.07)]">
          <p className="text-[15px] text-text-secondary font-medium">No reviews found.</p>
          <p className="text-[13px] text-text-tertiary mt-1.5">
            {activeFilter
              ? `No "${activeFilter}" severity findings yet.`
              : 'Submit a diff through the API (POST /reviews) to populate this list.'}
          </p>
        </div>
      ) : (
        <div className="bg-bg-panel rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,0.07)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-5 py-3 text-[12px] font-semibold text-text-tertiary uppercase tracking-wide">PR</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-text-tertiary uppercase tracking-wide">File</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-text-tertiary uppercase tracking-wide">Issue</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-text-tertiary uppercase tracking-wide">Severity</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-text-tertiary uppercase tracking-wide">Confidence</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-text-tertiary uppercase tracking-wide">When</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => {
                const sev = SEVERITY_STYLES[f.severity] || SEVERITY_STYLES.info
                const Icon = LABEL_ICONS[f.label] || Sparkles
                return (
                  <tr key={f.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-raised transition-colors">
                    <td className="px-5 py-3.5 text-[14px] font-mono font-medium text-text-secondary">
                      #{f.pr_number}
                    </td>
                    <td className="px-5 py-3.5 text-[14px] font-mono text-text-secondary">
                      {f.file_path}:{f.line}
                    </td>
                    <td className="px-5 py-3.5 text-[14px] font-medium text-text-primary">
                      <span className="flex items-center gap-2">
                        <Icon size={15} className={sev.text} />
                        {LABEL_TEXT[f.label] || f.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[12px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${sev.bg} ${sev.text}`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[14px] font-mono font-semibold text-text-secondary">
                      {Math.round(f.confidence * 100)}%
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-text-tertiary font-medium">
                      {f.time_ago}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}