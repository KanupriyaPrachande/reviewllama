import json
import os

import httpx

from app.models.schemas import CodeScore, DiffChunk, Finding, PRSummary

_GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
_API_KEY = os.environ.get("GEMINI_API_KEY", "AQ.Ab8RN6KskIM-P3u-qX0k9zWKYU3MnWCWc1balslmw9F24yy9wQ")


def _build_diff_text(chunks: list[DiffChunk]) -> str:
    parts = []
    for chunk in chunks[:5]:
        parts.append(f"File: {chunk.file_path} (line {chunk.start_line})\n{chunk.diff_text}")
    return "\n\n---\n\n".join(parts)


def _call_gemini(prompt: str) -> str | None:
    if not _API_KEY:
        print("[llm] GEMINI_API_KEY not set — skipping LLM summary.")
        return None
    try:
        response = httpx.post(
            f"{_GEMINI_URL}?key={_API_KEY}",
            headers={"content-type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.1, "maxOutputTokens": 600},
            },
            timeout=20,
        )
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"[llm] Gemini API call failed: {e}")
        return None


def generate_pr_summary(
    pr_number: int,
    repo: str,
    chunks: list[DiffChunk],
    findings: list[Finding],
) -> PRSummary | None:
    diff_text = _build_diff_text(chunks)
    findings_text = "\n".join(
        f"- [{f.issue_category or f.severity}] {f.file_path}:{f.line} — {f.message}"
        for f in findings
    ) or "No issues flagged by ML classifier."

    prompt = f"""You are a senior software engineer reviewing a pull request.

PR #{pr_number} in repo {repo}

Code changes:
{diff_text}

Issues flagged by ML classifier:
{findings_text}

Respond ONLY with a JSON object, no markdown fences, no explanation, just raw JSON:
{{
  "summary": "<2-3 sentences explaining what this PR does and any notable risks>",
  "change_type": "<one of: feature, fix, refactor, security, other>",
  "risk_level": "<one of: low, medium, high>",
  "score": {{
    "correctness": <integer 1-10>,
    "readability": <integer 1-10>,
    "security": <integer 1-10>,
    "overall": <integer 1-10>,
    "rationale": "<1 sentence explaining the overall score>"
  }}
}}"""

    raw = _call_gemini(prompt)
    if not raw:
        return None

    try:
        # Strip markdown fences if Gemini adds them despite instructions
        clean = raw.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        clean = clean.strip()
        data = json.loads(clean)
        score = CodeScore(**data["score"]) if "score" in data else None
        return PRSummary(
            summary=data["summary"],
            change_type=data.get("change_type", "other"),
            risk_level=data.get("risk_level", "medium"),
            score=score,
        )
    except Exception as e:
        print(f"[llm] Failed to parse Gemini response: {e}\nRaw: {raw}")
        return None