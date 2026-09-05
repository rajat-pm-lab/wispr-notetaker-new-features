// State
let currentMeeting = null;
let completedActions = new Set();
let ctaStore = {};
let meetingsCache = [];

// Slack integration state (stored in localStorage)
function getSlackToken() { return localStorage.getItem('wispr_slack_token') || ''; }
function setSlackToken(token) { localStorage.setItem('wispr_slack_token', token); }
function clearSlackToken() { localStorage.removeItem('wispr_slack_token'); localStorage.removeItem('wispr_slack_bot_name'); localStorage.removeItem('wispr_slack_team'); }
function isSlackConnected() { return !!getSlackToken(); }
function getSlackBotName() { return localStorage.getItem('wispr_slack_bot_name') || 'your bot'; }
function getSlackTeam() { return localStorage.getItem('wispr_slack_team') || ''; }

// Icons
const ICONS = {
    email: '<svg width="16" height="12" viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><path d="M1.636 0h20.728L12 10.5z" fill="#EA4335"/><path d="M23.5 1.5L12 12 .5 1.5V16a2 2 0 002 2h19a2 2 0 002-2z" fill="#34A853"/><path d="M.5 1.5V16L9 9z" fill="#4285F4"/><path d="M23.5 1.5V16L15 9z" fill="#FBBC05"/></svg>',
    slack: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/><path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/><path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/><path d="M15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" fill="#ECB22E"/></svg>',
    calendar: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.316 2.053h1.895A3.789 3.789 0 0124 5.842v14.316A3.789 3.789 0 0120.211 24H3.789A3.789 3.789 0 010 20.158V5.842a3.789 3.789 0 013.789-3.79h1.895" fill="#4285F4"/><path d="M0 9.474h24v10.684A3.789 3.789 0 0120.211 24H3.789A3.789 3.789 0 010 20.158z" fill="#FFFFFF"/><rect x="3" y="11" width="4" height="3.5" rx="0.5" fill="#EA4335"/><rect x="10" y="11" width="4" height="3.5" rx="0.5" fill="#EA4335"/><rect x="17" y="11" width="4" height="3.5" rx="0.5" fill="#EA4335"/><rect x="3" y="17" width="4" height="3.5" rx="0.5" fill="#34A853"/><rect x="10" y="17" width="4" height="3.5" rx="0.5" fill="#34A853"/><rect x="17" y="17" width="4" height="3.5" rx="0.5" fill="#FBBC05"/><path d="M5.684 0a.947.947 0 01.948.947v2.053a.947.947 0 11-1.895 0V.947A.947.947 0 015.684 0zm12.632 0a.947.947 0 01.947.947v2.053a.947.947 0 11-1.895 0V.947A.947.947 0 0118.316 0z" fill="#4285F4"/></svg>',
    note: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    settings: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMeetings();
    loadCompletedActions();
    updateSettingsIndicator();

    // Event delegation for CTA buttons
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

// ===== SETTINGS PANEL =====
function openSettings() {
    const connected = isSlackConnected();
    const modal = document.createElement('div');
    modal.className = 'settings-overlay';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div class="settings-panel">
            <div class="settings-header">
                <h3>Integrations</h3>
                <button class="settings-close" onclick="this.closest('.settings-overlay').remove()">&times;</button>
            </div>
            <div class="settings-body">
                <div class="settings-section">
                    <div class="settings-section-header">
                        ${ICONS.slack}
                        <span>Slack Integration</span>
                        ${connected ? '<span class="settings-connected">Connected</span>' : '<span class="settings-disconnected">Not connected</span>'}
                    </div>
                    <p class="settings-description">
                        Connect your Slack workspace to post action items directly to your team channels.
                        Your token is stored locally in your browser only — never sent to our servers for storage.
                    </p>
                    <div class="settings-token-row">
                        <input type="password" class="settings-token-input" id="slack-token-input"
                            placeholder="Paste your Slack Bot Token (xoxb-...)"
                            value="${getSlackToken()}">
                        <button class="settings-save-btn" onclick="saveSlackToken()">
                            ${connected ? 'Update' : 'Connect'}
                        </button>
                    </div>
                    ${connected ? '<button class="settings-disconnect-btn" onclick="disconnectSlack()">Disconnect Slack</button>' : ''}
                    <details class="settings-help" open>
                        <summary>How to get your Slack Bot Token</summary>
                        <ol>
                            <li>Go to <a href="https://api.slack.com/apps" target="_blank">api.slack.com/apps</a> → <strong>Create New App</strong> → From scratch</li>
                            <li>Name your app (e.g. "Notetaker CTAs") and select your workspace</li>
                            <li>Go to <strong>OAuth & Permissions</strong> in the left sidebar</li>
                            <li>Scroll to <strong>Bot Token Scopes</strong> and add all 4 scopes:
                                <div class="settings-scopes">
                                    <code>chat:write</code> <span>— Post messages to channels</span><br>
                                    <code>channels:read</code> <span>— Find channels in your workspace</span><br>
                                    <code>users:read</code> <span>— Resolve user names for mentions</span><br>
                                    <code>users:read.email</code> <span>— Match attendees to Slack users</span>
                                </div>
                            </li>
                            <li>Click <strong>Install to Workspace</strong> at the top of the page and authorize</li>
                            <li>Copy the <strong>Bot User OAuth Token</strong> (<code>xoxb-...</code>) and paste it above</li>
                        </ol>
                        <div class="settings-note">
                            <strong>Already created an app?</strong> If you added new scopes, you must <strong>reinstall</strong> the app — look for the yellow banner at the top of the OAuth page. The token changes after reinstall.
                        </div>
                    </details>
                </div>
                <div class="settings-section">
                    <div class="settings-section-header">
                        ${ICONS.email}
                        <span>Email</span>
                        <span class="settings-connected">Ready</span>
                    </div>
                    <p class="settings-description">
                        Uses your default email client (Gmail, Outlook, Apple Mail). No setup needed — CTAs open a pre-filled compose window.
                    </p>
                </div>
                <div class="settings-section">
                    <div class="settings-section-header">
                        ${ICONS.calendar}
                        <span>Google Calendar</span>
                        <span class="settings-connected">Ready</span>
                    </div>
                    <p class="settings-description">
                        Opens Google Calendar with pre-filled event details. No setup needed — works with any Google account.
                    </p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveSlackToken() {
    const input = document.getElementById('slack-token-input');
    const saveBtn = document.querySelector('.settings-save-btn');
    const token = input.value.trim();

    if (!token) {
        showToast('Please enter a Slack Bot Token');
        return;
    }
    if (!token.startsWith('xoxb-')) {
        showToast('Token should start with xoxb-');
        return;
    }

    // Validate the token before saving
    saveBtn.textContent = 'Validating...';
    saveBtn.disabled = true;

    try {
        const res = await fetch('/api/actions/slack/validate', {
            method: 'POST',
            headers: { 'X-Slack-Token': token },
        });
        const data = await res.json();

        if (data.valid) {
            setSlackToken(token);
            localStorage.setItem('wispr_slack_bot_name', data.bot_user || 'your bot');
            localStorage.setItem('wispr_slack_team', data.team || '');
            document.querySelector('.settings-overlay').remove();
            updateSettingsIndicator();
            showToast(`Connected to ${data.team}! Slack CTAs are now live.`);
        } else {
            // Don't save the token if validation fails — this prevents the loop
            clearSlackToken();
            updateSettingsIndicator();
            saveBtn.textContent = 'Connect';
            saveBtn.disabled = false;
            showSlackValidationError(data);
        }
    } catch (err) {
        saveBtn.textContent = 'Connect';
        saveBtn.disabled = false;
        showToast('Could not validate token. Please try again.');
    }
}

function showSlackValidationError(data) {
    // Remove any existing validation message
    const existing = document.querySelector('.settings-validation');
    if (existing) existing.remove();

    const container = document.querySelector('.settings-token-row');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'settings-validation';

    if (data.error_code === 'not_authed' || data.error_code === 'invalid_auth') {
        errorDiv.innerHTML = `
            <div class="validation-error">
                <strong>Invalid token.</strong> Please check that you copied the full Bot User OAuth Token starting with <code>xoxb-</code>.
            </div>`;
    } else if (data.error_code === 'token_revoked') {
        errorDiv.innerHTML = `
            <div class="validation-error">
                <strong>Token revoked.</strong> Reinstall your Slack App and copy the new token.
            </div>`;
    } else if (data.scopes_missing && data.scopes_missing.length > 0) {
        errorDiv.innerHTML = `
            <div class="validation-error">
                <strong>Missing permissions.</strong> Your Slack App needs these scopes:
                <ul>${data.scopes_missing.map(s => `<li><code>${s}</code> — ${{'chat:write':'Post messages','channels:read':'Find channels','users:read':'Resolve user names','users:read.email':'Match attendees'}[s] || s}</li>`).join('')}</ul>
                <strong>To fix:</strong>
                <ol>
                    <li>Go to <a href="https://api.slack.com/apps" target="_blank">api.slack.com/apps</a> → click your app</li>
                    <li>Click <strong>OAuth & Permissions</strong> in the left sidebar</li>
                    <li>Scroll to <strong>Bot Token Scopes</strong> → click <strong>"Add an OAuth Scope"</strong> for each missing scope above</li>
                    <li>Scroll back to the top of the page → click <strong>"Install to Workspace"</strong> (or <strong>"Reinstall to Workspace"</strong> if already installed)</li>
                    <li>Click <strong>Allow</strong> to authorize</li>
                    <li>Copy the new <strong>Bot User OAuth Token</strong> (<code>xoxb-...</code>) and paste it above</li>
                </ol>
                <em>Note: The token changes after reinstalling. You must copy the new one.</em>
                ${data.granted_scopes ? `<div style="margin-top:8px;font-size:0.8rem;color:#888;"><strong>Your token currently has:</strong> ${data.granted_scopes.length > 0 ? data.granted_scopes.map(s => '<code>' + s + '</code>').join(', ') : '<em>no scopes detected</em>'}</div>` : ''}
            </div>`;
    } else {
        errorDiv.innerHTML = `
            <div class="validation-error">
                ${data.error || 'Something went wrong. Please check your Slack App configuration.'}
            </div>`;
    }

    container.parentNode.insertBefore(errorDiv, container.nextSibling);
}

function disconnectSlack() {
    clearSlackToken();
    document.querySelector('.settings-overlay').remove();
    updateSettingsIndicator();
    showToast('Slack disconnected');
}

function updateSettingsIndicator() {
    const indicator = document.getElementById('settings-indicator');
    if (indicator) {
        indicator.className = isSlackConnected() ? 'settings-dot connected' : 'settings-dot';
    }
}

// ===== DATA LOADING =====
async function loadMeetings() {
    const res = await fetch('/api/meetings');
    const meetings = await res.json();
    meetingsCache = meetings;
    renderMeetingList(meetings);
    // Auto-select first meeting for preview
    if (meetings.length > 0) {
        showPreview(meetings[0].id);
    }
}

async function loadCompletedActions() {
    const res = await fetch('/api/actions/completed');
    const completed = await res.json();
    completedActions = new Set(completed);
}

// ===== MEETING LIST =====
function renderMeetingList(meetings) {
    const container = document.getElementById('meeting-list-container');

    const grouped = {};
    meetings.forEach(m => {
        if (!grouped[m.date]) grouped[m.date] = [];
        grouped[m.date].push(m);
    });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    function formatDateLabel(dateStr) {
        const d = new Date(dateStr + 'T12:00:00');
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
        if (dateStr === today) return `TODAY, ${label}`;
        if (dateStr === yesterday) return `YESTERDAY, ${label}`;
        return label;
    }

    const totalMeetings = meetings.length;

    let html = `
        <div class="day-summary">
            <div class="day-summary-label">YOUR MEETINGS</div>
            <div class="day-summary-stats">You have ${totalMeetings} meetings with actionable next steps</div>
        </div>
        <div class="notes-tabs">
            <button class="notes-tab active">My notes</button>
            <button class="notes-tab">Shared with me</button>
            <svg class="notes-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
    `;

    Object.keys(grouped).sort((a, b) => b.localeCompare(a)).forEach(date => {
        html += `<div class="date-group-label">${formatDateLabel(date)}</div>`;
        grouped[date].forEach(m => {
            html += `
                <div class="meeting-card" data-meeting-id="${m.id}" onclick="loadMeeting('${m.id}')">
                    <div class="meeting-card-icon">${ICONS.note}</div>
                    <div class="meeting-card-info">
                        <div class="meeting-card-title">${m.title}</div>
                        <div class="meeting-card-meta">${m.time}</div>
                    </div>
                    <button class="meeting-card-more" onclick="event.stopPropagation(); loadMeeting('${m.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                </div>
            `;
        });
    });

    container.innerHTML = html;
}

// ===== MEETING DETAIL =====
async function loadMeeting(meetingId) {
    const res = await fetch(`/api/meetings/${meetingId}`);
    currentMeeting = await res.json();
    ctaStore = {};
    renderMeetingDetail(currentMeeting);
    showMeetingDetail();
}

function renderMeetingDetail(meeting) {
    document.getElementById('detail-title').textContent = meeting.title;
    document.getElementById('detail-meta').textContent =
        `${meeting.date} · ${meeting.time} · ${meeting.duration} · ${meeting.attendees.map(a => a.name).join(', ')}`;

    const sectionsEl = document.getElementById('summary-sections');
    sectionsEl.innerHTML = meeting.summary_sections.map(s => `
        <div class="summary-section">
            <h3>${s.title}</h3>
            <ul>
                ${s.bullets.map(b => `<li>${highlightNames(b, meeting.attendees)}</li>`).join('')}
            </ul>
        </div>
    `).join('');

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
        result = result.replace(new RegExp(`\\b${firstName}\\b`, 'g'),
            `<span class="name-highlight">${firstName}</span>`);
    });
    return result;
}

