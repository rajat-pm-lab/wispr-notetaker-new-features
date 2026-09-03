import os
from datetime import datetime, timedelta
from urllib.parse import urlencode
from app.models.schemas import CalendarActionRequest, ActionResponse


def build_google_calendar_url(request: CalendarActionRequest) -> str:
    """Build a Google Calendar event creation URL (works without API auth)."""
    # Parse date and time
    try:
        dt = datetime.strptime(f"{request.date} {request.time}", "%Y-%m-%d %H:%M")
    except ValueError:
        dt = datetime.now() + timedelta(days=1)

    end_dt = dt + timedelta(minutes=request.duration_minutes)

    # Format for Google Calendar URL
    start = dt.strftime("%Y%m%dT%H%M%S")
    end = end_dt.strftime("%Y%m%dT%H%M%S")

    params = {
        "action": "TEMPLATE",
        "text": request.title,
        "dates": f"{start}/{end}",
        "details": request.description,
        "add": ",".join(request.attendees),
    }

    return f"https://calendar.google.com/calendar/render?{urlencode(params)}"


async def create_calendar_event(request: CalendarActionRequest) -> ActionResponse:
    """Create a calendar event using Google Calendar URL (no API auth needed)."""
    url = build_google_calendar_url(request)

    return ActionResponse(
        success=True,
        message="Opening Google Calendar to create event",
        url=url
    )
