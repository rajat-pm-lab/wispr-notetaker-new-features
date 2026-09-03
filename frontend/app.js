// State
let currentMeeting = null;
let completedActions = new Set();

// Icons
const ICONS = {
    email: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    slack: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z"/></svg>',
    calendar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMeetings();
    loadCompletedActions();
});

async function loadMeetings() {
    const res = await fetch('/api/meetings');
    const meetings = await res.json();
    renderMeetingList(meetings);
}

async function loadCompletedActions() {
    const res = await fetch('/api/actions/completed');
    const completed = await res.json();
    completedActions = new Set(completed);
}

function renderMeetingList(meetings) {
    const container = document.getElementById('meeting-list-container');
    container.innerHTML = meetings.map(m => `
        <div class="meeting-card" onclick="loadMeeting('${m.id}')">
            <div>
                <div class="meeting-card-title">${m.title}</div>
                <div class="meeting-card-meta">${m.date} · ${m.time} · ${m.duration} · ${m.attendee_count} attendees</div>
            </div>
            <span class="meeting-card-arrow">›</span>
        </div>
    `).join('');
}

async function loadMeeting(meetingId) {
    const res = await fetch(`/api/meetings/${meetingId}`);
    currentMeeting = await res.json();
    renderMeetingDetail(currentMeeting);
    showMeetingDetail();
}

function renderMeetingDetail(meeting) {
    document.getElementById('detail-title').textContent = meeting.title;
    document.getElementById('detail-meta').textContent =
        `${meeting.date} · ${meeting.time} · ${meeting.duration} · ${meeting.attendees.map(a => a.name).join(', ')}`;

    // Render summary sections
    const sectionsEl = document.getElementById('summary-sections');
    sectionsEl.innerHTML = meeting.summary_sections.map(s => `
        <div class="summary-section">
            <h3>${s.title}</h3>
            <ul>
                ${s.bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    // Render action items with CTAs
    const actionsEl = document.getElementById('action-items');
    actionsEl.innerHTML = meeting.action_items.map(item => {
        const isCompleted = completedActions.has(item.id);
        return `
        <div class="action-item ${isCompleted ? 'completed' : ''}" id="action-${item.id}">
            <div class="action-top">
                <div class="action-checkbox ${isCompleted ? 'checked' : ''}"
                     onclick="toggleComplete('${item.id}')"></div>
                <div class="action-body">
                    <div class="action-owner">(${item.owner})</div>
                    <div class="action-task">${item.task}</div>
                    <div class="action-context">${item.context}</div>
                    ${item.deadline ? `<div class="action-deadline">Due: ${item.deadline}</div>` : ''}
                    <div class="cta-group">
                        ${item.ctas.map(cta => renderCTA(cta, item)).join('')}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    updateCompletionBadge(meeting);
}

function renderCTA(cta, actionItem) {
    const icon = ICONS[cta.type] || '';
    const typeClass = cta.type;

    if (cta.type === 'email') {
        return `<button class="cta-btn email" onclick="handleEmailCTA(${escapeForAttr(cta)})">
            ${icon} ${cta.label}
        </button>`;
    }

    if (cta.type === 'slack') {
        return `<button class="cta-btn slack" onclick="handleSlackCTA(${escapeForAttr(cta)})">
            ${icon} ${cta.label}
        </button>`;
    }

    if (cta.type === 'calendar') {
        return `<button class="cta-btn calendar" onclick="handleCalendarCTA(${escapeForAttr(cta)})">
            ${icon} ${cta.label}
        </button>`;
    }

    return '';
}

function escapeForAttr(obj) {
    return `JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(obj))}'))`;
}

// CTA Handlers
async function handleEmailCTA(cta) {
    const res = await fetch('/api/actions/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            recipients: cta.recipients,
            subject: cta.subject,
            body: cta.body,
        }),
    });
    const data = await res.json();

    if (data.success && data.url) {
        window.open(data.url, '_blank');
        showToast('Opening email client...');
    } else {
        showToast(data.message);
    }
}

async function handleSlackCTA(cta) {
    const res = await fetch('/api/actions/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            channel: cta.channel,
            recipients: cta.recipients,
            message: cta.body,
            meeting_title: currentMeeting.title,
        }),
    });
    const data = await res.json();

    if (data.success && data.url) {
        window.open(data.url, '_blank');
        showToast(`Thread created in ${cta.channel}`);
    } else if (data.success) {
        showToast(`Thread created in ${cta.channel}`);
    } else {
        showToast(data.message);
    }
}

async function handleCalendarCTA(cta) {
    const res = await fetch('/api/actions/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: cta.event_title,
            date: cta.event_date,
            time: cta.event_time,
            duration_minutes: cta.event_duration_minutes,
            attendees: cta.recipients,
            description: cta.body,
        }),
    });
    const data = await res.json();

    if (data.success && data.url) {
        window.open(data.url, '_blank');
        showToast('Opening Google Calendar...');
    } else {
        showToast(data.message);
    }
}

async function toggleComplete(actionId) {
    const isCompleted = completedActions.has(actionId);
    const method = isCompleted ? 'DELETE' : 'POST';

    await fetch(`/api/actions/${actionId}/complete`, { method });

    if (isCompleted) {
        completedActions.delete(actionId);
    } else {
        completedActions.add(actionId);
    }

    // Update UI
    const el = document.getElementById(`action-${actionId}`);
    const checkbox = el.querySelector('.action-checkbox');

    el.classList.toggle('completed');
    checkbox.classList.toggle('checked');
    updateCompletionBadge(currentMeeting);
}

function updateCompletionBadge(meeting) {
    const total = meeting.action_items.length;
    const done = meeting.action_items.filter(i => completedActions.has(i.id)).length;

    let badge = document.querySelector('.completion-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'completion-badge';
        document.querySelector('.next-steps-header').appendChild(badge);
    }
    badge.textContent = `${done}/${total} done`;
    badge.style.display = done > 0 ? 'inline' : 'none';
}

// Navigation
function showMeetingList() {
    document.getElementById('meeting-list-view').style.display = 'block';
    document.getElementById('meeting-detail-view').style.display = 'none';
}

function showMeetingDetail() {
    document.getElementById('meeting-list-view').style.display = 'none';
    document.getElementById('meeting-detail-view').style.display = 'block';
}

// Tabs
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
}

// Toast
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
