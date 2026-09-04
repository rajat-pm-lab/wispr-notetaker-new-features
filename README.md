# Wispr Notetaker — Actionable CTAs

> **Feature concept:** Transform passive meeting summaries into actionable next steps with one-click CTAs.

I use [Wispr Notetaker](https://wisprflow.ai/notetaker) daily for 3-4 meetings. The summary and transcript are great — but the **Next Steps** section stops at text. This project bridges the gap between "what was decided" and "what needs to happen next."

**[Live Demo](https://wispr-notetaker-cta.vercel.app/)**

## The Problem

Meeting summaries identify action items and owners, but execution still requires:
1. Opening email, re-typing context, finding recipients
2. Finding the right Slack channel, tagging people, summarizing the discussion
3. Creating calendar events for follow-up meetings

This friction means **follow-through drops off**. The summary becomes a document nobody revisits.

## The Solution: One-Click CTAs

Each Next Step gets **actionable CTA buttons** with pre-filled context:

| CTA | What It Does |
|-----|-------------|
| **Email** | Opens email client with recipients, subject, and meeting context pre-filled |
| **Slack** | Creates a Slack thread in the right channel with tagged stakeholders + context |
| **Calendar** | Opens Google Calendar with event title, agenda, and invitees pre-filled |
| **Mark Done** | Tracks action item completion with visual progress |

Zero typing. One click from summary to action.

## Tech Stack

- **Backend:** Python + FastAPI
- **Frontend:** Vanilla HTML/CSS/JS (Wispr-inspired design)
- **Integrations:** Slack Web API, Google Calendar URL API, mailto: links
- **Design:** Matches Wispr Flow's UI language — clean, minimal, warm tones

## Quick Start

```bash
# Clone
git clone https://github.com/rajat-pm-lab/wispr-notetaker-cta.git
cd wispr-notetaker-cta

# Setup
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure (optional — works without Slack token)
cp .env.example .env
# Add your SLACK_BOT_TOKEN for live Slack integration

# Run
uvicorn app.main:app --reload

# Open http://localhost:8000
```

## Slack Integration Setup

1. Create a Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Add Bot Token Scopes: `chat:write`, `channels:read`, `users:read`
3. Install to your workspace
4. Add `SLACK_BOT_TOKEN=xoxb-...` to `.env`

## Project Structure

```
wispr-notetaker-cta/
├── app/
│   ├── main.py              # FastAPI app + static file serving
│   ├── api/
│   │   ├── meetings.py      # Meeting summary endpoints
│   │   └── actions.py       # CTA execution endpoints
│   ├── services/
│   │   ├── email_service.py     # mailto: link generation
│   │   ├── slack_service.py     # Slack thread creation
│   │   └── calendar_service.py  # Google Calendar URL generation
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   └── data/
│       └── sample_meetings.py   # Synthetic meeting data
├── frontend/
│   ├── index.html           # Wispr-styled UI
│   ├── styles.css           # Design system
│   └── app.js               # CTA interaction handlers
└── requirements.txt
```

## Why This Matters

- **Competitive moat:** Otter, Fireflies, Fathom stop at summary. One-click actions are differentiated.
- **Aligns with Wispr's mission:** "Conversations become something you can actually use."
- **Measurable:** CTA click-through → action item closure → time-to-resolution.
- **MCP-native:** Fits Wispr's existing MCP architecture for agent integrations.

## About

Built by [Rajat Singh](https://github.com/rajat-pm-lab) — Senior PM building AI-powered product tools.
I use Wispr Flow daily. This is the feature I'd build next.
