# ReviewLlama

LLM-powered code review assistant. Fine-tuned CodeLlama classifier for anti-pattern
detection, served via FastAPI, surfaced through a GitHub bot and a live React dashboard.

## Architecture

```
GitHub PR webhook -> Diff parser -> Feature extractor -> Redis queue
                                                              |
                                                              v
                              CodeLlama classifier -> Severity ranker
                                                              |
                                                              v
                    FastAPI -> Postgres (audit log) -> Dashboard / GitHub bot / Slack
```

## Project layout

```
reviewllama/
  backend/        FastAPI service, ML inference, GitHub/Slack integrations
    app/
      api/        Route handlers (reviews, webhooks, stats)
      core/       Config, settings, logging
      ml/         Model loading, inference, classification logic
      models/     SQLAlchemy + Pydantic schemas
      services/   GitHub bot, Slack notifier, diff parser
    tests/
    scripts/      Training data prep, eval scripts
  ml/
    training/     Fine-tuning scripts (PEFT/LoRA on CodeLlama)
    data/         PR diff datasets (not committed - see .gitignore)
    notebooks/    Exploration, eval, metrics analysis
  dashboard/      React + Vite frontend
```



## Status

- [ ] FastAPI skeleton + health check
- [ ] Diff parser (unified diff -> structured chunks)
- [ ] CodeLlama fine-tuning pipeline (LoRA)
- [ ] Anti-pattern classifier + severity ranker
- [ ] Postgres models + audit logging
- [ ] GitHub webhook + bot comment posting
- [ ] Slack notifier
- [ ] React dashboard
- [ ] Eval metrics (precision/recall/FPR) on held-out PRs
