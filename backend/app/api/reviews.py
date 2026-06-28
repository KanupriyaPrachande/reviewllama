from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.db import (
    clear_all_findings,
    get_all_critical,
    get_all_findings,
    get_category_breakdown,
    get_recent_findings,
    get_reviews_over_time,
    get_severity_breakdown,
    get_stats_today,
    save_finding,
)
from app.ml.classifier import classify_chunks
from app.models.schemas import ReviewRequest, ReviewResponse, ReviewStats
from app.services.email_notifier import send_review_email
from app.services.llm import generate_pr_summary

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewResponse)
def create_review(request: ReviewRequest) -> ReviewResponse:
    findings = classify_chunks(request.chunks)
    summary = None
    if request.generate_summary:
        summary = generate_pr_summary(
            request.pr_number, request.repo, request.chunks, findings
        )
    for finding in findings:
        save_finding(request.pr_number, request.repo, finding)
    if any(f.severity == "critical" for f in findings):
        send_review_email(request.pr_number, request.repo, findings, summary)
    return ReviewResponse(
        pr_number=request.pr_number,
        repo=request.repo,
        findings=findings,
        summary=summary,
        reviewed_at=datetime.now(timezone.utc),
    )


@router.delete("/clear")
def clear_reviews() -> dict:
    clear_all_findings()
    return {"status": "ok", "message": "All review history cleared."}


@router.get("/stats")
def get_stats() -> dict:
    return get_stats_today()


@router.get("/recent")
def get_recent(limit: int = 20) -> list[dict]:
    return get_recent_findings(limit=limit)


@router.get("/all")
def get_all(severity: str | None = None) -> list[dict]:
    return get_all_findings(severity=severity)


@router.get("/severity-breakdown")
def get_breakdown() -> dict:
    return get_severity_breakdown()


@router.get("/category-breakdown")
def get_cat_breakdown() -> dict:
    return get_category_breakdown()


@router.get("/over-time")
def get_over_time() -> list[dict]:
    return get_reviews_over_time()


@router.get("/alerts")
def get_alerts() -> list[dict]:
    return get_all_critical()