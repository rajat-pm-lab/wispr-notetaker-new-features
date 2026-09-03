from fastapi import APIRouter, HTTPException
from app.data.sample_meetings import SAMPLE_MEETINGS

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


@router.get("")
async def list_meetings():
    return [
        {
            "id": m.id,
            "title": m.title,
            "date": m.date,
            "time": m.time,
            "duration": m.duration,
            "attendee_count": len(m.attendees),
        }
        for m in SAMPLE_MEETINGS
    ]


@router.get("/{meeting_id}")
async def get_meeting(meeting_id: str):
    for m in SAMPLE_MEETINGS:
        if m.id == meeting_id:
            return m
    raise HTTPException(status_code=404, detail="Meeting not found")
