export default function TopBar({ apiStatus }) {
  const isLive = apiStatus === 'ok'

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-7 bg-bg font-ui">
      <div className="flex items-center gap-3">
        <h1 className="text-[16px] font-semibold text-text-primary">Review dashboard</h1>
        <span className="text-text-tertiary">/</span>
        <span className="text-[14px] text-text-secondary font-mono font-medium">main</span>
      </div>
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-semibold ${
            isLive ? 'bg-sage-bg text-sage-deep' : 'bg-bg-inset text-text-secondary'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-sage-deep pulse-dot' : 'bg-text-tertiary'}`} />
          {isLive ? 'Live' : 'Demo data'}
        </div>
        <span className="text-[14px] text-text-secondary font-medium">3 open PRs</span>
      </div>
    </header>
  )
}
