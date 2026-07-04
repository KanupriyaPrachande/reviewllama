import asyncio
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks

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


def process_pr_review(repo: str, pr_number: int):
    chunks = fetch_pr_diff(repo, pr_number)
    if not chunks:
        return

    findings = classify_chunks(chunks)
    summary = generate_pr_summary(pr_number, repo, chunks, findings)

    for finding in findings:
        save_finding(pr_number, repo, finding)

    comment = format_review_comment(findings, summary)
    post_pr_comment(repo, pr_number, comment)
    send_review_email(pr_number, repo, findings, summary)


@router.post("/github")
async def github_webhook(request: Request, background_tasks: BackgroundTasks):
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

    # Respond to GitHub immediately, process in background
    background_tasks.add_task(process_pr_review, repo, pr_number)

    return {"status": "ok", "message": "Review queued"}