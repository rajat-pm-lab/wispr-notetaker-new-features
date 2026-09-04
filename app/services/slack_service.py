import os
from typing import Optional
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from app.models.schemas import SlackActionRequest, ActionResponse


def get_slack_client(user_token: Optional[str] = None) -> Optional[WebClient]:
    token = user_token or os.getenv("SLACK_BOT_TOKEN")
    if not token:
        return None
    return WebClient(token=token)


async def create_slack_thread(
    request: SlackActionRequest,
    user_token: Optional[str] = None,
) -> ActionResponse:
    client = get_slack_client(user_token)
    if not client:
        return ActionResponse(
            success=False,
            message="Slack not configured. Connect your Slack in Settings."
        )

    try:
        channel_id = None
        channel_name = request.channel.lstrip("#") if request.channel else None

        if channel_name:
            result = client.conversations_list(types="public_channel,private_channel")
            for ch in result["channels"]:
                if ch["name"] == channel_name:
                    channel_id = ch["id"]
                    break

        if not channel_id:
            return ActionResponse(
                success=False,
                message=f"Channel {request.channel} not found in your workspace. Check the channel name."
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

        return ActionResponse(
            success=True,
            message=f"Message posted to {request.channel}",
            url=permalink.get("permalink")
        )

    except SlackApiError as e:
        return ActionResponse(
            success=False,
            message=f"Slack error: {e.response['error']}"
        )
