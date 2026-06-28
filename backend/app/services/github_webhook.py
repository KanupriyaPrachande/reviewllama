import hashlib
import hmac
import os

import httpx

from app.models.schemas import DiffChunk

_GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
_WEBHOOK_SECRET = os.environ.get("GITHUB_WEBHOOK_SECRET", "")

_HEADERS = {
    "Authorization": f"token {_GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3.diff",
}


def verify_signature(payload_bytes: bytes, signature_header: str) -> bool:
    if not _WEBHOOK_SECRET:
        return True
    expected = "sha256=" + hmac.new(
        _WEBHOOK_SECRET.encode(), payload_bytes, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header or "")


def fetch_pr_diff(repo: str, pr_number: int) -> list[DiffChunk]:
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
    try:
        response = httpx.get(url, headers=_HEADERS, timeout=15)
        response.raise_for_status()
        diff_text = response.text
        chunks = []
        current_file = "unknown"
        current_lines = []
        current_line = 1
        for line in diff_text.splitlines():
            if line.startswith("diff --git"):
                if current_lines:
                    chunks.append(DiffChunk(file_path=current_file, start_line=current_line, end_line=current_line + len(current_lines), diff_text="\n".join(current_lines)))
                current_lines = []
                current_line = 1
            elif line.startswith("+++ b/"):
                current_file = line[6:]
            elif line.startswith("@@ "):
                try:
                    current_line = int(line.split("+")[1].split(",")[0])
                except Exception:
                    current_line = 1
            else:
                current_lines.append(line)
        if current_lines:
            chunks.append(DiffChunk(file_path=current_file, start_line=current_line, end_line=current_line + len(current_lines), diff_text="\n".join(current_lines)))
        return chunks[:20]
    except Exception as e:
        print(f"[webhook] Failed to fetch PR diff: {e}")
        return []


def post_pr_comment(repo: str, pr_number: int, body: str) -> bool:
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    headers = {"Authorization": f"token {_GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
    try:
        response = httpx.post(url, headers=headers, json={"body": body}, timeout=15)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"[webhook] Failed to post comment: {e}")
        return False


def format_review_comment(findings, summary) -> str:
    lines = ["## 🦙 ReviewLlama — Automated Code Review\n"]
    if summary:
        lines.append(f"**Summary:** {summary.summary}\n")
        lines.append(f"**Change type:** `{summary.change_type}` · **Risk:** `{summary.risk_level}`\n")
        if summary.score:
            s = summary.score
            lines.append(f"**Scores:** Correctness {s.correctness}/10 · Readability {s.readability}/10 · Security {s.security}/10 · **Overall {s.overall}/10**\n")
            lines.append(f"_{s.rationale}_\n")
    if findings:
        lines.append(f"\n### Issues flagged ({len(findings)})\n")
        for f in findings:
            emoji = "🔴" if f.severity == "critical" else "🟡" if f.severity == "warning" else "🔵"
            lines.append(f"{emoji} **{f.issue_category or f.severity}** · `{f.file_path}:{f.line}` · {f.message} _(confidence: {int(f.confidence * 100)}%)_")
    else:
        lines.append("\n✅ No issues flagged by ML classifier.")
    lines.append("\n---\n_Reviewed by ReviewLlama · ML classifier + Claude summary_")
    return "\n".join(lines)