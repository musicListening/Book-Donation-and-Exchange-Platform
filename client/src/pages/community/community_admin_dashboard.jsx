import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { communityAPI } from '../../services/api';
import { colors, Icon, CommunityAdminFonts, CommunitySidebar, CommunityHeader, useIsMdScreen } from '../../components/CommunityAdminUI';

function MetricCard({ icon, label, value, sub, subIcon, bg, fg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.surfaceContainerLowest,
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02)' : 'none',
      }}
    >
      <div style={{ padding: 12, borderRadius: '50%', background: bg, color: fg, flexShrink: 0, display: 'flex' }}>
        <Icon name={icon} size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 32, fontWeight: 700, lineHeight: '40px', color: colors.primary, fontFamily: "'Playfair Display', serif" }}>{value.toLocaleString()}</p>
        <span style={{ fontSize: 12, color: colors.secondary, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <Icon name={subIcon} size={14} />
          {sub}
        </span>
      </div>
    </div>
  );
}

function EventCard({ event, isLatest }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.surfaceContainerLowest,
        border: isLatest ? `2px solid ${colors.primary}` : `1px solid ${colors.outlineVariant}`,
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 10px 25px -5px rgba(0,0,0,0.05)' : 'none',
        position: 'relative',
      }}
    >
      {isLatest && (
        <div style={{ position: 'absolute', top: 12, right: 12, background: colors.primary, color: colors.onPrimary, padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, zIndex: 2, letterSpacing: '0.5px' }}>LATEST</div>
      )}
      <div style={{ height: 128, position: 'relative' }}>
        <img src={event.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=200&fit=crop'} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.secondary }}>Community event</span>
          <span style={{ fontSize: 12, color: colors.onSurfaceVariant, fontWeight: 500 }}>{new Date(event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
        <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: colors.onSurface, marginBottom: 8 }}>{event.title}</h4>
        <p style={{ fontSize: 13, color: colors.onSurfaceVariant, lineHeight: 1.5, flex: 1 }}>{event.description}</p>
      </div>
    </div>
  );
}

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export default function CommunityAdminDashboard() {
  const navigate = useNavigate();
  const isMd = useIsMdScreen();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, eventsThisMonth: 0, messagesToday: 0, totalMessages: 0 });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = currentUser();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsData, eventsData] = await Promise.all([communityAPI.getStats(), communityAPI.getEvents()]);
        setStats(statsData);
        setEvents([...eventsData].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate)));
      } catch (requestError) {
        setError(requestError.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const latestEvents = events.slice(0, 3);

  const metrics = [
    { icon: 'person', label: 'Active customers', value: stats.totalUsers, sub: 'Registered end users', subIcon: 'trending_up', bg: colors.primaryFixed, fg: colors.primary },
    { icon: 'event_available', label: 'Events this month', value: stats.eventsThisMonth, sub: `${events.length} published in total`, subIcon: 'calendar_month', bg: colors.tertiaryFixed, fg: colors.tertiary },
    { icon: 'chat', label: 'Messages today', value: stats.messagesToday, sub: `${stats.totalMessages} messages in total`, subIcon: 'sms', bg: colors.secondaryContainer, fg: colors.onSecondaryContainer },
  ];

  return (
    <>
      <CommunityAdminFonts />
      <style>{`
        .metric-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        @media (min-width: 640px) { .metric-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .metric-grid { grid-template-columns: repeat(3, 1fr); } }
        .event-grid { display: grid; grid-template-columns: 1fr; gap: 20px; padding-bottom: 20px; }
        @media (min-width: 768px) { .event-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .event-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>

      <CommunitySidebar active="dashboard" open={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} isMd={isMd} />

      <main style={{ marginLeft: isMd ? 280 : 0, minHeight: '100vh', background: colors.surface, display: 'flex', flexDirection: 'column' }}>
        <CommunityHeader title="Dashboard" isMd={isMd} onMenuClick={() => setSidebarOpen(true)} />

        <div className="content-wrapper" style={{ padding: 28, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: colors.secondary, letterSpacing: '0.08em', marginBottom: 4 }}>Overview</p>
            <h3 style={{ fontSize: 26, fontWeight: 700, color: colors.primary, fontFamily: "'Playfair Display', serif" }}>Welcome back{user?.name ? `, ${user.name}` : ''}</h3>
            <p style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 }}>A live snapshot of the ShareShelf community.</p>
          </div>

          {error && <div style={{ marginBottom: 20, padding: 16, borderRadius: 8, background: colors.errorContainer, color: colors.onErrorContainer }}>{error}</div>}

          <div className="metric-grid" style={{ marginBottom: 40 }}>
            {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: colors.onSurface, fontFamily: "'Playfair Display', serif" }}>Latest events</h3>
            <Link to="/community-admin/events" style={{ color: colors.primary, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              Manage events <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 60, background: colors.surfaceContainerLowest, borderRadius: 12, border: `1px solid ${colors.outlineVariant}` }}>
              <p style={{ color: colors.onSurfaceVariant }}>Loading events...</p>
            </div>
          )}

          {!loading && latestEvents.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, background: colors.surfaceContainerLowest, borderRadius: 12, border: `1px solid ${colors.outlineVariant}` }}>
              <Icon name="event_busy" size={48} style={{ color: colors.onSurfaceVariant, opacity: 0.5 }} />
              <p style={{ marginTop: 16, color: colors.onSurfaceVariant }}>No events published yet.</p>
            </div>
          )}

          {!loading && latestEvents.length > 0 && (
            <div className="event-grid">
              {latestEvents.map((event, index) => <EventCard key={event.id} event={event} isLatest={index === 0} />)}
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
