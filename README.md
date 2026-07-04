<p align="center">
 <img width="398" height="114" alt="reviewllama-logo" src="https://github.com/user-attachments/assets/85a4f194-be19-4c59-aedb-cfad480d1830" />
</p>

<p align="center">
  <a href="https://github.com/KanupriyaPrachande/reviewllama"><img src="https://img.shields.io/badge/GitHub-reviewllama-181717?logo=github" alt="GitHub repo"></a>
  <a href="https://github.com/KanupriyaPrachande/reviewllama/pulls"><img src="https://img.shields.io/badge/Pull%20Requests-open-brightgreen?logo=github" alt="Pull Requests"></a>
  <a href="https://github.com/KanupriyaPrachande/reviewllama/stargazers"><img src="https://img.shields.io/github/stars/KanupriyaPrachande/reviewllama?style=social" alt="Stars"></a>
  <img src="https://img.shields.io/badge/Python-3.11+-blue?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-backend-009688?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-dashboard-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/scikit--learn-ML-F7931E?logo=scikit-learn" alt="scikit-learn">
  <img src="https://img.shields.io/badge/Gemini-1.5%20Flash-4285F4?logo=googlegemini" alt="Gemini">
</p>

## 🎯 What is ReviewLlama?

**ReviewLlama** is a hybrid ML + LLM code review assistant. A lightweight, fully interpretable **TF-IDF + Logistic Regression classifier** scans every PR diff for security, bug, and performance anti-patterns, and **Gemini 1.5 Flash** adds the contextual layer on top — summarizing what the PR actually does, scoring its risk, and explaining *why* the findings matter.

Instead of waiting on a human reviewer to catch the same recurring issues, ReviewLlama reads the diff the moment a PR is opened, comments back on GitHub with what it found, and logs everything to a live **React dashboard** — so your team spends review time on design and logic, not boilerplate mistakes.

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 TF-IDF + Logistic Regression classifier | Trained on 6,000 real GitHub PR review comments; interpretable, sub-millisecond inference |
| 💬 Gemini-powered summaries | Contextual PR summary, change type, risk level, and quality scores (correctness, readability, security, overall) |
| 🚦 Severity ranking | Findings are ranked so the most important issues surface first |
| 🤖 GitHub bot | Verifies webhook signatures (HMAC-SHA256) and comments directly on pull requests with findings |
| ⚡ Async webhook handling | Responds to GitHub instantly, processes the review in the background — no webhook timeouts |
| 📧 Email alerts | Sends HTML email notifications when critical issues are found |
| 📊 React dashboard | Live feed, historical reviews, analytics, and alerts — all backed by a custom design system |
| 📈 Eval metrics | Precision / recall / false-positive rate measured on a held-out test set |

## 📐 Measured Model Performance

| Metric | Score |
|---|---|
| Recall | 88.7% |
| Precision | 92.5% |
| False positive rate | 21.7% (known limitation — training data is ~3x more issue examples than clean examples) |

