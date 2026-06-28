import { useState } from 'react'

export default function ThresholdsPage() {
  const [confidence, setConfidence] = useState(60)
  const [criticalThreshold, setCriticalThreshold] = useState(85)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="flex-1 overflow-y-auto px-7 py-6 font-ui flex flex-col gap-6">
      <h2 className="text-[18px] font-semibold text-text-primary">Thresholds</h2>
      <p className="text-[14px] text-text-secondary -mt-3">Adjust confidence cutoffs that determine when the model flags an issue.</p>
      <div className="bg-bg-panel rounded-2xl p-6 shadow-[0_2px_14px_rgba(0,0,0,0.07)] flex flex-col gap-6 max-w-lg">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[14px] font-semibold text-text-primary">Minimum confidence to flag</label>
            <span className="text-[14px] font-mono font-bold text-brass-deep">{confidence}%</span>
          </div>
          <input type="range" min="30" max="95" value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-full accent-[#5C6B4F]" />
          <p className="text-[12px] text-text-tertiary mt-1.5">Issues below this confidence score are ignored. Lower = more findings, higher false positive rate.</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[14px] font-semibold text-text-primary">Critical severity threshold</label>
            <span className="text-[14px] font-mono font-bold text-severity-critical">{criticalThreshold}%</span>
          </div>
          <input type="range" min="60" max="99" value={criticalThreshold} onChange={e => setCriticalThreshold(Number(e.target.value))} className="w-full accent-[#A8463B]" />
          <p className="text-[12px] text-text-tertiary mt-1.5">Issues at or above this confidence are marked Critical and trigger email alerts.</p>
        </div>
        <div className="pt-2 border-t border-border-subtle">
          <div className="text-[13px] text-text-secondary mb-3">
            Findings below <strong>{confidence}%</strong> are ignored · {confidence}–{criticalThreshold - 1}% → <span className="text-severity-warning font-semibold">Warning</span> · {criticalThreshold}%+ → <span className="text-severity-critical font-semibold">Critical</span>
          </div>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-sage-deep text-bg-panel text-[13px] font-semibold hover:bg-sage transition-colors">
            {saved ? '✓ Saved' : 'Save thresholds'}
          </button>
        </div>
      </div>
    </main>
  )
}