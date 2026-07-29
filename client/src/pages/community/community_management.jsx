import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityAPI } from '../../services/api';
import { colors, space, radius, Icon, Button, Alert, SkeletonCard, EmptyState, CommunityConfirm, CommunityAdminFonts, CommunitySidebar, CommunityHeader, useIsMdScreen } from '../../components/CommunityAdminUI';

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// Real customer message pulled from EventComment + User records.
function MessageCard({ message, onDelete, deleting, canDelete }) {
  const initials = message.user.name.charAt(0).toUpperCase();

  return (
    <article
      className="lift-card"
      aria-busy={deleting || undefined}
      style={{
        background: colors.surfaceContainerLowest,
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: radius.lg,
        padding: space.lg,
        opacity: deleting ? 0.55 : 1,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: colors.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary, fontWeight: 600, fontSize: 16, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: colors.onSurface, fontSize: 16 }}>{message.user.name}</span>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 40, fontSize: 11, fontWeight: 600, background: colors.surfaceContainer, color: colors.onSurfaceVariant, border: `1px solid ${colors.outlineVariant}` }}>
              {message.user.role === 'END_USER' ? 'Customer' : message.user.role}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.onSurfaceVariant, fontSize: 12 }}>
            <Icon name="schedule" size={14} />
            <span>{new Date(message.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 0 8px 0', color: colors.onSurface, fontSize: 14, lineHeight: 1.55, borderTop: `1px solid ${colors.outlineVariant}`, marginTop: 4 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Icon name="format_quote" size={18} style={{ color: colors.outlineVariant, flexShrink: 0 }} />
          <p style={{ margin: 0, flex: 1, wordBreak: 'break-word' }}>{message.content}</p>
        </div>
      </div>

      {canDelete && (
        <div style={{ display: 'flex', gap: 12, marginTop: space.md, paddingTop: space.sm, borderTop: `1px solid ${colors.outlineVariant}` }}>
          <Button
            variant="danger"
            size="sm"
            icon="delete"
            onClick={() => onDelete(message)}
            loading={deleting}
            aria-label={`Remove message from ${message.user.name}`}
          >
            {deleting ? 'Removing...' : 'Remove message'}
          </Button>
        </div>
      )}
    </article>
  );
}

