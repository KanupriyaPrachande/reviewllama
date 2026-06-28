import { ShieldAlert, KeyRound, CircleSlash, Sparkles, X } from 'lucide-react'

const SEVERITY_STYLES = {
  critical: { text: 'text-severity-critical', bg: 'bg-severity-criticalBg', accent: '#1E4642' },
  warning: { text: 'text-severity-warning', bg: 'bg-severity-warningBg', accent: '#B8893F' },
  info: { text: 'text-severity-info', bg: 'bg-severity-infoBg', accent: '#5C6B4F' },
}

const LABEL_ICONS = {
  sql_injection: ShieldAlert,
  hardcoded_secret: KeyRound,
  null_dereference: CircleSlash,
}

const LABEL_TEXT = {
  sql_injection: 'SQL injection vulnerability',
  hardcoded_secret: 'Hardcoded credential',
  null_dereference: 'Unhandled null dereference',
  other: 'Potential issue detected',
}

function ConfidenceMeter({ value }) {
  const pct = Math.round(value * 100)
  const color = value > 0.85 ? '#1E4642' : value > 0.6 ? '#B8893F' : '#5C6B4F'
  return (
    <div className="flex items-center gap-2" title={`Model confidence: ${pct}%`}>
      <svg width="34" height="34" viewBox="0 0 34 34">
        <circle cx="17" cy="17" r="13.5" fill="none" stroke="#EFEBE1" strokeWidth="4" />
        <circle
          cx="17"
          cy="17"
          r="13.5"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${pct * 0.848} 100`}
          strokeLinecap="round"
          transform="rotate(-90 17 17)"
        />
      </svg>
      <span className="text-[14px] font-mono font-semibold text-text-primary">{pct}%</span>
    </div>
  )
}

export default function FindingCard({ finding, onDismiss }) {
  const sev = SEVERITY_STYLES[finding.severity] || SEVERITY_STYLES.info
  const Icon = LABEL_ICONS[finding.label] || Sparkles

  return (
    <div
      className="bg-bg-panel rounded-2xl overflow-hidden slide-in font-ui shadow-[0_2px_14px_rgba(0,0,0,0.07)]"
      style={{ borderLeft: `5px solid ${sev.accent}` }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <span className={`text-[12px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${sev.bg} ${sev.text}`}>
            {finding.severity}
          </span>
          <span className="text-[14px] text-text-secondary font-mono font-medium">
            PR #{finding.pr_number} · {finding.file_path}:{finding.line}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-text-tertiary font-medium">{finding.time_ago}</span>
          <button
            onClick={() => onDismiss?.(finding.id)}
            title="Dismiss"
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <Icon size={18} className={sev.text} />
            <span className="text-[17px] font-sans font-semibold text-text-primary">
              {LABEL_TEXT[finding.label] || finding.label}
            </span>
          </div>
          <ConfidenceMeter value={finding.confidence} />
        </div>
        <p className="text-[14px] text-text-secondary leading-relaxed max-w-[640px]">{finding.message}</p>
      </div>
    </div>
  )
}