from fastapi import APIRouter, HTTPException, Request

from app.core.db import save_finding
from app.ml.classifier import classify_chunks
from app.services.email_notifier import send_review_email
from app.services.github_webhook import (
    fetch_pr_diff,
    format_review_comment,
    post_pr_comment,
    verify_signature,
)
from app.services.llm import generate_pr_summary

router = APIRouter(prefix="/webhook", tags=["webhook"])


@router.post("/github")
async def github_webhook(request: Request):
    payload_bytes = await request.body()
    signature = request.headers.get("X-Hub-Signature-256", "")

    if not verify_signature(payload_bytes, signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    payload = await request.json()
    event = request.headers.get("X-GitHub-Event", "")

    if event != "pull_request":
        return {"status": "ignored", "reason": f"event={event}"}

    action = payload.get("action", "")
    if action not in ("opened", "reopened", "synchronize"):
        return {"status": "ignored", "reason": f"action={action}"}

    pr = payload.get("pull_request", {})
    pr_number = pr.get("number")
    repo = payload.get("repository", {}).get("full_name", "unknown/repo")

    chunks = fetch_pr_diff(repo, pr_number)
    if not chunks:
        return {"status": "ok", "message": "No diff chunks found"}

    findings = classify_chunks(chunks)
    summary = generate_pr_summary(pr_number, repo, chunks, findings)

    for finding in findings:
        save_finding(pr_number, repo, finding)

    post_pr_comment(repo, pr_number, format_review_comment(findings, summary))
    send_review_email(pr_number, repo, findings, summary)

    return {"status": "ok", "pr_number": pr_number, "findings": len(findings), "summary_generated": summary is not None}