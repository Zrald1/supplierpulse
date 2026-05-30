<div align="center">

# 🛰️ SupplierPulse

### Live Vendor Risk & Opportunity Intelligence — powered by a multi-agent web scraping swarm

**Stop researching your suppliers once a year. Start monitoring them every minute.**

[![Bright Data](https://img.shields.io/badge/Powered%20by-Bright%20Data-2D9CDB?style=for-the-badge)](https://brightdata.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Gemini](https://img.shields.io/badge/AI-Gemini%20%2B%20AIML-8E75FF?style=for-the-badge)](https://ai.google.dev)

*Built for the lablab.ai × Bright Data Hackathon — Track 2: Finance & Market Intelligence · Track 3: Security & Compliance*

</div>

---

## 🎯 The Problem

Every enterprise depends on a web of third-party vendors — payment processors, SaaS tools, logistics partners, suppliers. When one of them gets sued, suffers a breach, starts mass layoffs, or quietly runs out of runway, **you find out last.**

Today, vendor risk assessment is:

- 🐌 **Slow** — analysts manually Google a supplier once during onboarding, then never again.
- 🕳️ **Blind** — the warning signs (hiring freezes, Glassdoor revolts, regulatory filings, Reddit outage threads) live scattered across the open web, behind anti-bot walls.
- 💸 **Expensive** — legacy GRC platforms charge six figures and still ship week-old data.

By the time a risk shows up in a vendor feed, it's already news. **The signal was on the web days earlier.**

## 💡 The Solution

**SupplierPulse** is an always-on, AI-powered intelligence agent that continuously scrapes the live web for any vendor you care about, classifies what it finds, and delivers a procurement-grade risk brief in seconds — then keeps watching on a schedule and pings you on Slack or Telegram the moment something shifts.

Type a company name. Watch six specialist AI agents fan out across the web in real time. Get a 0–100 risk score, an executive summary, key risks, opportunities, and recommended actions — all grounded in sources scraped *right now*.

> 🔍 **Stripe → 12 seconds → "Risk Index 14/100 (LOW)"** — complete with $1T processing volume signals, PCI-DSS compliance verification, Glassdoor sentiment, and live Reddit consensus, each linked to its source.

---

## ✨ Key Features

| Feature | What it does |
|---|---|
| 🤖 **Multi-Agent Swarm** | Six specialist agents (Workforce, PR Sentinel, Regulatory Counsel, Financial Solvency, Social Pulse, Lead Orchestrator) run **concurrently** across six web surfaces. |
| 🌐 **Live Bright Data Scraping** | Real SERP scraping via the **Bright Data SERP API** to pull jobs, news, SEC filings, reviews, web presence, and social signals — bypassing the blocks that stop ordinary scrapers. |
| 📡 **Real-Time Agent Console** | Server-Sent Events stream every scrape, classification, and flag live to the UI — you *watch* the intelligence get gathered, not a spinner. |
| 📊 **Transparent Risk Scoring** | A weighted 5-positive / 5-negative factor model produces a 0–100 index (LOW → CRITICAL) — fully explainable, not a black box. |
| 🧠 **Resilient AI Classification** | Gemini + AIML API (DeepSeek, Llama, Gemma, Kimi) with automatic key rotation, JSON self-healing, and a local rule engine fallback — **it never returns an empty report.** |
| ⏰ **Scheduled Monitoring** | Set a vendor to re-scan every 5/15/60/1440 minutes. New brief auto-delivers to **Slack** & **Telegram** webhooks. |
| 🔗 **Source-Cited Everything** | Every signal links back to its origin URL (Indeed, SEC EDGAR, Glassdoor, Reddit, X, Crunchbase, and more). |

---

## 🏗️ How It Works

```
                    ┌─────────────────────────────────────────────┐
   "Stripe"  ──────▶│  Stage 1 · Normalize  (canonical + industry) │
                    └─────────────────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼   Stage 2 · 6 Scrapers (parallel)    ▼
        ┌─────────┬─────────┬──────────┬─────────┬─────────┬─────────┐
        │  Jobs   │  News   │ Filings  │ Reviews │   Web   │ Social  │
        │ Bright  │ Bright  │  Bright  │ Bright  │ Bright  │ Bright  │
        │  Data   │  Data   │   Data   │  Data   │  Data   │  Data   │
        └─────────┴─────────┴──────────┴─────────┴─────────┴─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼  Stage 3 · Classify (AI, parallel)   ▼
                    │  job_growth · financial_stress ·     │
                    │  regulatory_risk · positive_news ... │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼  Stage 4 · Weighted Risk Score 0–100 ▼
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼  Stage 5 · Executive Brief + Actions ▼
                    └──────────────────┬──────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                         ▼
         Live UI (SSE)            Slack Alert              Telegram Alert
```

A **graceful-degradation philosophy** runs through the whole pipeline: Bright Data → Gemini grounding → AIML API → local rule engine. Any layer can fail and the user still gets a complete, source-backed brief.

---

## 🧰 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide icons, Vite 6
- **Backend:** Node.js, Express, Server-Sent Events (live streaming)
- **Web Intelligence:** 🟦 **Bright Data SERP API** (required hackathon integration)
- **AI / LLM:** Google Gemini (`gemini-3.5-flash` + grounding), AIML API (DeepSeek, Llama 3.3, Gemma 3, Kimi)
- **Persistence:** Zero-dependency JSON document store
- **Integrations:** Slack & Telegram webhooks for alert delivery
- **Storage:** Lightweight file-based DB — no external services to provision

---

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Configure your keys
cp .env.example .env
#   → add your GEMINI_API_KEY (required)
#   → add your BRIGHTDATA_API_KEY for live web scraping (recommended)
#   → optionally add AIML_API_KEY, SLACK_WEBHOOK_URL, Telegram tokens

# 3. Launch
npm run dev
```

Then open **http://localhost:3000** and search any company — try `Stripe`, `OpenAI`, or your own supplier.

> 💡 Keys can also be entered live in the in-app **Configurations** panel — no restart needed.

### Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Primary AI for classification & report synthesis |
| `BRIGHTDATA_API_KEY` | ⭐ Recommended | Live SERP web scraping across all six surfaces |
| `AIML_API_KEY` | Optional | Alternate LLMs (DeepSeek, Llama, Gemma, Kimi) |
| `SLACK_WEBHOOK_URL` | Optional | Scheduled-alert delivery to Slack |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Optional | Scheduled-alert delivery to Telegram |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Kick off a vendor scan → returns `job_id` |
| `GET` | `/api/stream/:jobId` | **SSE** live feed of agents, scrapers & signals |
| `GET` | `/api/report/:jobId` | Full compiled intelligence brief |
| `GET` | `/api/vendors` | All previously scanned vendors + latest scores |
| `POST` | `/api/schedules` | Create a recurring monitor (Slack/Telegram) |
| `GET·PATCH·DELETE` | `/api/schedules/:id` | Manage scheduled monitors |
| `POST` | `/api/webhook/slack` · `/telegram` | Push a brief to an external channel |
| `GET` | `/api/health` · `/api/test-keys` | Health & key diagnostics |

---

## 💼 Business Value

- **Total Addressable Market:** The global GRC + third-party risk management market exceeds **$50B**, growing double digits as supply-chain and vendor-risk regulation tightens.
- **Serviceable Market:** Mid-market procurement, fintech risk, and security/compliance teams who can't justify legacy six-figure GRC suites but desperately need live coverage.
- **Unique Selling Proposition:** *Real-time, source-cited, web-native intelligence* — versus competitors shipping stale quarterly data behind a paywall. SupplierPulse watches the open web continuously and explains every score.
- **Revenue Streams:** Per-vendor monitoring subscriptions, API access for embedding into existing CRM/GRC workflows, and premium alert-channel tiers.

## 🔭 Future Roadmap

- Bright Data **Web Unlocker** + **Scraping Browser** for deep crawls behind login walls
- Historical risk-trend charts & anomaly detection on score deltas
- CRM/GRC connectors (Salesforce, ServiceNow) to push briefs into existing workflows
- Portfolio dashboards monitoring hundreds of vendors at once

---

## 📦 Project Structure

```
supplierpulse/
├── server.ts                  # Express API, SSE router, schedule engine, Slack/Telegram
├── src/
│   ├── agentOrchestrator.ts   # The brain: 5-stage multi-agent pipeline + Bright Data
│   ├── dbStore.ts             # File-based JSON persistence layer
│   ├── types.ts               # Shared domain & SSE event types
│   ├── App.tsx                # Real-time intelligence console (React)
│   └── components/            # SearchBar, ScoreGauge
└── .env.example               # Configuration template
```

---

<div align="center">

**SupplierPulse** — *because the next supplier crisis is already on the web. You just haven't read it yet.*

Made with ☕ and a swarm of agents for the lablab.ai × Bright Data Hackathon.

</div>
