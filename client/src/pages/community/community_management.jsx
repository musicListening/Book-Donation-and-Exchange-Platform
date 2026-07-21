import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityAPI } from '../../services/api';
import { colors, Icon, CommunityAdminFonts, CommunitySidebar, CommunityHeader, useIsMdScreen } from '../../components/CommunityAdminUI';

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// Real customer message pulled from EventComment + User records.
function MessageCard({ message, onDelete, deleting, canDelete }) {
  const [hovered, setHovered] = useState(false);
  const initials = message.user.name.charAt(0).toUpperCase();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.surfaceContainerLowest,
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: 16,
        padding: 20,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.28s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02)' : 'none',
        opacity: deleting ? 0.5 : 1,
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
        <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 8, borderTop: `1px solid ${colors.outlineVariant}` }}>
          <button
            onClick={() => onDelete(message)}
            disabled={deleting}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'transparent', border: `1px solid ${colors.outlineVariant}`, borderRadius: 40, fontSize: 12, fontWeight: 500, cursor: deleting ? 'not-allowed' : 'pointer', color: colors.error }}
          >
            <Icon name="delete" size={16} /> {deleting ? 'Removing...' : 'Remove message'}
          </button>
        </div>
      )}
    </div>
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

  const handleDelete = async (message) => {
    if (!window.confirm(`Remove this message from ${message.user.name}?`)) return;
    setRemovingId(message.id);
    setError('');
    try {
      await communityAPI.deleteMessage(message.id);
      setMessages((current) => current.filter((item) => item.id !== message.id));
    } catch (requestError) {
      setError(requestError.message || 'Unable to remove the message.');
    } finally {
      setRemovingId(null);
    }
  };

  const filteredMessages = messages.filter((message) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    return message.content.toLowerCase().includes(term) || message.user.name.toLowerCase().includes(term);
  });

  return (
    <>
      <CommunityAdminFonts />
      <style>{`
        .message-grid { display: grid; grid-template-columns: 1fr; gap: 20px; padding-bottom: 20px; }
        @media (min-width: 768px) { .message-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1200px) { .message-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>

      <CommunitySidebar active="messages" open={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} isMd={isMd} />

      <main style={{ marginLeft: isMd ? 280 : 0, minHeight: '100vh', background: colors.surface, display: 'flex', flexDirection: 'column' }}>
        <CommunityHeader title="Message Moderation" isMd={isMd} onMenuClick={() => setSidebarOpen(true)} />

        <div className="content-wrapper" style={{ padding: 28, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: colors.secondary, letterSpacing: '0.08em', marginBottom: 4 }}>Moderation queue</p>
              <h3 style={{ fontSize: 26, fontWeight: 700, color: colors.primary, fontFamily: "'Playfair Display', serif" }}>Community messages</h3>
              <p style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 }}>Real messages posted by customers in the Community Hub.</p>
            </div>
            <div style={{ background: colors.surfaceContainerLowest, padding: '8px 20px', borderRadius: 40, fontSize: 14, border: `1px solid ${colors.outlineVariant}` }}>
              <span style={{ fontWeight: 700, color: colors.primary, fontSize: 18 }}>{filteredMessages.length}</span> <span style={{ color: colors.onSurfaceVariant }}>messages</span>
            </div>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by message or customer name..."
            style={{ width: '100%', maxWidth: 420, padding: '10px 14px', borderRadius: 8, border: `1px solid ${colors.outlineVariant}`, fontSize: 14, marginBottom: 24 }}
          />

          {error && <div style={{ marginBottom: 20, padding: 16, borderRadius: 8, background: colors.errorContainer, color: colors.onErrorContainer }}>{error}</div>}

          {loading && (
            <div style={{ textAlign: 'center', padding: 60, background: colors.surfaceContainerLowest, borderRadius: 12, border: `1px solid ${colors.outlineVariant}` }}>
              <p style={{ color: colors.onSurfaceVariant }}>Loading messages...</p>
            </div>
          )}

          {!loading && filteredMessages.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, background: colors.surfaceContainerLowest, borderRadius: 12, border: `1px solid ${colors.outlineVariant}` }}>
              <Icon name="forum" size={48} style={{ color: colors.onSurfaceVariant, opacity: 0.5 }} />
              <p style={{ marginTop: 16, color: colors.onSurfaceVariant }}>No community messages yet.</p>
            </div>
          )}

          {!loading && filteredMessages.length > 0 && (
            <div className="message-grid">
              {filteredMessages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onDelete={handleDelete}
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
    </>
  );
}