Trained and evaluated on the [`ronantakizawa/github-codereview`](https://huggingface.co/datasets/ronantakizawa/github-codereview) dataset — 356,000 real GitHub PR review comments across 37 languages, filtered to 6,000 balanced, high-quality examples with an 80/20 train/test split.

## 🏗️ Architecture

```
GitHub PR webhook -> HMAC verification -> FastAPI BackgroundTasks
                                                  │
                                                  ▼
                          TF-IDF + Logistic Regression classifier
                                                  │
                                                  ▼
                          Gemini 1.5 Flash (summary, risk, scores)
                                                  │
                                                  ▼
                SQLite (audit log) -> React Dashboard / GitHub comment / Email alert
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| ML classifier | scikit-learn (`TfidfVectorizer` + `LogisticRegression`), `joblib` |
| LLM layer | Google Gemini 1.5 Flash (`httpx` async client) |
| Backend | FastAPI + Pydantic |
| Database | SQLite (`sqlite3`) |
| GitHub integration | GitHub Webhooks, `hmac` signature verification, PyGitHub |
| Email | `smtplib` (Gmail SMTP + App Password) |
| Frontend | React 18 + Vite + Tailwind CSS + `lucide-react` |
| Deployment | Railway (backend) · Vercel (frontend) |

### Why these choices?

- **TF-IDF + Logistic Regression over fine-tuning an LLM** — trains in ~2 minutes on CPU, runs inference in ~0.1ms, costs nothing to serve, and every prediction is fully explainable by inspecting feature weights. Recall (88.7%) is competitive with a fine-tuned small LLM on this task, without the GPU cost.
- **SQLite over Postgres** — at this scale (thousands, not millions, of reviews) SQLite means zero infrastructure and a single inspectable file. The database layer is abstracted behind `db.py`, so swapping to Postgres later is a one-file change.
- **FastAPI over Flask/Django** — auto-generated Swagger docs at `/docs`, native async support, and automatic request validation via Pydantic — all of which matter for an ML-serving API.
- **Background tasks for the webhook** — GitHub drops webhook connections after 10 seconds, but a full review (fetch diff → run ML → call Gemini → post comment) takes 5–15 seconds. The endpoint responds instantly with `{"status": "ok"}` and processes the review asynchronously, so GitHub never sees a failed delivery.

## 🗂️ Project Structure

```
reviewllama/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, routes, CORS
│   │   ├── ml/               # TF-IDF vectorizer + Logistic Regression model (joblib)
│   │   ├── db.py             # SQLite access layer
│   │   └── services/         # Gemini client, GitHub bot, email notifier
│   ├── reviewllama.db        # SQLite database
│   └── requirements.txt
├── dashboard/                # React + Vite frontend (Tailwind CSS)
│   └── src/pages/            # Overview, PR Reviews, Analytics, Alerts, Thresholds, Integrations
├── ml/
│   └── training/             # TF-IDF + Logistic Regression training + eval scripts
└── README.md
```

## 🔌 API Endpoints

| Endpoint | Description |
|---|---|
| `POST /reviews` | Runs the ML classifier + Gemini on a diff, saves to SQLite, emails on critical findings |
| `GET /reviews/recent` | Last 20 reviews for the live feed |
| `GET /reviews/all` | All reviews, filterable by severity |
| `GET /reviews/stats` | Today's review counts for the metric cards |
| `GET /reviews/severity-breakdown` | Counts by severity |
| `GET /reviews/category-breakdown` | Counts by category (security/bug/performance) |
| `GET /reviews/over-time` | Review counts grouped by date, for the timeline chart |
| `GET /reviews/alerts` | Critical findings only |
| `DELETE /reviews/clear` | Wipes the database |
| `POST /webhook/github` | Receives GitHub PR webhooks, verifies signature, queues background processing |

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ (for the dashboard)
- A Gemini API key (free tier)
- A GitHub App/webhook secret (for live PR integration)
- A Gmail App Password (for email alerts, optional)

### 1. Clone the repository
```bash
git clone https://github.com/KanupriyaPrachande/reviewllama.git
cd reviewllama
```

### 2. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set up the dashboard
```bash
cd ../dashboard
npm install
```

### 4. Configure environment
Create a `.env` file inside `backend/` with:
```
GEMINI_API_KEY=your_key_here
GITHUB_WEBHOOK_SECRET=your_secret_here
GITHUB_TOKEN=your_token_here
GMAIL_ADDRESS=your_email_here
GMAIL_APP_PASSWORD=your_app_password_here
```

### 5. Run the services
```bash
# Backend (from backend/)
uvicorn app.main:app --reload

# Dashboard (from dashboard/)
npm run dev
```

## 🚀 Live Deployment

- **Backend (Railway):** `https://reviewllama-production.up.railway.app`
- **Dashboard (Vercel):** [reviewllama.vercel.app](https://reviewllama.vercel.app)

Both auto-deploy from `main` on every push. CORS on the backend explicitly whitelists the Vercel domain so the dashboard can call the API cross-origin.

## 🔀 Contributing / Pull Requests

Contributions are welcome! To submit a change:

```bash
# Sync your fork with the latest main branch
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name

# Commit and push your changes
git push origin feature/your-feature-name
```

Then open a pull request against `main`:

👉 **[github.com/KanupriyaPrachande/reviewllama/pulls](https://github.com/KanupriyaPrachande/reviewllama/pulls)**

Please make sure any new detection logic includes a test case and, where relevant, an update to the eval metrics.

## 📌 Status

- [x] FastAPI backend + REST API
- [x] TF-IDF + Logistic Regression classifier, trained + evaluated
- [x] Gemini 1.5 Flash integration for summaries and risk scoring
- [x] SQLite audit log
- [x] GitHub webhook + HMAC verification + bot comment posting
- [x] Background task processing (no webhook timeouts)
- [x] Email alerts for critical findings
- [x] React dashboard (Overview, PR Reviews, Analytics, Alerts, Thresholds, Integrations)
- [x] Eval metrics (precision/recall/FPR) on held-out test set
- [ ] Slack notifications
- [ ] Postgres migration for larger-scale deployments

## 👩‍💻 About

Built by **Kanupriya Prachande**.

🔗 [GitHub](https://github.com/KanupriyaPrachande) · 🌐 [Live dashboard](https://reviewllama.vercel.app)

---

Built with ❤️ using Python, scikit-learn, FastAPI, Gemini, and React.
