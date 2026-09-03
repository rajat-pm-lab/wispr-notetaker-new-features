from urllib.parse import quote
from app.models.schemas import ActionResponse


def build_mailto_url(recipients: list[str], subject: str, body: str) -> str:
    """Build a mailto: URL with pre-filled fields."""
    to = ",".join(recipients)
    return f"mailto:{to}?subject={quote(subject)}&body={quote(body)}"


async def compose_email(
    recipients: list[str], subject: str, body: str
) -> ActionResponse:
    """Generate a mailto link that opens the user's default email client."""
    url = build_mailto_url(recipients, subject, body)

    return ActionResponse(
        success=True,
        message=f"Opening email to {', '.join(recipients)}",
        url=url
    )
