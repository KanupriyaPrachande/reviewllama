"""
Step 2: Train a lightweight bug-detection classifier on CPU. Takes seconds,
not hours. Run this after prepare_data.py.

Technique: TF-IDF (turns code text into a vector of word/token frequencies)
+ Logistic Regression (a simple, well-understood classifier). This is a
completely standard, legitimate ML approach used widely in real text
classification systems - it's not a toy.

Usage:
    python train_classifier.py
"""

import json

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    recall_score,
    precision_score,
    confusion_matrix,
    classification_report,
)

print("Loading training_data.jsonl...")
rows = []
with open("training_data.jsonl") as f:
    for line in f:
        rows.append(json.loads(line))

codes = [r["code"] for r in rows]
labels = [r["label"] for r in rows]

print(f"Total examples: {len(codes)}")
print(f"  Issues (label=1): {sum(labels)}")
print(f"  No issue (label=0): {len(labels) - sum(labels)}")

X_train, X_test, y_train, y_test = train_test_split(
    codes, labels, test_size=0.2, random_state=42, stratify=labels
)

print("\nVectorizing code text with TF-IDF...")
vectorizer = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),  # unigrams and bigrams capture short code patterns
    token_pattern=r"\S+",  # split on whitespace, keeps symbols like ( ) = " intact
)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

print("Training logistic regression classifier...")
model = LogisticRegression(max_iter=1000, class_weight="balanced", C=1.0)
model.fit(X_train_vec, y_train)

print("\nEvaluating on held-out test set...")
y_pred = model.predict(X_test_vec)

recall = recall_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
cm = confusion_matrix(y_test, y_pred, labels=[1, 0])
# cm layout: rows=true [issue, no_issue], cols=pred [issue, no_issue]
fp = cm[1][0]  # true=no_issue, predicted=issue
tn = cm[1][1]
fpr = fp / (fp + tn) if (fp + tn) > 0 else 0

print(f"\n{'=' * 50}")
print(f"RESULTS (real, measured on held-out test data)")
print(f"{'=' * 50}")
print(f"Recall (catching real issues):      {recall:.1%}")
print(f"Precision:                          {precision:.1%}")
print(f"False positive rate (on clean code): {fpr:.1%}")
print(f"\nFull classification report:")
print(classification_report(y_test, y_pred, target_names=["no_issue", "issue"]))

print("Saving model and vectorizer...")
joblib.dump(model, "classifier.joblib")
joblib.dump(vectorizer, "vectorizer.joblib")

with open("metrics.json", "w") as f:
    json.dump(
        {
            "recall": round(recall, 4),
            "precision": round(precision, 4),
            "false_positive_rate": round(fpr, 4),
            "train_size": len(X_train),
            "test_size": len(X_test),
        },
        f,
        indent=2,
    )

print("\nDone. Saved: classifier.joblib, vectorizer.joblib, metrics.json")
print("Next step: copy these 3 files into backend/app/ml/ and wire up real inference.")
