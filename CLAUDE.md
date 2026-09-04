# Wispr Notetaker CTA — Project Context

## What This Is
A feature concept demo for Wispr Notetaker that transforms passive meeting summaries into actionable next steps with one-click CTAs (Email, Slack, Calendar, Mark Done). Built as a portfolio piece by Rajat Singh.

## Tech Stack
- **Backend:** Python 3.9, FastAPI, Pydantic
- **Frontend:** Vanilla HTML/CSS/JS (no framework)
- **Integrations:** Slack Web API (`slack_sdk`), Google Calendar URL API, `mailto:` links
- **Deployment:** Vercel (vercel.json configured)
- **Design:** Matches Wispr Flow's UI — clean, minimal, warm tones

## Project Structure
```
wispr-notetaker-cta/
├── app/
│   ├── main.py                    # FastAPI app + static file serving
│   ├── api/
│   │   ├── meetings.py            # Meeting list/detail endpoints
│   │   └── actions.py             # CTA execution endpoints (email, slack, calendar, completion tracking)
│   ├── services/
│   │   ├── email_service.py       # mailto: link generation
│   │   ├── slack_service.py       # Slack thread creation + token validation
│   │   └── calendar_service.py    # Google Calendar URL generation
│   ├── models/
│   │   └── schemas.py             # Pydantic models (Meeting, ActionItem, CTA, etc.)
│   └── data/
│       └── sample_meetings.py     # 2 synthetic meetings with realistic action items
├── frontend/
│   ├── index.html                 # Wispr-styled UI (sidebar + meeting list + detail view)
│   ├── styles.css                 # Full design system (~1050 lines)
│   └── app.js                     # CTA handlers, Slack modal, settings panel, navigation
├── vercel.json                    # Vercel deployment config
├── requirements.txt               # Python dependencies
└── CLAUDE.md                      # This file
```

## What's Done
- Full meeting list view with date grouping (Today/Yesterday)
- Meeting detail view with summary sections + highlighted attendee names
- Action items with completion tracking (checkbox + progress badge)
- **Email CTA:** Opens default email client with pre-filled recipients, subject, body
- **Slack CTA:** Full integration with preview modal, live sending, token validation
  - Settings panel for Slack bot token management (stored in localStorage)
  - Comprehensive error handling with step-by-step fix instructions for every Slack error
  - Token validation checks all required scopes before saving
  - Editable channel name per task — users type their own channel in the Slack modal
  - Demo mode when Slack not connected (preview only)
- **Calendar CTA:** Opens Google Calendar with pre-filled event details
- Responsive design (sidebar hides on mobile)
- 2 sample meetings with 6 action items covering all CTA types

## What's Pending / Ideas
- Real meeting data ingestion (Wispr API or transcript upload)
- User-to-Slack handle resolution (currently uses hardcoded handles)
- Private channel support (requires `groups:read` scope)
- Persistent storage for completed actions (currently in-memory, resets on restart)
- Email sending via API (currently uses mailto: which opens client)
- Meeting search functionality (search bar is visual only)
- "Shared with me" tab (tab exists but not functional)

## Key Patterns
- Slack token is stored client-side in `localStorage`, passed via `X-Slack-Token` header — never stored server-side
- CTAs are defined per action item in sample data (`sample_meetings.py`), each with type-specific fields
- The `ctaStore` object in `app.js` maps CTA IDs to CTA data for event delegation
- Slack channel in CTA data is a suggestion; user can override it in the modal before sending

## Running Locally
```bash
source .venv/bin/activate
uvicorn app.main:app --reload
# Open http://localhost:8000
```

## Repo
https://github.com/rajat-pm-lab/wispr-notetaker-cta
