from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class Severity(str, Enum):
    critical = "critical"
    warning = "warning"
    info = "info"


class AntiPatternLabel(str, Enum):
    sql_injection = "sql_injection"
    hardcoded_secret = "hardcoded_secret"
    null_dereference = "null_dereference"
    other = "other"


class DiffChunk(BaseModel):
    file_path: str
    start_line: int
    end_line: int
    diff_text: str


class Finding(BaseModel):
    file_path: str
    line: int
    label: AntiPatternLabel
    severity: Severity
    confidence: float
    message: str
    suggested_fix: Optional[str] = None
    issue_category: Optional[str] = None


class CodeScore(BaseModel):
    correctness: int
    readability: int
    security: int
    overall: int
    rationale: str


class PRSummary(BaseModel):
    summary: str
    change_type: str
    risk_level: str
    score: Optional[CodeScore] = None


class ReviewRequest(BaseModel):
    pr_number: int
    repo: str
    chunks: list[DiffChunk]
    generate_summary: bool = True


class ReviewResponse(BaseModel):
    pr_number: int
    repo: str
    findings: list[Finding]
    summary: Optional[PRSummary] = None
    reviewed_at: datetime


class ReviewStats(BaseModel):
    prs_reviewed_today: int
    issues_flagged_today: int
    critical_today: int
    auto_fix_rate: float
    avg_review_seconds: float