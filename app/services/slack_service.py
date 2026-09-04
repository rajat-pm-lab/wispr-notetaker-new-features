import os
from typing import Optional, Dict, Any
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from app.models.schemas import SlackActionRequest, ActionResponse

REQUIRED_SCOPES = ["chat:write", "channels:read", "users:read", "users:read.email"]

SCOPE_DESCRIPTIONS = {
    "chat:write": "Post messages to channels",
    "channels:read": "Find channels in your workspace",
    "users:read": "Resolve user names for mentions",
    "users:read.email": "Match attendees to Slack users",
}

# Friendly error messages for common Slack API errors
ERROR_MESSAGES = {
    "missing_scope": "missing_scope",
    "not_authed": "Your Slack token is invalid or expired. Please re-copy it from your Slack App settings.",
    "invalid_auth": "Your Slack token is invalid. Please check that you copied the full token starting with xoxb-.",
    "token_revoked": "Your Slack token has been revoked. Please reinstall your Slack App and copy the new token.",
    "channel_not_found": "Channel not found in your workspace. Make sure the bot is invited to the channel.",
    "not_in_channel": "The bot is not in this channel. Invite it by typing /invite @YourBotName in the channel.",
}


def get_slack_client(user_token: Optional[str] = None) -> Optional[WebClient]:
    token = user_token or os.getenv("SLACK_BOT_TOKEN")
    if not token:
        return None
    return WebClient(token=token)


async def validate_slack_token(token: Optional[str] = None) -> Dict[str, Any]:
    """Validate a Slack token and check which scopes are available."""
    client = get_slack_client(token)
    if not client:
        return {
            "valid": False,
            "error": "No token provided",
            "scopes_present": [],
            "scopes_missing": REQUIRED_SCOPES,
        }

    try:
        # auth.test tells us if the token is valid and returns granted scopes in headers
        result = client.auth_test()
        team = result.get("team", "Unknown workspace")
        bot_user = result.get("user", "Unknown bot")

        # Get actual granted scopes from response headers
        granted_scopes_raw = result.headers.get("x-oauth-scopes", "")
        granted_scopes = [s.strip() for s in granted_scopes_raw.split(",") if s.strip()]

        scopes_present = [s for s in REQUIRED_SCOPES if s in granted_scopes]
        scopes_missing = [s for s in REQUIRED_SCOPES if s not in granted_scopes]

        # Only mark as valid if ALL required scopes are present
        if scopes_missing:
            return {
                "valid": False,
                "error": "missing_scope",
                "error_code": "missing_scope",
                "team": team,
                "bot_user": bot_user,
                "scopes_present": scopes_present,
                "scopes_missing": scopes_missing,
                "granted_scopes": granted_scopes,
            }

        return {
            "valid": True,
            "team": team,
            "bot_user": bot_user,
            "scopes_present": scopes_present,
            "scopes_missing": [],
            "granted_scopes": granted_scopes,
        }

    except SlackApiError as e:
        error_code = e.response.get("error", "unknown_error")
        return {
            "valid": False,
            "error": ERROR_MESSAGES.get(error_code, f"Slack error: {error_code}"),
            "error_code": error_code,
            "scopes_present": [],
            "scopes_missing": REQUIRED_SCOPES,
        }


def get_friendly_error(error_code: str) -> str:
    """Convert a Slack error code into a user-friendly message."""
    if error_code == "missing_scope":
        return "missing_scope"
    return ERROR_MESSAGES.get(error_code, f"Something went wrong ({error_code}). Please check your Slack App configuration.")


async def create_slack_thread(
    request: SlackActionRequest,
    user_token: Optional[str] = None,
) -> ActionResponse:
    client = get_slack_client(user_token)
    if not client:
        return ActionResponse(
            success=False,
            message="not_configured"
        )

    try:
        channel_id = None
        channel_name = request.channel.lstrip("#") if request.channel else None

        if channel_name:
            # Only list public channels (private requires groups:read scope)
            # Paginate to find the channel
            cursor = None
            while True:
                kwargs = {"types": "public_channel", "limit": 200}
                if cursor:
                    kwargs["cursor"] = cursor
                result = client.conversations_list(**kwargs)
                for ch in result["channels"]:
                    if ch["name"] == channel_name:
                        channel_id = ch["id"]
                        break
                if channel_id:
                    break
                cursor = result.get("response_metadata", {}).get("next_cursor")
                if not cursor:
                    break

        # Fallback to #general if the specified channel isn't found
        fallback_used = False
        if not channel_id:
            cursor = None
            while True:
                kwargs = {"types": "public_channel", "limit": 200}
                if cursor:
                    kwargs["cursor"] = cursor
                result = client.conversations_list(**kwargs)
                for ch in result["channels"]:
                    if ch["name"] == "general":
                        channel_id = ch["id"]
                        break
                if channel_id:
                    break
                cursor = result.get("response_metadata", {}).get("next_cursor")
                if not cursor:
                    break
            fallback_used = True

        if not channel_id:
            return ActionResponse(
                success=False,
                message="channel_not_found",
                url=request.channel
            )

        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"From: {request.meeting_title}",
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": request.message
                }
            },
        ]

        if request.recipients:
            mentions = " ".join(f"@{r}" for r in request.recipients)
            blocks.append({
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": f"Participants: {mentions}"
                    }
                ]
            })

        result = client.chat_postMessage(
            channel=channel_id,
            blocks=blocks,
            text=request.message,
        )

        permalink = client.chat_getPermalink(
            channel=channel_id,
            message_ts=result["ts"]
        )

        posted_to = "#general" if fallback_used else request.channel
        return ActionResponse(
            success=True,
            message=f"Message posted to {posted_to}" + (" (channel not found, used #general)" if fallback_used else ""),
            url=permalink.get("permalink")
        )

    except SlackApiError as e:
        error_code = e.response.get("error", "unknown_error")
        return ActionResponse(
            success=False,
            message=error_code
        )
