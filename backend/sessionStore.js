/**
 * Google Photos — Better Search MVP
 * Session Store (Phase 6)
 * In-memory storage for active clarification sessions with automatic expiration.
 */

const sessions = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

function createSession(sessionId, initialData = {}) {
  const session = {
    sessionId,
    query: initialData.query || '',
    step: initialData.step || 1,
    appliedFilters: initialData.appliedFilters || [],
    answeredDimensions: initialData.answeredDimensions || [],
    unanswerableDimensions: initialData.unanswerableDimensions || [],
    candidateIds: initialData.candidateIds || [],
    candidateCount: initialData.candidateCount || 0,
    previousCount: initialData.previousCount || null,
    currentQuestion: initialData.currentQuestion || null,
    isEarlyStop: Boolean(initialData.isEarlyStop),
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  sessions.set(sessionId, session);
  return session;
}

function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

function updateSession(sessionId, updates = {}) {
  const existing = sessions.get(sessionId);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...updates,
    lastUpdated: new Date().toISOString()
  };

  sessions.set(sessionId, updated);
  return updated;
}

function deleteSession(sessionId) {
  return sessions.delete(sessionId);
}

// Periodic cleanup of stale sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    const age = now - new Date(session.lastUpdated).getTime();
    if (age > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}, 5 * 60 * 1000);

module.exports = {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  sessions
};
