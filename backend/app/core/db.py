import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

_DB_PATH = Path(__file__).resolve().parents[2] / "reviewllama.db"


@contextmanager
def get_connection():
    conn = sqlite3.connect(_DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pr_number INTEGER NOT NULL,
                repo TEXT NOT NULL,
                file_path TEXT NOT NULL,
                line INTEGER NOT NULL,
                label TEXT NOT NULL,
                severity TEXT NOT NULL,
                confidence REAL NOT NULL,
                message TEXT NOT NULL,
                issue_category TEXT,
                reviewed_at TEXT NOT NULL
            )
        """)
        try:
            conn.execute("ALTER TABLE reviews ADD COLUMN issue_category TEXT")
        except Exception:
            pass


def clear_all_findings() -> None:
    with get_connection() as conn:
        conn.execute("DELETE FROM reviews")


def save_finding(pr_number: int, repo: str, finding) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO reviews
                (pr_number, repo, file_path, line, label, severity,
                 confidence, message, issue_category, reviewed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                pr_number, repo, finding.file_path, finding.line,
                finding.label.value, finding.severity.value,
                finding.confidence, finding.message,
                finding.issue_category,
                datetime.now(timezone.utc).isoformat(),
            ),
        )


def get_recent_findings(limit: int = 20) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM reviews ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(row) for row in rows]


def get_all_findings(severity: str | None = None) -> list[dict]:
    with get_connection() as conn:
        if severity:
            rows = conn.execute(
                "SELECT * FROM reviews WHERE severity = ? ORDER BY id DESC",
                (severity,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM reviews ORDER BY id DESC"
            ).fetchall()
        return [dict(row) for row in rows]


def get_severity_breakdown() -> dict:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT severity, COUNT(*) as count FROM reviews GROUP BY severity"
        ).fetchall()
    breakdown = {"critical": 0, "warning": 0, "info": 0}
    for row in rows:
        breakdown[row["severity"]] = row["count"]
    return breakdown


def get_category_breakdown() -> dict:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT issue_category, COUNT(*) as count FROM reviews "
            "WHERE issue_category IS NOT NULL GROUP BY issue_category"
        ).fetchall()
    return {row["issue_category"]: row["count"] for row in rows}


def get_reviews_over_time() -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT DATE(reviewed_at) as date, COUNT(*) as count
            FROM reviews GROUP BY DATE(reviewed_at)
            ORDER BY date ASC LIMIT 30
            """
        ).fetchall()
        return [dict(row) for row in rows]


def get_stats_today() -> dict:
    with get_connection() as conn:
        today = datetime.now(timezone.utc).date().isoformat()
        rows = conn.execute(
            "SELECT * FROM reviews WHERE reviewed_at >= ?", (today,)
        ).fetchall()
    total_prs = len({row["pr_number"] for row in rows}) if rows else 0
    total_issues = len(rows)
    critical = sum(1 for row in rows if row["severity"] == "critical")
    return {
        "prs_reviewed_today": total_prs,
        "issues_flagged_today": total_issues,
        "critical_today": critical,
        "auto_fix_rate": 0.0,
        "avg_review_seconds": 0.1,
    }


def get_all_critical() -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM reviews WHERE severity = 'critical' ORDER BY id DESC"
        ).fetchall()
        return [dict(row) for row in rows]