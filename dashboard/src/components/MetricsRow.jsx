import { Eye, Bug, CheckCircle2, Clock } from 'lucide-react'

function MetricCard({ icon: Icon, label, value, sub, subColor }) {
  return (
    <div className="bg-bg-panel rounded-2xl px-5 py-4 font-ui shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 text-[13px] text-text-secondary mb-2.5 font-medium">
        <Icon size={14} />
        {label}
      </div>
      <div className="text-[30px] font-sans font-semibold text-text-primary leading-none mb-2">{value}</div>
      <div className={`text-[13px] font-medium ${subColor || 'text-text-tertiary'}`}>{sub}</div>
    </div>
  )
}

export default function MetricsRow({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        icon={Eye}
        label="PRs reviewed today"
        value={stats.prs_reviewed_today}
        sub="+6 vs yesterday"
        subColor="text-sage-deep"
      />
      <MetricCard
        icon={Bug}
        label="Issues flagged"
        value={stats.issues_flagged_today}
        sub={`${stats.critical_today} critical`}
        subColor="text-severity-critical"
      />
      <MetricCard
        icon={CheckCircle2}
        label="Auto-fixed"
        value={Math.round(stats.issues_flagged_today * stats.auto_fix_rate)}
        sub={`${(stats.auto_fix_rate * 100).toFixed(1)}% fix rate`}
        subColor="text-sage-deep"
      />
      <MetricCard
        icon={Clock}
        label="Avg review time"
        value={`${stats.avg_review_seconds}s`}
        sub="per diff chunk"
      />
    </div>
  )
}