export default function MessageModeration() {
  const navigate = useNavigate();
  const isMd = useIsMdScreen();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [search, setSearch] = useState('');
  const user = currentUser();

  const loadMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await communityAPI.getMessages();
      setMessages([...data].reverse());
    } catch (requestError) {
      setError(requestError.message || 'Unable to load community messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, []);

  const handleDelete = async () => {
    const message = pendingDelete;
    if (!message) return;
    setRemovingId(message.id);
    setError('');
    try {
      await communityAPI.deleteMessage(message.id);
      setMessages((current) => current.filter((item) => item.id !== message.id));
      setPendingDelete(null);
    } catch (requestError) {
      setError(requestError.message || 'Unable to remove the message.');
      setPendingDelete(null);
    } finally {
      setRemovingId(null);
    }
  };

  const filteredMessages = messages.filter((message) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    return message.content.toLowerCase().includes(term) || message.user.name.toLowerCase().includes(term);
  });
  const today = new Date().toDateString();
  const todayCount = messages.filter((message) => new Date(message.createdAt).toDateString() === today).length;

  return (
    <>
      <CommunityAdminFonts />
      <style>{`
        .message-grid { display: grid; grid-template-columns: 1fr; gap: 20px; padding-bottom: 20px; }
        @media (min-width: 768px) { .message-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1200px) { .message-grid { grid-template-columns: repeat(3, 1fr); } }
        .message-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }
        @media (max-width: 1024px) {
          .message-hero { grid-template-columns: 1fr; }
        }
      `}</style>

      <CommunitySidebar active="messages" open={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} isMd={isMd} />

      <main style={{ marginLeft: isMd ? 280 : 0, minHeight: '100vh', background: colors.surface, display: 'flex', flexDirection: 'column' }}>
        <CommunityHeader title="Message Moderation" subtitle="Community messages" isMd={isMd} onMenuClick={() => setSidebarOpen(true)} action={<button onClick={loadMessages} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999, border: `1px solid ${colors.accentBorder}`, background: colors.accentSoft, color: colors.primary, fontWeight: 700, cursor: 'pointer' }}><Icon name="refresh" size={18} /> Refresh</button>} />

        <div className="content-wrapper" style={{ padding: 36, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <div className="message-hero">
            <section className="soft-card" style={{ padding: 30 }}>
              <p className="eyebrow">Messages</p>
              <h3 className="page-title">Community messages</h3>
              <p className="page-subtitle">Search messages and remove anything that should not stay visible.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
                <div className="metric-pill"><span style={{ color: colors.inkSoft, fontSize: 12 }}>Visible now</span><strong>{filteredMessages.length}</strong></div>
                <div className="metric-pill"><span style={{ color: colors.inkSoft, fontSize: 12 }}>Posted today</span><strong>{todayCount}</strong></div>
              </div>
            </section>
            <section className="soft-card" style={{ padding: 30 }}>
              <p className="eyebrow">Note</p>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: colors.onSurfaceVariant }}>{user?.role === 'COMMUNITY_ADMIN' ? 'Use search first, then remove messages only when needed.' : 'This view is read-only for your role.'}</p>
            </section>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: space.lg }}>
            <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 460 }}>
              <label htmlFor="message-search" className="visually-hidden">Search messages by content or customer name</label>
              <Icon name="search" size={19} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: colors.inkSoft, pointerEvents: 'none' }} />
              <input
                id="message-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by message or customer name..."
                style={{ width: '100%', padding: '14px 44px', borderRadius: radius.pill, border: `1px solid ${colors.accentBorder}`, fontSize: 14, background: colors.surfaceContainerLowest, boxShadow: '0 10px 24px rgba(10,59,50,0.04)', fontFamily: 'inherit', color: colors.onSurface }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', padding: 7, borderRadius: '50%', border: 'none', background: colors.surfaceContainerHigh, color: colors.onSurfaceVariant }}
                >
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
            <div style={{ padding: '10px 16px', borderRadius: radius.pill, border: `1px solid ${colors.accentBorder}`, background: colors.accentSoft, color: colors.inkSoft, fontSize: 13 }}>Newest first</div>
          </div>

          {/* Announced to screen readers as the filter narrows the list */}
          <p aria-live="polite" className="visually-hidden">
            {loading ? 'Loading messages' : `${filteredMessages.length} ${filteredMessages.length === 1 ? 'message' : 'messages'} shown`}
          </p>

          {error && <Alert onRetry={loadMessages}>{error}</Alert>}

          {loading && (
            <div className="message-grid" aria-hidden="true">
              {[0, 1, 2].map((n) => <SkeletonCard key={n} />)}
            </div>
          )}

          {!loading && filteredMessages.length === 0 && (
            search.trim()
              ? <EmptyState
                  icon="search_off"
                  title="No messages match that search"
                  message={`Nothing found for "${search.trim()}". Try a different name or word.`}
                  action={<Button variant="accent" onClick={() => setSearch('')}>Clear search</Button>}
                />
              : <EmptyState
                  icon="forum"
                  title="No community messages yet"
                  message="When members comment on events, their messages show up here for review."
                />
          )}

          {!loading && filteredMessages.length > 0 && (
            <div className="message-grid">
              {filteredMessages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onDelete={setPendingDelete}
                  deleting={removingId === message.id}
                  canDelete={user?.role === 'COMMUNITY_ADMIN'}
                />
              ))}
            </div>
          )}
        </div>

        <footer style={{ flexShrink: 0, padding: '28px 32px', textAlign: 'center', borderTop: `1px solid ${colors.outlineVariant}`, background: colors.surfaceContainerLowest }}>
          <p style={{ fontSize: 13, color: `${colors.onSurfaceVariant}CC` }}>© 2026 Community Admin Ecosystem — Growing together, sustainably.</p>
        </footer>
      </main>

      <CommunityConfirm
        open={Boolean(pendingDelete)}
        destructive
        busy={Boolean(removingId)}
        title="Remove this message?"
        message={pendingDelete ? `${pendingDelete.user.name}'s message will no longer be visible to the community. This cannot be undone.` : ''}
        confirmLabel="Remove message"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