function renderCTA(cta, actionItem, index) {
    const icon = ICONS[cta.type] || '';
    const ctaId = `${actionItem.id}-cta-${index}`;
    ctaStore[ctaId] = cta;

    let badge = '';
    if (cta.type === 'slack' && !isSlackConnected()) {
        badge = '<span class="cta-demo-badge">demo</span>';
    }

    return `<button class="cta-btn ${cta.type}" data-cta-id="${ctaId}">
        ${icon} ${cta.label} ${badge}
    </button>`;
}

// ===== CTA HANDLERS =====

function handleEmailCTA(cta) {
    const to = (cta.recipients || []).join(',');
    const subject = encodeURIComponent(cta.subject || '');
    const body = encodeURIComponent(cta.body || '');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${to}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
    showToast('Opening Gmail...');
}

function handleSlackCTA(cta) {
    if (isSlackConnected()) {
        showSlackPreview(cta, true);
    } else {
        showSlackPreview(cta, false);
    }
}

function handleCalendarCTA(cta) {
    const title = cta.event_title || cta.subject || 'Follow-up Meeting';
    const description = cta.body || '';
    const attendees = (cta.recipients || []).join(',');

    let startDate, endDate;
    if (cta.event_date && cta.event_time) {
        const dt = new Date(`${cta.event_date}T${cta.event_time}:00`);
        const duration = cta.event_duration_minutes || 30;
        const endDt = new Date(dt.getTime() + duration * 60000);
        startDate = formatCalendarDate(dt);
        endDate = formatCalendarDate(endDt);
    } else {
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

// ===== SLACK MODAL =====

function showSlackPreview(cta, canSend) {
    const recipients = (cta.recipients || []).map(r => `@${r}`).join(' ');
    const channel = cta.channel || '#general';

    const modal = document.createElement('div');
    modal.className = 'slack-modal-overlay';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    const footer = canSend
        ? `<button class="slack-modal-btn cancel" onclick="this.closest('.slack-modal-overlay').remove()">Cancel</button>
           <button class="slack-modal-btn send" id="slack-send-btn">Send to Slack</button>`
        : `<div class="slack-demo-notice">
               <span class="slack-demo-icon">i</span>
               <span>Demo mode — <a href="javascript:void(0)" onclick="this.closest('.slack-modal-overlay').remove(); openSettings();">connect your Slack</a> to send live messages</span>
           </div>
           <button class="slack-modal-btn cancel" onclick="this.closest('.slack-modal-overlay').remove()">Close</button>`;

    modal.innerHTML = `
        <div class="slack-modal">
            <div class="slack-modal-header">
                <div class="slack-modal-title">
                    ${ICONS.slack}
                    <span id="slack-modal-header-label">${canSend ? 'Post' : 'Preview'}: ${channel}</span>
                </div>
                ${!canSend ? '<span class="slack-modal-demo-tag">DEMO</span>' : ''}
                <button class="slack-modal-close" onclick="this.closest('.slack-modal-overlay').remove()">&times;</button>
            </div>
            <div class="slack-modal-body">
                <div class="slack-modal-channel">
                    <label for="slack-channel-input">Channel:</label>
                    <div class="slack-channel-input-row">
                        <span class="slack-channel-hash">#</span>
                        <input type="text" id="slack-channel-input" class="slack-channel-input"
                            value="${channel.replace(/^#/, '')}"
                            placeholder="e.g. product-eng, design, general">
                    </div>
                </div>
                <div class="slack-modal-recipients">Mentioning: <strong>${recipients}</strong></div>
                <div class="slack-modal-divider"></div>
                <div class="slack-modal-message-label">Message preview</div>
                <div class="slack-modal-message">${(cta.body || '').replace(/\n/g, '<br>')}</div>
            </div>
            <div class="slack-modal-footer">
                ${footer}
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Update header label when channel input changes
    const channelInput = document.getElementById('slack-channel-input');
    const headerLabel = document.getElementById('slack-modal-header-label');
    channelInput.addEventListener('input', () => {
        const val = channelInput.value.trim();
        headerLabel.textContent = `${canSend ? 'Post' : 'Preview'}: #${val || 'general'}`;
    });

    // Attach send handler if connected
    if (canSend) {
        const sendBtn = document.getElementById('slack-send-btn');
        sendBtn.onclick = () => {
            const customChannel = '#' + (channelInput.value.trim() || 'general');
            sendSlackMessage(sendBtn, { ...cta, channel: customChannel });
        };
    }
}

