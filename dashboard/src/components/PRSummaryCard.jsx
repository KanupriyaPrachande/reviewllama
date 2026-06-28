const RISK_STYLES = {
  low: 'bg-diff-addBg text-diff-add',
  medium: 'bg-severity-warningBg text-severity-warning',
  high: 'bg-severity-criticalBg text-severity-critical',
}

const TYPE_LABELS = {
  feature: '✨ Feature',
  fix: '🐛 Fix',
  refactor: '♻️ Refactor',
  security: '🔒 Security',
  other: '📝 Other',
}

function ScoreBar({ label, value }) {
  const color = value >= 8 ? '#4F7A4A' : value >= 5 ? '#B8893F' : '#A8463B'
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[12px] text-text-secondary font-medium w-[88px] shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-bg-inset rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value * 10}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] font-mono font-semibold text-text-secondary w-6 text-right">{value}</span>
    </div>
  )
}

export default function PRSummaryCard({ summary }) {
  if (!summary) return null
  return (
    <div className="bg-bg-panel rounded-2xl p-5 font-ui shadow-[0_2px_14px_rgba(0,0,0,0.07)] mb-4">
      <div className="flex items-center gap-2.5 mb-3">
        <h3 className="text-[15px] font-semibold text-text-primary">PR Summary</h3>
        <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-sage-bg text-sage-deep">
          {TYPE_LABELS[summary.change_type] || summary.change_type}
        </span>
        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ml-auto ${RISK_STYLES[summary.risk_level] || RISK_STYLES.medium}`}>
          {summary.risk_level} risk
        </span>
      </div>
      <p className="text-[14px] text-text-secondary leading-relaxed mb-4">{summary.summary}</p>
      {summary.score && (
        <div className="flex flex-col gap-2">
          <ScoreBar label="Correctness" value={summary.score.correctness} />
          <ScoreBar label="Readability" value={summary.score.readability} />
          <ScoreBar label="Security" value={summary.score.security} />
          <div className="mt-1 pt-2 border-t border-border-subtle">
            <ScoreBar label="Overall" value={summary.score.overall} />
          </div>
          {summary.score.rationale && (
            <p className="text-[12px] text-text-tertiary mt-1 italic">{summary.score.rationale}</p>
          )}
        </div>
      )}
    </div>
  )
}