import os
from typing import Optional
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from app.models.schemas import SlackActionRequest, ActionResponse


def get_slack_client() -> Optional[WebClient]:
    token = os.getenv("SLACK_BOT_TOKEN")
    if not token:
        return None
    return WebClient(token=token)


async def create_slack_thread(request: SlackActionRequest) -> ActionResponse:
    client = get_slack_client()
    if not client:
        return ActionResponse(
            success=False,
            message="Slack not configured. Add SLACK_BOT_TOKEN to .env"
        )

    try:
        # Resolve channel name to ID
        channel_id = None
        channel_name = request.channel.lstrip("#") if request.channel else None

        if channel_name:
            result = client.conversations_list(types="public_channel,private_channel")
            for ch in result["channels"]:
                if ch["name"] == channel_name:
                    channel_id = ch["id"]
                    break

        if not channel_id:
            # Fall back to DM with first recipient
            return ActionResponse(
                success=False,
                message=f"Channel {request.channel} not found. Please check the channel name."
            )

        # Build the message with meeting context
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

        # Mention recipients
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
            message=f"Thread created in {request.channel}",
            url=permalink.get("permalink")
        )

    except SlackApiError as e:
        return ActionResponse(
            success=False,
            message=f"Slack error: {e.response['error']}"
        )