async function sendSlackMessage(btn, cta) {
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/actions/slack', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Slack-Token': getSlackToken(),
            },
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
            // If auth/scope error, clear stored token so user must re-validate properly
            if (['missing_scope', 'not_authed', 'invalid_auth', 'token_revoked'].includes(data.message)) {
                clearSlackToken();
                updateSettingsIndicator();
            }
            showSlackErrorModal(data.message, cta.channel);
        }
    } catch (err) {
        btn.closest('.slack-modal-overlay').remove();
        showToast('Failed to connect to Slack');
    }
}

// Friendly Slack error messages — dynamic with actual bot name and channel
function getSlackErrorHelp(channel) {
    const botName = getSlackBotName();
    const channelDisplay = channel || '#general';
    return {
    'missing_scope': {
        title: 'Missing Permissions',
        message: 'Your Slack App needs additional permissions to send messages. Your token has been disconnected — follow these steps to fix it:',
        steps: [
            'Open <a href="https://api.slack.com/apps" target="_blank">api.slack.com/apps</a> and click on your app name',
            'In the left sidebar, click <strong>OAuth & Permissions</strong>',
            'Scroll to <strong>Bot Token Scopes</strong> and click <strong>"Add an OAuth Scope"</strong>',
            'Add all 4 required scopes: <code>chat:write</code>, <code>channels:read</code>, <code>users:read</code>, <code>users:read.email</code>',
            'Scroll to the top of the page and click <strong>"Install to Workspace"</strong> (or <strong>"Reinstall to Workspace"</strong>)',
            'Click <strong>Allow</strong> to authorize',
            'Copy the new <strong>Bot User OAuth Token</strong> (<code>xoxb-...</code>) — the token changes after reinstalling!',
            'Come back here → click the Settings gear icon → paste the new token → click <strong>Connect</strong>',
        ],
    },
    'not_configured': {
        title: 'Slack Not Connected',
        message: 'You haven\'t connected a Slack workspace yet.',
        steps: [
            'Click the <strong>Settings gear icon</strong> (top-right of the homepage)',
            'Follow the step-by-step guide under <strong>Slack Integration</strong> to create a Slack App and get your Bot Token',
        ],
    },
    'channel_not_found': {
        title: 'Channel Not Found',
        message: `The channel <strong>${channelDisplay}</strong> wasn't found in your Slack workspace. This usually means:`,
        steps: [
            `The channel <strong>${channelDisplay}</strong> doesn't exist — double-check the spelling in your Slack workspace`,
            `It's a <strong>private channel</strong> — <strong>@${botName}</strong> can only see public channels unless explicitly invited`,
            `To invite the bot to a private channel: open <strong>${channelDisplay}</strong> in Slack → type <code>/invite @${botName}</code>`,
        ],
    },
    'not_in_channel': {
        title: 'Bot Not in Channel',
        message: `<strong>@${botName}</strong> needs to be added to <strong>${channelDisplay}</strong> before it can post messages there.`,
        steps: [
            `Open <strong>${channelDisplay}</strong> in your Slack workspace`,
            `Type <code>/invite @${botName}</code> in the channel`,
            'Come back here and try sending again',
        ],
    },
    'not_authed': {
        title: 'Invalid Token',
        message: 'The Slack token you provided is not valid.',
        steps: [
            'Open <a href="https://api.slack.com/apps" target="_blank">api.slack.com/apps</a> → click your app',
            'Go to <strong>OAuth & Permissions</strong>',
            'Copy the <strong>Bot User OAuth Token</strong> (starts with <code>xoxb-</code>) — make sure you copy the entire string',
            'Click Settings here and paste the new token',
        ],
    },
    'invalid_auth': {
        title: 'Invalid Token',
        message: 'The token doesn\'t appear to be a valid Slack Bot Token.',
        steps: [
            'Make sure you\'re copying the <strong>Bot User OAuth Token</strong> (not the Signing Secret or Client Secret)',
            'The token should start with <code>xoxb-</code>',
            'Click Settings here and re-paste the correct token',
        ],
    },
    'token_revoked': {
        title: 'Token Expired',
        message: 'Your Slack token has been revoked or expired. This happens when the app is reinstalled or permissions change.',
        steps: [
            'Open <a href="https://api.slack.com/apps" target="_blank">api.slack.com/apps</a> → click your app',
            'Go to <strong>OAuth & Permissions</strong> → click <strong>Reinstall to Workspace</strong>',
            'After authorizing, copy the new <strong>Bot User OAuth Token</strong>',
            'Click Settings here and paste the new token',
        ],
    },
    };
}

