# Lightweight classifier training (no GPU, no Colab needed)

This replaces the LLM fine-tuning approach. Instead of fine-tuning a 1.3B+
parameter language model (slow, fragile, needs a GPU), this trains a small,
fast classifier directly on your laptop's CPU. Done in under a minute.

## What it actually does

1. `prepare_data.py` downloads the same real dataset (356K real GitHub PR
   review comments) and saves a clean ~6000-row sample to `training_data.jsonl`
2. `train_classifier.py` converts each code snippet into a TF-IDF vector
   (a standard text-to-numbers technique - counts which words/symbols appear
   and how often) and trains a Logistic Regression model to predict
   "issue" vs "no issue"
3. It evaluates on a real held-out test split and prints actual recall,
   precision, and false positive rate - not placeholders
4. It saves three files: `classifier.joblib`, `vectorizer.joblib` (the
   trained model), and `metrics.json` (your real measured numbers)

## Why this is a legitimate ML approach to put on a resume

TF-IDF + Logistic Regression is a real, widely-used technique for text
classification - it's not a toy. It's fast and interpretable, which makes
it easy to explain in an interview: "I used TF-IDF to vectorize code diffs
and trained a logistic regression classifier, achieving X% recall and Y%
false positive rate on a held-out test set from real GitHub PR data."

That sentence is fully true and fully defensible, which matters more than
a half-finished LLM fine-tune.

## Run it

```bash
cd ml/training_simple
pip install -r requirements.txt --break-system-packages
python prepare_data.py
python train_classifier.py
```

Takes roughly 1-3 minutes total depending on your machine. Watch the
printed output of `train_classifier.py` - that's your real recall/precision/
false positive rate. Use those numbers (not 73%/8%) everywhere from now on:
README, resume bullet, this dashboard's sidebar.

## Next step

Copy `classifier.joblib` and `vectorizer.joblib` into `backend/app/ml/` -
the backend wiring to load and use them comes next.
