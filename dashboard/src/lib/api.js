const BASE_URL = 'https://reviewllama-production.up.railway.app'

const EMPTY_STATS = {
  prs_reviewed_today: 0,
  issues_flagged_today: 0,
  critical_today: 0,
  auto_fix_rate: 0,
  avg_review_seconds: 0,
}

const EMPTY_BREAKDOWN = { critical: 0, warning: 0, info: 0 }

async function safeFetch(path, fallback) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) throw new Error(`${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn(`API unavailable for ${path}.`, err.message)
    return fallback
  }
}

export function fetchStats() {
  return safeFetch('/reviews/stats', EMPTY_STATS)
}

export function fetchHealth() {
  return safeFetch('/health', { status: 'offline', env: 'offline' })
}

export function fetchSeverityBreakdown() {
  return safeFetch('/reviews/severity-breakdown', EMPTY_BREAKDOWN)
}

function timeAgo(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

function rowToFinding(row) {
  return {
    id: `db-${row.id}`,
    pr_number: row.pr_number,
    repo: row.repo,
    file_path: row.file_path,
    line: row.line,
    label: row.label,
    severity: row.severity,
    confidence: row.confidence,
    message: row.message,
    time_ago: timeAgo(row.reviewed_at),
  }
}

export async function fetchRecentFindings() {
  const rows = await safeFetch('/reviews/recent?limit=20', [])
  return rows.map(rowToFinding)
}

export async function fetchAllFindings(severity = null) {
  const query = severity ? `?severity=${severity}` : ''
  const rows = await safeFetch(`/reviews/all${query}`, [])
  return rows.map(rowToFinding)
}