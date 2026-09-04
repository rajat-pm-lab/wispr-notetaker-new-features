// State
let currentMeeting = null;
let completedActions = new Set();
let ctaStore = {}; // Store CTA data by ID to avoid inline JS issues

// Icons
const ICONS = {
    email: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    slack: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z"/></svg>',
    calendar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    note: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMeetings();
    loadCompletedActions();

    // Event delegation for all CTA buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cta-id]');
        if (!btn) return;
        const ctaId = btn.getAttribute('data-cta-id');
        const cta = ctaStore[ctaId];
        if (!cta) return;

        if (cta.type === 'email') handleEmailCTA(cta);
        else if (cta.type === 'slack') handleSlackCTA(cta);
        else if (cta.type === 'calendar') handleCalendarCTA(cta);
    });
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

    // Group meetings by date
    const grouped = {};
    meetings.forEach(m => {
        const dateKey = m.date;
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(m);
    });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    function formatDateLabel(dateStr) {
        if (dateStr === today) return `TODAY, ${formatShortDate(dateStr)}`;
        if (dateStr === yesterday) return `YESTERDAY, ${formatShortDate(dateStr)}`;
        return formatShortDate(dateStr).toUpperCase();
    }

    function formatShortDate(dateStr) {
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Calculate total words (simulated)
    const totalMeetings = meetings.length;
    const totalWords = meetings.reduce((sum, m) => sum + Math.floor(Math.random() * 3000 + 1500), 0);

    let html = `
        <div class="day-summary">
            <div class="day-summary-label">YOUR MEETINGS</div>
            <div class="day-summary-stats">You captured ${totalWords.toLocaleString()} words across ${totalMeetings} meetings</div>
        </div>
        <div class="notes-tabs">
            <button class="notes-tab active">My notes</button>
            <button class="notes-tab">Shared with me</button>
            <svg class="notes-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
    `;

    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    sortedDates.forEach(date => {
        html += `<div class="date-group-label">${formatDateLabel(date)}</div>`;
        grouped[date].forEach(m => {
            html += `
                <div class="meeting-card" onclick="loadMeeting('${m.id}')" data-meeting-id="${m.id}">
                    <div class="meeting-card-icon">${ICONS.note}</div>
                    <div class="meeting-card-info">
                        <div class="meeting-card-title">${m.title}</div>
                        <div class="meeting-card-meta">${m.time}</div>
                    </div>
                </div>
            `;
        });
    });

    container.innerHTML = html;
}

async function loadMeeting(meetingId) {
    const res = await fetch(`/api/meetings/${meetingId}`);
    currentMeeting = await res.json();
    ctaStore = {}; // Reset CTA store for new meeting
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
                ${s.bullets.map(b => `<li>${highlightNames(b, meeting.attendees)}</li>`).join('')}
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
                        ${item.ctas.map((cta, idx) => renderCTA(cta, item, idx)).join('')}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    updateCompletionBadge(meeting);
}

function highlightNames(text, attendees) {
    let result = text;
    attendees.forEach(a => {
        const firstName = a.name.split(' ')[0];
        const regex = new RegExp(`\\b${firstName}\\b`, 'g');
        result = result.replace(regex, `<span class="name-highlight">${firstName}</span>`);
    });
    return result;
}

function renderCTA(cta, actionItem, index) {
    const icon = ICONS[cta.type] || '';
    // Store CTA data with unique ID
    const ctaId = `${actionItem.id}-cta-${index}`;
    ctaStore[ctaId] = cta;

    return `<button class="cta-btn ${cta.type}" data-cta-id="${ctaId}">
        ${icon} ${cta.label}
    </button>`;
}

// CTA Handlers — all use direct mailto/URL opening, no server round-trip needed for email/calendar
function handleEmailCTA(cta) {
    const to = (cta.recipients || []).join(',');
    const subject = encodeURIComponent(cta.subject || '');
    const body = encodeURIComponent(cta.body || '');
    const url = `mailto:${to}?subject=${subject}&body=${body}`;
    window.location.href = url;
    showToast('Opening email client...');
}

function handleSlackCTA(cta) {
    // For demo: show the pre-filled message in a modal, since Slack API needs server-side auth
    showSlackPreview(cta);
}

function handleCalendarCTA(cta) {
    const title = cta.event_title || cta.subject || 'Follow-up Meeting';
    const description = cta.body || '';
    const attendees = (cta.recipients || []).join(',');

    // Parse date and time
    let startDate, endDate;
    if (cta.event_date && cta.event_time) {
        const dt = new Date(`${cta.event_date}T${cta.event_time}:00`);
        const duration = cta.event_duration_minutes || 30;
        const endDt = new Date(dt.getTime() + duration * 60000);
        startDate = formatCalendarDate(dt);
        endDate = formatCalendarDate(endDt);
    } else {
        // Default: tomorrow at 10am, 30 min
        const tomorrow = new Date(Date.now() + 86400000);
        tomorrow.setHours(10, 0, 0, 0);
        const endTomorrow = new Date(tomorrow.getTime() + 30 * 60000);
        startDate = formatCalendarDate(tomorrow);
        endDate = formatCalendarDate(endTomorrow);
    }

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${startDate}/${endDate}`,
        details: description,
        add: attendees,
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
    showToast('Opening Google Calendar...');
}

function formatCalendarDate(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Slack preview modal (since actual Slack posting needs server auth)
function showSlackPreview(cta) {
    const recipients = (cta.recipients || []).map(r => `@${r}`).join(' ');
    const channel = cta.channel || '#general';

    const modal = document.createElement('div');
    modal.className = 'slack-modal-overlay';
    modal.innerHTML = `
        <div class="slack-modal">
            <div class="slack-modal-header">
                <div class="slack-modal-title">
                    ${ICONS.slack}
                    <span>Post to ${channel}</span>
                </div>
                <button class="slack-modal-close" onclick="this.closest('.slack-modal-overlay').remove()">&times;</button>
            </div>
            <div class="slack-modal-body">
                <div class="slack-modal-channel">Channel: <strong>${channel}</strong></div>
                <div class="slack-modal-recipients">Mentioning: <strong>${recipients}</strong></div>
                <div class="slack-modal-message">${(cta.body || '').replace(/\n/g, '<br>')}</div>
            </div>
            <div class="slack-modal-footer">
                <button class="slack-modal-btn cancel" onclick="this.closest('.slack-modal-overlay').remove()">Cancel</button>
                <button class="slack-modal-btn send" onclick="sendSlackMessage(this, '${btoa(JSON.stringify(cta))}')">Send to Slack</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function sendSlackMessage(btn, ctaB64) {
    const cta = JSON.parse(atob(ctaB64));
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/actions/slack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channel: cta.channel || '#general',
                recipients: cta.recipients || [],
                message: cta.body || '',
                meeting_title: currentMeeting ? currentMeeting.title : 'Meeting',
            }),
        });
        const data = await res.json();

        btn.closest('.slack-modal-overlay').remove();

        if (data.success) {
            showToast(`Message posted to ${cta.channel}`);
            if (data.url) window.open(data.url, '_blank');
        } else {
            showToast(data.message || 'Failed to post to Slack');
        }
    } catch (err) {
        btn.closest('.slack-modal-overlay').remove();
        showToast('Failed to connect to Slack');
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
