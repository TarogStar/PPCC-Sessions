// Session Browser Application
let allSessions = [];
let filteredSessions = [];
let interestedSessions = new Set();

// Load interested sessions from localStorage
function loadInterestedSessions() {
    const saved = localStorage.getItem('interestedSessions');
    if (saved) {
        interestedSessions = new Set(JSON.parse(saved));
    }
}

// Save interested sessions to localStorage
function saveInterestedSessions() {
    localStorage.setItem('interestedSessions', JSON.stringify([...interestedSessions]));
}

// Toggle interest in a session
function toggleInterest(sessionId) {
    if (interestedSessions.has(sessionId)) {
        interestedSessions.delete(sessionId);
    } else {
        interestedSessions.add(sessionId);
    }
    saveInterestedSessions();
    applyFilters();
}

// Check if session has Microsoft speakers
function hasMicrosoftSpeakers(session) {
    if (!session.speaker_group || session.speaker_group.length === 0) return false;

    for (const group of session.speaker_group) {
        if (group.list && group.list.length > 0) {
            for (const speaker of group.list) {
                if (speaker.aff && speaker.aff.toLowerCase().includes('microsoft')) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Find overlapping sessions
function findOverlappingSessions() {
    const overlaps = new Map();

    for (let i = 0; i < allSessions.length; i++) {
        const session1 = allSessions[i];
        const overlapping = [];

        for (let j = 0; j < allSessions.length; j++) {
            if (i === j) continue;

            const session2 = allSessions[j];

            // Check if sessions overlap in time
            const start1 = parseInt(session1.start_unix);
            const end1 = parseInt(session1.end_unix);
            const start2 = parseInt(session2.start_unix);
            const end2 = parseInt(session2.end_unix);

            if ((start1 < end2 && end1 > start2)) {
                overlapping.push(session2.id);
            }
        }

        if (overlapping.length > 0) {
            overlaps.set(session1.id, overlapping);
        }
    }

    return overlaps;
}

// Format time for display
function formatTime(timeStr) {
    return timeStr; // Already in "9:00 AM" format
}

// Format date for display (in Pacific Time - Las Vegas timezone)
function formatDate(dateStr) {
    // Parse as Pacific Time to match conference location
    const date = new Date(dateStr + 'T00:00:00-07:00'); // PDT offset
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'America/Los_Angeles'
    });
}

// Create session card HTML
function createSessionCard(session, overlappingSessionIds) {
    const hasMicrosoft = hasMicrosoftSpeakers(session);
    const hasOverlap = overlappingSessionIds && overlappingSessionIds.length > 0;
    const isInterested = interestedSessions.has(session.id);

    // Get all speakers
    let speakers = [];
    if (session.speaker_group && session.speaker_group.length > 0) {
        session.speaker_group.forEach(group => {
            if (group.list) {
                speakers = speakers.concat(group.list);
            }
        });
    }

    const card = document.createElement('div');
    card.className = 'session-card';
    if (hasMicrosoft) card.classList.add('microsoft-session');
    if (hasOverlap) card.classList.add('has-overlap');
    if (isInterested) card.classList.add('interested');

    const speakerNames = speakers.map(s => {
        const isMicrosoft = s.aff && s.aff.toLowerCase().includes('microsoft');
        return `<span class="${isMicrosoft ? 'microsoft-speaker' : ''}">${s.name}</span>`;
    }).join(', ');

    card.innerHTML = `
        <div class="session-header" onclick="toggleExpand('${session.id}')">
            <div class="session-badges">
                ${hasMicrosoft ? '<span class="badge microsoft-badge">MS</span>' : '<span style="width:28px;display:inline-block"></span>'}
                ${hasOverlap ? '<span class="badge overlap-badge">' + overlappingSessionIds.length + '</span>' : ''}
            </div>
            <div class="session-main-info">
                <div class="session-time">${formatTime(session.start)} - ${formatTime(session.end)}</div>
                <h3 class="session-title" title="${session.title}">${session.title}</h3>
                <div class="session-speakers-preview">${speakers.length > 0 ? speakerNames : 'No speakers listed'}</div>
                <div class="session-location">${session.loc || 'TBA'}</div>
            </div>
            <button class="interest-btn ${isInterested ? 'interested' : ''}"
                    onclick="event.stopPropagation(); toggleInterest('${session.id}')"
                    title="${isInterested ? 'Remove from interested' : 'Mark as interested'}">
                ${isInterested ? '★' : '☆'}
            </button>
            <button class="expand-btn">▼</button>
        </div>
        <div class="session-details" id="details-${session.id}">
            <div class="session-description">
                <h4>Description</h4>
                <p>${session.desc || 'No description available.'}</p>
            </div>
            ${speakers.length > 0 ? `
                <div class="session-speakers">
                    <h4>Speakers</h4>
                    <div class="speakers-list">
                        ${speakers.map(speaker => `
                            <div class="speaker-card">
                                ${speaker.pic ? `<img src="${speaker.pic}" alt="${speaker.name}" class="speaker-photo" onerror="this.style.display='none'">` : ''}
                                <div class="speaker-info">
                                    <div class="speaker-name">${speaker.name}</div>
                                    ${speaker.title ? `<div class="speaker-title">${speaker.title}</div>` : ''}
                                    ${speaker.aff ? `<div class="speaker-affiliation ${speaker.aff.toLowerCase().includes('microsoft') ? 'microsoft-aff' : ''}">${speaker.aff}</div>` : ''}
                                    ${speaker.loc ? `<div class="speaker-location">${speaker.loc}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${hasOverlap ? `
                <div class="overlapping-sessions">
                    <h4>⚠️ This session overlaps with:</h4>
                    <ul>
                        ${overlappingSessionIds.slice(0, 5).map(id => {
                            const overlappingSession = allSessions.find(s => s.id === id);
                            if (overlappingSession) {
                                return `<li><strong>${overlappingSession.title}</strong> (${overlappingSession.start} - ${overlappingSession.end})</li>`;
                            }
                            return '';
                        }).join('')}
                        ${overlappingSessionIds.length > 5 ? `<li><em>...and ${overlappingSessionIds.length - 5} more</em></li>` : ''}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;

    return card;
}

// Toggle session details expansion
function toggleExpand(sessionId) {
    const details = document.getElementById(`details-${sessionId}`);
    const card = details.closest('.session-card');
    const expandBtn = card.querySelector('.expand-btn');

    if (details.style.display === 'block') {
        details.style.display = 'none';
        expandBtn.textContent = '▼';
        card.classList.remove('expanded');
    } else {
        details.style.display = 'block';
        expandBtn.textContent = '▲';
        card.classList.add('expanded');
    }
}

// Apply filters
function applyFilters() {
    const filterMicrosoft = document.getElementById('filterMicrosoft').checked;
    const filterOverlaps = document.getElementById('filterOverlaps').checked;
    const filterInterested = document.getElementById('filterInterested').checked;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;

    const overlaps = findOverlappingSessions();
    // Get current date in Pacific Time (Las Vegas conference location)
    const todayPacific = new Date().toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });
    const today = new Date(todayPacific);

    filteredSessions = allSessions.filter(session => {
        // Filter by Microsoft
        if (filterMicrosoft && !hasMicrosoftSpeakers(session)) return false;

        // Filter by overlaps
        if (filterOverlaps && !overlaps.has(session.id)) return false;

        // Filter by interested
        if (filterInterested && !interestedSessions.has(session.id)) return false;

        // Filter by date
        if (dateFilter !== 'all' && session.date !== dateFilter) return false;

        // Hide past dates unless specifically selected (compare in Pacific Time)
        if (dateFilter === 'all') {
            const sessionDate = new Date(session.date + 'T00:00:00-07:00');
            if (sessionDate < today) return false;
        }

        // Filter by search term
        if (searchTerm) {
            const titleMatch = session.title.toLowerCase().includes(searchTerm);
            const descMatch = session.desc && session.desc.toLowerCase().includes(searchTerm);
            let speakerMatch = false;

            if (session.speaker_group) {
                session.speaker_group.forEach(group => {
                    if (group.list) {
                        group.list.forEach(speaker => {
                            if (speaker.name.toLowerCase().includes(searchTerm)) {
                                speakerMatch = true;
                            }
                        });
                    }
                });
            }

            if (!titleMatch && !descMatch && !speakerMatch) return false;
        }

        return true;
    });

    renderSessions(overlaps);
}

// Render sessions
function renderSessions(overlaps) {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '';

    if (filteredSessions.length === 0) {
        sessionList.innerHTML = '<div class="no-results">No sessions match your filters. Try adjusting your search criteria.</div>';
        updateStats();
        return;
    }

    // Group by date
    const sessionsByDate = {};
    filteredSessions.forEach(session => {
        if (!sessionsByDate[session.date]) {
            sessionsByDate[session.date] = [];
        }
        sessionsByDate[session.date].push(session);
    });

    // Sort dates
    const sortedDates = Object.keys(sessionsByDate).sort();

    // Render each date group
    sortedDates.forEach(date => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'date-group';

        // Only show date header if there are multiple dates
        if (sortedDates.length > 1) {
            const dateHeader = document.createElement('h2');
            dateHeader.className = 'date-header';
            dateHeader.textContent = formatDate(date);
            dateGroup.appendChild(dateHeader);
        }

        // Sort sessions by time
        const sessions = sessionsByDate[date].sort((a, b) => {
            return parseInt(a.start_unix) - parseInt(b.start_unix);
        });

        sessions.forEach(session => {
            const overlappingIds = overlaps.get(session.id) || [];
            const card = createSessionCard(session, overlappingIds);
            dateGroup.appendChild(card);
        });

        sessionList.appendChild(dateGroup);
    });

    updateStats();
}

// Update statistics
function updateStats() {
    const sessionCount = document.getElementById('sessionCount');
    const interestedCount = interestedSessions.size;
    sessionCount.textContent = `Showing ${filteredSessions.length} of ${allSessions.length} sessions | ${interestedCount} marked as interested`;
}

// Populate date filter
function populateDateFilter() {
    const dateFilter = document.getElementById('dateFilter');
    const dates = [...new Set(allSessions.map(s => s.date))].sort();

    dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = formatDate(date);
        dateFilter.appendChild(option);
    });
}

// Load sessions from JSON
async function loadSessions() {
    try {
        const response = await fetch('sessions.json');
        const data = await response.json();

        // Handle wrapped JSON structure
        if (data.result && data.result.sessions) {
            allSessions = data.result.sessions;
        } else if (data.sessions) {
            allSessions = data.sessions;
        } else {
            allSessions = [];
        }

        console.log(`Loaded ${allSessions.length} sessions`);

        loadInterestedSessions();
        populateDateFilter();
        applyFilters();
    } catch (error) {
        console.error('Error loading sessions:', error);
        document.getElementById('sessionList').innerHTML =
            '<div class="error">Error loading sessions. Please make sure sessions.json is in the same directory.</div>';
    }
}

// Toggle filters panel
function toggleFiltersPanel() {
    const filtersPanel = document.getElementById('filtersPanel');
    const toggleBtn = document.getElementById('toggleFilters');

    filtersPanel.classList.toggle('collapsed');

    if (filtersPanel.classList.contains('collapsed')) {
        toggleBtn.textContent = '▶ Show Filters';
    } else {
        toggleBtn.textContent = '▼ Hide Filters';
    }
}

// Event listeners
document.getElementById('filterMicrosoft').addEventListener('change', applyFilters);
document.getElementById('filterOverlaps').addEventListener('change', applyFilters);
document.getElementById('filterInterested').addEventListener('change', applyFilters);
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('dateFilter').addEventListener('change', applyFilters);
document.getElementById('toggleFilters').addEventListener('click', toggleFiltersPanel);

// Make functions globally available
window.toggleExpand = toggleExpand;
window.toggleInterest = toggleInterest;

// Initialize
loadSessions();
