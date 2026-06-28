const SEVERITY_CONFIG = [
  { key: 'critical', label: 'Critical', color: '#A8463B' },
  { key: 'warning', label: 'Warning', color: '#B8893F' },
  { key: 'info', label: 'Info', color: '#5C6B4F' },
]

export default function SeverityBreakdown({ breakdown }) {
  const total = breakdown.critical + breakdown.warning + breakdown.info
  const max = Math.max(breakdown.critical, breakdown.warning, breakdown.info, 1)

  return (
    <div className="bg-bg-panel rounded-2xl p-5 font-ui shadow-[0_2px_14px_rgba(0,0,0,0.07)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-text-primary">Severity breakdown</h3>
        <span className="text-[13px] text-text-tertiary font-medium">
          {total} total finding{total === 1 ? '' : 's'}
        </span>
      </div>

      {total === 0 ? (
        <p className="text-[14px] text-text-secondary leading-relaxed">
          No reviews recorded yet. Submit a diff through the API to see real
          severity counts here.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {SEVERITY_CONFIG.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-[14px] text-text-secondary font-medium w-[80px] shrink-0">{label}</span>
              <div className="flex-1 h-2 bg-bg-inset rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(breakdown[key] / max) * 100}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-[13px] font-mono font-semibold text-text-secondary w-7 text-right">
                {breakdown[key]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}