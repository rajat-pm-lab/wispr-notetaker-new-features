from app.models.schemas import (
    Meeting, Attendee, MeetingSummarySection, ActionItem, CTA, CTAType
)

SAMPLE_MEETINGS = [
    Meeting(
        id="meeting-001",
        title="Q3 Product Roadmap Sync",
        date="2026-09-02",
        time="10:00 AM",
        duration="45 min",
        attendees=[
            Attendee(name="Sarah Chen", email="sarah.chen@company.com", role="Product Manager", slack_handle="sarah.chen"),
            Attendee(name="Mike Torres", email="mike.torres@company.com", role="Engineering Lead", slack_handle="mike.torres"),
            Attendee(name="Priya Patel", email="priya.patel@company.com", role="Design Lead", slack_handle="priya.patel"),
            Attendee(name="Alex Kim", email="alex.kim@company.com", role="Data Analyst", slack_handle="alex.kim"),
        ],
        summary_sections=[
            MeetingSummarySection(
                title="Voice Commands Feature",
                bullets=[
                    "Team aligned on shipping voice commands in Q3 as the top priority",
                    "Mike raised concerns about latency requirements — needs sub-200ms response time",
                    "Priya shared early design explorations; team preferred the minimal overlay approach",
                ]
            ),
            MeetingSummarySection(
                title="Analytics Dashboard Redesign",
                bullets=[
                    "Alex presented usage data showing 68% of users never scroll below the fold",
                    "Decision to move key metrics above the fold and deprecate rarely-used widgets",
                    "Sarah will update the PRD to reflect the simplified dashboard scope",
                ]
            ),
            MeetingSummarySection(
                title="Sprint Planning",
                bullets=[
                    "Current sprint at 85% completion — on track for Thursday release",
                    "Two P1 bugs need resolution before release: audio sync issue and memory leak on long sessions",
                    "Next sprint will focus entirely on voice commands foundation",
                ]
            ),
        ],
        action_items=[
            ActionItem(
                id="ai-001",
                owner="Sarah Chen",
                task="Share updated PRD with engineering team incorporating voice commands scope and dashboard simplification",
                context="Team aligned on voice commands as Q3 priority. Dashboard scope simplified based on Alex's usage data showing 68% of users never scroll below the fold.",
                deadline="Sep 4",
                ctas=[
                    CTA(
                        type=CTAType.EMAIL,
                        label="Email PRD to team",
                        recipients=["mike.torres@company.com", "priya.patel@company.com", "alex.kim@company.com"],
                        subject="Updated Q3 PRD — Voice Commands + Dashboard Changes",
                        body="Hi team,\n\nAttaching the updated PRD based on our roadmap sync earlier today. Key changes:\n\n• Voice commands confirmed as Q3 top priority (sub-200ms latency target)\n• Dashboard simplified — key metrics moved above the fold, rarely-used widgets deprecated\n• Scope reflects Alex's usage data (68% never scroll below fold)\n\nPlease review and flag any concerns by EOD Thursday.\n\nBest,\nSarah"
                    ),
                    CTA(
                        type=CTAType.SLACK,
                        label="Post in #product-eng",
                        recipients=["mike.torres", "priya.patel", "alex.kim"],
                        subject="PRD Update",
                        body="📋 Updated Q3 PRD is ready for review — voice commands scope + simplified dashboard. Key changes from today's roadmap sync:\n\n• Voice commands: sub-200ms latency target confirmed\n• Dashboard: key metrics above the fold, deprecated widgets removed\n\nPlease review and flag concerns by EOD Thursday.",
                        channel="#product-eng"
                    ),
                ]
            ),
            ActionItem(
                id="ai-002",
                owner="Mike Torres",
                task="Estimate engineering effort for voice commands feature and identify technical risks",
                context="Voice commands confirmed as Q3 priority. Mike raised latency concern — needs sub-200ms response time. Current audio pipeline may need optimization.",
                deadline="Sep 5",
                ctas=[
                    CTA(
                        type=CTAType.SLACK,
                        label="Start eng discussion",
                        recipients=["sarah.chen", "alex.kim"],
                        subject="Voice Commands Estimation",
                        body="🔧 Starting effort estimation for voice commands feature.\n\nKey technical considerations from today's sync:\n• Sub-200ms response time requirement\n• Audio pipeline optimization may be needed\n• Need to assess impact on current memory usage\n\nWill share estimates by Friday. Flagging any blockers here.",
                        channel="#engineering"
                    ),
                    CTA(
                        type=CTAType.CALENDAR,
                        label="Schedule estimation session",
                        event_title="Voice Commands — Technical Estimation",
                        event_date="2026-09-04",
                        event_time="14:00",
                        event_duration_minutes=60,
                        recipients=["mike.torres@company.com", "sarah.chen@company.com"],
                        subject="",
                        body="Deep-dive on voice commands technical estimation:\n\n• Latency requirements (sub-200ms)\n• Audio pipeline assessment\n• Effort sizing and sprint allocation\n• Risk identification"
                    ),
                ]
            ),
            ActionItem(
                id="ai-003",
                owner="Priya Patel",
                task="Upload revised voice command mockups to Figma with the minimal overlay approach",
                context="Team preferred the minimal overlay approach over the full-screen modal. Priya to finalize and share updated designs.",
                deadline="Sep 5",
                ctas=[
                    CTA(
                        type=CTAType.EMAIL,
                        label="Email design update",
                        recipients=["sarah.chen@company.com", "mike.torres@company.com"],
                        subject="Voice Commands — Updated Mockups (Minimal Overlay)",
                        body="Hi Sarah & Mike,\n\nUploaded the revised voice command mockups to Figma — went with the minimal overlay approach as discussed.\n\nFigma link: [link]\n\nKey design decisions:\n• Overlay appears at bottom-right, doesn't block content\n• Visual feedback for voice activation state\n• Graceful fallback for unsupported browsers\n\nLet me know if anything needs adjustment before eng picks it up.\n\nBest,\nPriya"
                    ),
                    CTA(
                        type=CTAType.SLACK,
                        label="Share in #design",
                        recipients=["sarah.chen", "mike.torres"],
                        subject="Design Update",
                        body="🎨 Updated voice command mockups uploaded to Figma — minimal overlay approach as aligned in today's sync.\n\nKey decisions: bottom-right overlay, voice activation feedback, browser fallback.\n\nReview and flag any concerns!",
                        channel="#design"
                    ),
                ]
            ),
            ActionItem(
                id="ai-004",
                owner="All",
                task="Reconvene Thursday 2pm for design review of voice commands mockups",
                context="Follow-up meeting to review Priya's finalized mockups and Mike's effort estimates before committing to sprint scope.",
                deadline="Sep 4",
                ctas=[
                    CTA(
                        type=CTAType.CALENDAR,
                        label="Create calendar event",
                        event_title="Voice Commands — Design Review",
                        event_date="2026-09-04",
                        event_time="14:00",
                        event_duration_minutes=30,
                        recipients=["sarah.chen@company.com", "mike.torres@company.com", "priya.patel@company.com", "alex.kim@company.com"],
                        subject="",
                        body="Design review for voice commands feature:\n\n• Review Priya's finalized mockups (minimal overlay approach)\n• Review Mike's effort estimates\n• Finalize sprint scope and commitments\n• Identify any remaining blockers"
                    ),
                    CTA(
                        type=CTAType.SLACK,
                        label="Notify team",
                        recipients=["sarah.chen", "mike.torres", "priya.patel", "alex.kim"],
                        subject="Meeting Reminder",
                        body="📅 Reminder: Voice Commands Design Review — Thursday 2pm\n\nAgenda:\n• Review finalized mockups (Priya)\n• Effort estimates (Mike)\n• Sprint scope decision\n\nPlease come prepared with any blockers or concerns.",
                        channel="#product-eng"
                    ),
                ]
            ),
        ]
    ),
    Meeting(
        id="meeting-002",
        title="Customer Onboarding Improvement Review",
        date="2026-09-01",
        time="2:00 PM",
        duration="30 min",
        attendees=[
            Attendee(name="Jordan Lee", email="jordan.lee@company.com", role="Customer Success Lead", slack_handle="jordan.lee"),
            Attendee(name="Sarah Chen", email="sarah.chen@company.com", role="Product Manager", slack_handle="sarah.chen"),
            Attendee(name="Nina Kowalski", email="nina.kowalski@company.com", role="Growth Marketing", slack_handle="nina.kowalski"),
        ],
        summary_sections=[
            MeetingSummarySection(
                title="Onboarding Drop-off Analysis",
                bullets=[
                    "Jordan shared data: 40% of new users drop off at the microphone permissions step",
                    "Users on Chrome have 2x higher completion rate than Safari — permissions UX is clearer",
                    "Nina suggested adding a 30-second video tutorial before the permissions prompt",
                ]
            ),
            MeetingSummarySection(
                title="Welcome Email Sequence",
                bullets=[
                    "Current 5-email sequence has 12% open rate by email 4 — need to front-load value",
                    "Decision to reduce to 3 emails with personalized tips based on use case selected during signup",
                    "Nina to A/B test new sequence starting next week",
                ]
            ),
        ],
        action_items=[
            ActionItem(
                id="ai-005",
                owner="Jordan Lee",
                task="Create detailed drop-off analysis report with browser-specific breakdown and share with product team",
                context="40% drop-off at microphone permissions step. Chrome users complete at 2x the rate of Safari users. Need deeper analysis to inform UX improvements.",
                deadline="Sep 3",
                ctas=[
                    CTA(
                        type=CTAType.EMAIL,
                        label="Email report to team",
                        recipients=["sarah.chen@company.com", "nina.kowalski@company.com"],
                        subject="Onboarding Drop-off Analysis — Browser Breakdown",
                        body="Hi Sarah & Nina,\n\nAttaching the detailed onboarding drop-off analysis as discussed.\n\nKey findings:\n• 40% drop-off at microphone permissions step\n• Chrome: 2x higher completion rate vs Safari\n• Safari permissions UX causes most friction\n\nRecommendation: Prioritize Safari permissions flow redesign + pre-permissions video tutorial.\n\nFull report attached.\n\nBest,\nJordan"
                    ),
                    CTA(
                        type=CTAType.SLACK,
                        label="Post in #growth",
                        recipients=["sarah.chen", "nina.kowalski"],
                        subject="Drop-off Analysis",
                        body="📊 Onboarding drop-off analysis is ready.\n\nTL;DR: 40% drop at mic permissions, Safari is 2x worse than Chrome.\n\nSharing full report in thread. Key rec: Safari permissions redesign + pre-permissions tutorial video.",
                        channel="#growth"
                    ),
                ]
            ),
            ActionItem(
                id="ai-006",
                owner="Nina Kowalski",
                task="Set up A/B test for new 3-email welcome sequence with personalized tips",
                context="Current 5-email sequence has 12% open rate by email 4. Reducing to 3 emails with personalized tips based on signup use case selection.",
                deadline="Sep 8",
                ctas=[
                    CTA(
                        type=CTAType.SLACK,
                        label="Coordinate in #marketing",
                        recipients=["jordan.lee", "sarah.chen"],
                        subject="A/B Test Setup",
                        body="🧪 Setting up A/B test for the new welcome email sequence.\n\nChanges:\n• 5 emails → 3 emails\n• Generic tips → personalized by signup use case\n• Front-loading value in email 1\n\nTest starts next Monday. Will share results after 2 weeks.\n\nAny last input before I lock the variants?",
                        channel="#marketing"
                    ),
                    CTA(
                        type=CTAType.CALENDAR,
                        label="Schedule results review",
                        event_title="Welcome Email A/B Test — Results Review",
                        event_date="2026-09-22",
                        event_time="11:00",
                        event_duration_minutes=30,
                        recipients=["nina.kowalski@company.com", "jordan.lee@company.com", "sarah.chen@company.com"],
                        subject="",
                        body="Review results of the welcome email A/B test:\n\n• Control: 5-email generic sequence\n• Variant: 3-email personalized sequence\n• Metrics: open rate, click rate, activation rate\n• Decision: roll out winner or iterate"
                    ),
                ]
            ),
        ]
    ),
]
