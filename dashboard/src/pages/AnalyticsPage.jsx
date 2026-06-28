import { useEffect, useState } from 'react'

const BASE = '/api'
async function get(path) {
  try {
    const r = await fetch(BASE + path, { signal: AbortSignal.timeout(3000) })
    return r.ok ? r.json() : null
  } catch { return null }
}

const SEV_COLORS = { critical: '#A8463B', warning: '#B8893F', info: '#5C6B4F' }
const CAT_COLORS = { security: '#A8463B', bug: '#B8893F', performance: '#5C6B4F' }

function StatBox({ label, value, sub }) {
  return (
    <div className="bg-bg-panel rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] font-ui">
      <div className="text-[12px] text-text-secondary font-medium mb-2">{label}</div>
      <div className="text-[28px] font-sans font-semibold text-text-primary leading-none mb-1">{value}</div>
      {sub && <div className="text-[12px] text-text-tertiary font-medium">{sub}</div>}
    </div>
  )
}

function BarRow({ label, count, max, color }) {
  return (
    <div className="flex items-center gap-3 font-ui">
      <span className="text-[13px] text-text-secondary font-medium w-[110px] shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-2 bg-bg-inset rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(count / Math.max(max, 1)) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-[13px] font-mono font-semibold text-text-secondary w-7 text-right">{count}</span>
    </div>
  )
}

export default function AnalyticsPage() {
  const [sev, setSev] = useState(null)
  const [cat, setCat] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    Promise.all([
      get('/reviews/severity-breakdown'),
      get('/reviews/category-breakdown'),
      get('/reviews/over-time'),
      get('/reviews/all'),
    ]).then(([s, c, t, all]) => {
      if (s) setSev(s)
      if (c) setCat(c)
      if (t) setTimeline(t)
      if (all) setTotal(all.length)
    })
  }, [])

  const sevMax = sev ? Math.max(...Object.values(sev)) : 1
  const catMax = cat ? Math.max(...Object.values(cat)) : 1
  const timeMax = timeline.length ? Math.max(...timeline.map(r => r.count)) : 1

  return (
    <main className="flex-1 overflow-y-auto px-7 py-6 font-ui flex flex-col gap-6">
      <h2 className="text-[18px] font-semibold text-text-primary">Analytics</h2>
      <div className="grid grid-cols-3 gap-4">
        <StatBox label="Total findings" value={total} sub="all time" />
        <StatBox label="Critical" value={sev?.critical ?? 0} sub={`${sev ? Math.round((sev.critical / Math.max(total,1)) * 100) : 0}% of total`} />
        <StatBox label="Days with reviews" value={timeline.length} sub="unique days" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-bg-panel rounded-2xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.07)]">
          <h3 className="text-[14px] font-semibold text-text-primary mb-4">By severity</h3>
          {sev ? (
            <div className="flex flex-col gap-3">
              {Object.entries(sev).map(([k, v]) => <BarRow key={k} label={k} count={v} max={sevMax} color={SEV_COLORS[k] || '#9C9587'} />)}
            </div>
          ) : <p className="text-[13px] text-text-tertiary">No data yet.</p>}
        </div>
        <div className="bg-bg-panel rounded-2xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.07)]">
          <h3 className="text-[14px] font-semibold text-text-primary mb-4">By category</h3>
          {cat && Object.keys(cat).length > 0 ? (
            <div className="flex flex-col gap-3">
              {Object.entries(cat).map(([k, v]) => <BarRow key={k} label={k} count={v} max={catMax} color={CAT_COLORS[k] || '#9C9587'} />)}
            </div>
          ) : <p className="text-[13px] text-text-tertiary">Submit reviews to see category breakdown.</p>}
        </div>
      </div>
      <div className="bg-bg-panel rounded-2xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.07)]">
        <h3 className="text-[14px] font-semibold text-text-primary mb-4">Reviews over time</h3>
        {timeline.length === 0 ? (
          <p className="text-[13px] text-text-tertiary">No timeline data yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-24">
            {timeline.map(row => (
              <div key={row.date} className="flex-1 flex flex-col items-center gap-1" title={`${row.date}: ${row.count}`}>
                <div className="w-full rounded-t-sm bg-sage transition-all" style={{ height: `${(row.count / timeMax) * 80}px`, minHeight: '4px' }} />
                <span className="text-[9px] text-text-tertiary">{row.date.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}