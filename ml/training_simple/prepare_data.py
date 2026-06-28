"""
Step 1: Download the real PR review dataset and save a clean, manageable
CSV locally. Run this once.

Usage:
    python prepare_data.py
"""

import json
import random

from datasets import load_dataset

random.seed(42)

print("Downloading dataset (this happens once, may take a minute)...")
ds = load_dataset("ronantakizawa/github-codereview")

TARGET_TYPES = {"bug", "security", "performance"}
MAX_PER_CLASS = 1500  # small and fast - total ~6000 rows
MIN_QUALITY = 0.4


def keep(row):
    if row["is_negative"]:
        return True
    return row["comment_type"] in TARGET_TYPES and row["quality_score"] >= MIN_QUALITY


print("Filtering...")
filtered = ds["train"].filter(keep)

buckets = {"negative": [], "bug": [], "security": [], "performance": []}
for i, row in enumerate(filtered):
    key = "negative" if row["is_negative"] else row["comment_type"]
    if len(buckets[key]) < MAX_PER_CLASS:
        buckets[key].append(i)

keep_indices = [i for idxs in buckets.values() for i in idxs]
random.shuffle(keep_indices)
subset = filtered.select(keep_indices)

print("Class counts:")
for k, v in buckets.items():
    print(f"  {k}: {len(v)}")

rows = []
for row in subset:
    code = (row["diff_context"] or row["before_code"] or "")[:1000]
    if not code.strip():
        continue
    label = 0 if row["is_negative"] else 1  # 0 = no issue, 1 = issue
    issue_type = "none" if row["is_negative"] else row["comment_type"]
    rows.append({"code": code, "label": label, "issue_type": issue_type})

with open("training_data.jsonl", "w") as f:
    for r in rows:
        f.write(json.dumps(r) + "\n")

print(f"\nSaved {len(rows)} examples to training_data.jsonl")
print("Next step: run train_classifier.py")
