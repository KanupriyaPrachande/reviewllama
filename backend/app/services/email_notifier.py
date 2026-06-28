import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

_SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
_SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
_SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "")
_SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
_NOTIFICATION_EMAILS = os.environ.get("NOTIFICATION_EMAILS", "")
_EMAIL_ENABLED = os.environ.get("EMAIL_ENABLED", "false").lower() == "true"


def _build_html(pr_number, repo, findings, summary) -> str:
    severity_color = {"critical": "#A8463B", "warning": "#B8893F", "info": "#5C6B4F"}
    rows = ""
    for f in findings:
        color = severity_color.get(f.severity, "#5C6B4F")
        rows += f'<tr><td style="padding:8px;border-bottom:1px solid #eee;font-family:monospace">{f.file_path}:{f.line}</td><td style="padding:8px;border-bottom:1px solid #eee;color:{color};font-weight:bold">{(f.issue_category or f.severity).upper()}</td><td style="padding:8px;border-bottom:1px solid #eee">{f.message}</td><td style="padding:8px;border-bottom:1px solid #eee;font-family:monospace">{int(f.confidence*100)}%</td></tr>'
    summary_block = f'<div style="background:#f7f5ef;border-radius:8px;padding:16px;margin-bottom:20px"><strong>PR Summary:</strong> {summary.summary}<br><strong>Change type:</strong> {summary.change_type} &nbsp;·&nbsp; <strong>Risk:</strong> {summary.risk_level}</div>' if summary else ""
    return f'<html><body style="font-family:Inter,sans-serif;color:#2b2a26;max-width:600px;margin:0 auto;padding:20px"><h2 style="color:#3f4a38">🦙 ReviewLlama — PR #{pr_number} Review</h2><p style="color:#6b6557">Repository: <strong>{repo}</strong></p>{summary_block}<table width="100%" style="border-collapse:collapse;margin-top:16px"><thead><tr style="background:#f0ede5"><th style="padding:8px;text-align:left">File</th><th style="padding:8px;text-align:left">Type</th><th style="padding:8px;text-align:left">Message</th><th style="padding:8px;text-align:left">Confidence</th></tr></thead><tbody>{rows or "<tr><td colspan=4 style=padding:16px;text-align:center;color:#9c9587>No issues found</td></tr>"}</tbody></table><p style="color:#9c9587;font-size:12px;margin-top:24px">Reviewed by ReviewLlama · ML classifier + Claude summary</p></body></html>'


def send_review_email(pr_number, repo, findings, summary=None) -> bool:
    if not _EMAIL_ENABLED or not _SMTP_USERNAME or not _SMTP_PASSWORD:
        return False
    recipients = [e.strip() for e in _NOTIFICATION_EMAILS.split(",") if e.strip()]
    if not recipients:
        return False
    critical_count = sum(1 for f in findings if f.severity == "critical")
    subject = f"🔴 ReviewLlama: {critical_count} critical issue(s) in PR #{pr_number} [{repo}]" if critical_count else f"✅ ReviewLlama: PR #{pr_number} reviewed — no critical issues [{repo}]"
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = _SMTP_USERNAME
    msg["To"] = ", ".join(recipients)
    msg.attach(MIMEText(_build_html(pr_number, repo, findings, summary), "html"))
    try:
        with smtplib.SMTP(_SMTP_SERVER, _SMTP_PORT) as server:
            server.starttls()
            server.login(_SMTP_USERNAME, _SMTP_PASSWORD)
            server.sendmail(_SMTP_USERNAME, recipients, msg.as_string())
        print(f"[email] Sent review email for PR #{pr_number} to {recipients}")
        return True
    except Exception as e:
        print(f"[email] Failed to send email: {e}")
        return False