function showSlackErrorModal(errorCode, channel) {
    const errorHelp = getSlackErrorHelp(channel);
    const help = errorHelp[errorCode] || {
        title: 'Slack Error',
        message: `Something went wrong (${errorCode}).`,
        steps: ['Check your Slack App configuration and try again.'],
    };

    const modal = document.createElement('div');
    modal.className = 'slack-modal-overlay';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div class="slack-modal">
            <div class="slack-modal-header">
                <div class="slack-modal-title">
                    ${ICONS.slack}
                    <span>${help.title}</span>
                </div>
                <button class="slack-modal-close" onclick="this.closest('.slack-modal-overlay').remove()">&times;</button>
            </div>
            <div class="slack-modal-body">
                <p class="slack-error-message">${help.message}</p>
                <div class="slack-error-steps">
                    <strong>How to fix:</strong>
                    <ol>
                        ${help.steps.map(s => `<li>${s}</li>`).join('')}
                    </ol>
                </div>
            </div>
            <div class="slack-modal-footer">
                <button class="slack-modal-btn cancel" onclick="this.closest('.slack-modal-overlay').remove()">Close</button>
                <button class="slack-modal-btn send" onclick="this.closest('.slack-modal-overlay').remove(); openSettings();">Open Settings</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ===== ACTION ITEM TRACKING =====

async function toggleComplete(actionId) {
    const isCompleted = completedActions.has(actionId);
    await fetch(`/api/actions/${actionId}/complete`, { method: isCompleted ? 'DELETE' : 'POST' });

    if (isCompleted) completedActions.delete(actionId);
    else completedActions.add(actionId);

    const el = document.getElementById(`action-${actionId}`);
    el.classList.toggle('completed');
    el.querySelector('.action-checkbox').classList.toggle('checked');
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

// ===== NAVIGATION =====

function showMeetingList() {
    document.getElementById('meeting-list-view').style.display = 'flex';
    document.getElementById('meeting-detail-view').style.display = 'none';
}

function showMeetingDetail() {
    document.getElementById('meeting-list-view').style.display = 'none';
    document.getElementById('meeting-detail-view').style.display = 'block';
}

// ===== PREVIEW PANEL =====
async function showPreview(meetingId) {
    // Highlight selected card
    document.querySelectorAll('.meeting-card').forEach(c => c.classList.remove('selected'));
    const selectedCard = document.querySelector(`.meeting-card[data-meeting-id="${meetingId}"]`);
    if (selectedCard) selectedCard.classList.add('selected');

    // Fetch meeting details for preview
    const res = await fetch(`/api/meetings/${meetingId}`);
    const meeting = await res.json();

    const previewEmpty = document.getElementById('preview-empty');
    const previewContent = document.getElementById('preview-content');
    previewEmpty.style.display = 'none';
    previewContent.style.display = 'block';

    document.getElementById('preview-title').textContent = meeting.title;

    const dateLabel = meeting.date === new Date().toISOString().split('T')[0] ? 'Today' :
        meeting.date === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'Yesterday' :
        meeting.date;
    document.getElementById('preview-meta').textContent = `${dateLabel} \u00B7 ${meeting.time}`;

    // Build overview from first few summary bullets
    const overviewBullets = meeting.summary_sections.flatMap(s => s.bullets).slice(0, 3);
    document.getElementById('preview-overview-text').textContent = overviewBullets.join(' ');

    // Wire up Open Note button
    document.getElementById('preview-open-btn').onclick = () => loadMeeting(meetingId);
}

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
