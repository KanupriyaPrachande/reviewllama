import { useState } from 'react'
import { ShieldAlert, KeyRound, CircleSlash, Sparkles, Loader } from 'lucide-react'

const SEVERITY_STYLES = {
  critical: { text: 'text-severity-critical', bg: 'bg-severity-criticalBg', accent: '#1E4642' },
  warning: { text: 'text-severity-warning', bg: 'bg-severity-warningBg', accent: '#B8893F' },
  info: { text: 'text-severity-info', bg: 'bg-severity-infoBg', accent: '#5C6B4F' },
}

const LABEL_ICONS = { sql_injection: ShieldAlert, hardcoded_secret: KeyRound, null_dereference: CircleSlash }
const CATEGORY_LABELS = { security: '🔒 Security vulnerability', bug: '🐛 Bug pattern', performance: '⚡ Performance issue' }

const EXAMPLES = [
  { label: 'SQL injection', code: 'query = "SELECT * FROM users WHERE id=" + user_id\ncursor.execute(query)' },
  { label: 'Hardcoded secret', code: 'API_KEY = "sk-prod-a8f3c2e1d9b4"\nresponse = requests.get(url, headers={"Authorization": API_KEY})' },
  { label: 'Clean code', code: 'def calculate_total(items):\n    return sum(item.price for item in items if item.active)' },
]

export default function CodeReviewPanel() {
  const [code, setCode] = useState('')
  const [fileName, setFileName] = useState('review.py')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleReview() {
    if (!code.trim()) return
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          pr_number: Math.floor(Math.random() * 1000) + 100,
          repo: 'dashboard/manual-review',
          generate_summary: true,
          chunks: [{ file_path: fileName || 'review.py', start_line: 1, end_line: code.split('\n').length, diff_text: code }],
        }),
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      setResult(await res.json())
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ background: 'var(--color-background-primary, #fff)', borderRadius: '16px', boxShadow: '0 2px 14px rgba(0,0,0,0.07)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E3DECE' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0', color: '#1A1916' }}>Live code review</h3>
        <p style={{ fontSize: '13px', color: '#4A4538', margin: 0 }}>Paste any code snippet and get instant ML + AI analysis.</p>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => { setCode(ex.code); setFileName(ex.label.toLowerCase().replace(' ', '_') + '.py') }}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #E3DECE', fontSize: '12px', fontWeight: 500, color: '#4A4538', background: 'transparent', cursor: 'pointer' }}
            >
              Try: {ex.label}
            </button>
          ))}
          <input
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            placeholder="filename.py"
            style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '12px', background: '#EFEBE1', border: '1px solid #E3DECE', borderRadius: '8px', padding: '6px 12px', color: '#4A4538', width: '140px', outline: 'none' }}
          />
        </div>

        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Paste your code here..."
          rows={8}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px', background: '#EFEBE1', border: '1px solid #E3DECE', borderRadius: '12px', padding: '12px 16px', color: '#1A1916', resize: 'none', outline: 'none', lineHeight: '1.6', boxSizing: 'border-box' }}
        />

        <button
          onClick={handleReview}
          disabled={loading || !code.trim()}
          style={{ alignSelf: 'flex-start', padding: '10px 20px', borderRadius: '8px', background: '#3F4A38', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: loading || !code.trim() ? 'not-allowed' : 'pointer', opacity: loading || !code.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {loading ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Reviewing...</> : '🔍 Review code'}
        </button>

        {error && (
          <div style={{ background: '#F3E2DE', color: '#A8463B', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', fontWeight: 500 }}>
            Error: {error}. Make sure the backend is running at localhost:8000.
          </div>
        )}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {result.summary && (
              <div style={{ background: '#EFEBE1', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#7A7464', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Summary</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#E8EBE0', color: '#3F4A38', fontWeight: 600 }}>{result.summary.change_type}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600, marginLeft: 'auto', background: result.summary.risk_level === 'high' ? '#F3E2DE' : result.summary.risk_level === 'medium' ? '#F3E8D3' : '#E5EEE0', color: result.summary.risk_level === 'high' ? '#A8463B' : result.summary.risk_level === 'medium' ? '#B8893F' : '#4F7A4A' }}>
                    {result.summary.risk_level} risk
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#4A4538', lineHeight: '1.6', margin: 0 }}>{result.summary.summary}</p>
                {result.summary.score && (
                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E3DECE' }}>
                    {['correctness', 'readability', 'security', 'overall'].map(k => (
                      <div key={k} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#92692C' }}>{result.summary.score[k]}</div>
                        <div style={{ fontSize: '10px', color: '#7A7464', textTransform: 'capitalize' }}>{k}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {result.findings.length === 0 ? (
              <div style={{ background: '#E5EEE0', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: '#4F7A4A', fontWeight: 600 }}>
                ✅ No issues detected — code looks clean.
              </div>
            ) : (
              result.findings.map((f, i) => {
                const sev = SEVERITY_STYLES[f.severity] || SEVERITY_STYLES.info
                const Icon = LABEL_ICONS[f.label] || Sparkles
                return (
                  <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', borderLeft: `4px solid ${sev.accent}` }}>
                    <div style={{ padding: '12px 16px', background: f.severity === 'critical' ? '#F3E2DE' : f.severity === 'warning' ? '#F3E8D3' : '#DEEAE8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Icon size={15} className={sev.text} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: f.severity === 'critical' ? '#A8463B' : f.severity === 'warning' ? '#B8893F' : '#2C5F5A' }}>
                          {CATEGORY_LABELS[f.issue_category] || 'Potential issue'}
                        </span>
                        <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#4A4538' }}>
                          {Math.round(f.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#4A4538', lineHeight: '1.5', margin: 0 }}>{f.message}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}