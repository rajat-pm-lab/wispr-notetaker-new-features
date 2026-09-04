from typing import Optional, List
from fastapi import APIRouter, Header
from pydantic import BaseModel
from app.models.schemas import (
    SlackActionRequest, CalendarActionRequest, ActionResponse
)
from app.services.email_service import compose_email
from app.services.slack_service import create_slack_thread, validate_slack_token
from app.services.calendar_service import create_calendar_event

router = APIRouter(prefix="/api/actions", tags=["actions"])


class EmailActionRequest(BaseModel):
    recipients: List[str]
    subject: str
    body: str


@router.post("/email", response_model=ActionResponse)
async def send_email(request: EmailActionRequest):
    return await compose_email(request.recipients, request.subject, request.body)


@router.post("/slack", response_model=ActionResponse)
async def send_slack(
    request: SlackActionRequest,
    x_slack_token: Optional[str] = Header(None),
):
    return await create_slack_thread(request, user_token=x_slack_token)


@router.post("/calendar", response_model=ActionResponse)
async def create_event(request: CalendarActionRequest):
    return await create_calendar_event(request)


@router.post("/slack/validate")
async def validate_slack(x_slack_token: Optional[str] = Header(None)):
    """Validate a Slack token and return which scopes are present/missing."""
    return await validate_slack_token(x_slack_token)


# Track completed action items in memory (for demo purposes)
completed_actions: set[str] = set()


@router.post("/{action_id}/complete", response_model=ActionResponse)
async def mark_complete(action_id: str):
    completed_actions.add(action_id)
    return ActionResponse(success=True, message=f"Action {action_id} marked complete")


@router.delete("/{action_id}/complete", response_model=ActionResponse)
async def unmark_complete(action_id: str):
    completed_actions.discard(action_id)
    return ActionResponse(success=True, message=f"Action {action_id} unmarked")


@router.get("/completed")
async def get_completed():
    return list(completed_actions)
