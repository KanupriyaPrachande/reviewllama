from pathlib import Path

import joblib

from app.models.schemas import AntiPatternLabel, DiffChunk, Finding, Severity

_MODEL_DIR = Path(__file__).resolve().parents[3] / "ml" / "training_simple"
_CLASSIFIER_PATH = _MODEL_DIR / "classifier.joblib"
_VECTORIZER_PATH = _MODEL_DIR / "vectorizer.joblib"

_model = None
_vectorizer = None
_model_loaded = False

if _CLASSIFIER_PATH.exists() and _VECTORIZER_PATH.exists():
    _model = joblib.load(_CLASSIFIER_PATH)
    _vectorizer = joblib.load(_VECTORIZER_PATH)
    _model_loaded = True
    print(f"[classifier] Loaded model. Classes: {_model.classes_}")
else:
    print(f"[classifier] WARNING: trained model not found at {_MODEL_DIR}. Using rule-based fallback.")

_LABEL_MAP = {
    "bug": AntiPatternLabel.null_dereference,
    "security": AntiPatternLabel.sql_injection,
    "performance": AntiPatternLabel.other,
    "1": AntiPatternLabel.other,
    "0": None,
}

_SEVERITY_MAP = {
    "security": Severity.critical,
    "bug": Severity.warning,
    "performance": Severity.info,
    "1": Severity.warning,
}

_MESSAGE_MAP = {
    "security": "Security vulnerability detected. Likely unsafe input handling, hardcoded credentials, or injection risk.",
    "bug": "Bug pattern detected. Possible null dereference, unhandled exception, or logic error.",
    "performance": "Performance issue detected. Possible unbounded loop, N+1 query, or unnecessary computation.",
    "1": "Potential issue detected by ML classifier.",
}

_RULES = [
    ("SELECT * FROM", AntiPatternLabel.sql_injection, Severity.critical, "SQL injection risk."),
    ('API_KEY = "', AntiPatternLabel.hardcoded_secret, Severity.warning, "Hardcoded credential."),
    ('.get("', AntiPatternLabel.null_dereference, Severity.info, "Unguarded dict.get()."),
]


def _classify_with_model(chunk: DiffChunk) -> list[Finding]:
    vec = _vectorizer.transform([chunk.diff_text])
    pred = str(_model.predict(vec)[0])
    proba = _model.predict_proba(vec)[0]
    classes = [str(c) for c in _model.classes_]
    confidence = float(proba[classes.index(pred)]) if pred in classes else 0.5

    if pred in ("0", "none"):
        return []

    label = _LABEL_MAP.get(pred, AntiPatternLabel.other)
    if label is None:
        return []

    return [Finding(
        file_path=chunk.file_path,
        line=chunk.start_line,
        label=label,
        severity=_SEVERITY_MAP.get(pred, Severity.info),
        confidence=round(confidence, 4),
        message=_MESSAGE_MAP.get(pred, f"Potential issue detected."),
        suggested_fix=None,
        issue_category=pred,
    )]


def _classify_with_rules(chunk: DiffChunk) -> list[Finding]:
    findings = []
    for pattern, label, severity, message in _RULES:
        if pattern in chunk.diff_text:
            findings.append(Finding(
                file_path=chunk.file_path,
                line=chunk.start_line,
                label=label,
                severity=severity,
                confidence=0.85,
                message=message,
                suggested_fix=None,
                issue_category="security",
            ))
    return findings


def classify_chunk(chunk: DiffChunk) -> list[Finding]:
    if _model_loaded:
        return _classify_with_model(chunk)
    return _classify_with_rules(chunk)


def classify_chunks(chunks: list[DiffChunk]) -> list[Finding]:
    results = []
    for chunk in chunks:
        results.extend(classify_chunk(chunk))
    return results