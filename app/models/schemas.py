from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel
from enum import Enum


class CTAType(str, Enum):
    EMAIL = "email"
    SLACK = "slack"
    CALENDAR = "calendar"


class Attendee(BaseModel):
    name: str
    email: str
    role: str
    slack_handle: Optional[str] = None


class CTA(BaseModel):
    type: CTAType
    label: str
    recipients: List[str] = []
    subject: str = ""
    body: str = ""
    channel: Optional[str] = None
    event_title: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    event_duration_minutes: int = 30


class ActionItem(BaseModel):
    id: str
    owner: str
    task: str
    context: str
    deadline: Optional[str] = None
    completed: bool = False
    ctas: List[CTA] = []


class MeetingSummarySection(BaseModel):
    title: str
    bullets: List[str]


class Meeting(BaseModel):
    id: str
    title: str
    date: str
    time: str
    duration: str
    attendees: List[Attendee]
    summary_sections: List[MeetingSummarySection]
    action_items: List[ActionItem]


class SlackActionRequest(BaseModel):
    channel: Optional[str] = None
    recipients: List[str]
    message: str
    meeting_title: str


class CalendarActionRequest(BaseModel):
    title: str
    date: str
    time: str
    duration_minutes: int = 30
    attendees: List[str]
    description: str


class ActionResponse(BaseModel):
    success: bool
    message: str
    url: Optional[str] = None
