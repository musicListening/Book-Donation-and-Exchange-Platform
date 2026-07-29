import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { communityAPI } from '../../services/api';
import { colors, space, radius, elevation, motion, Icon, Button, Chip, SkeletonCard, EmptyState, CommunityAdminFonts, CommunitySidebar, CommunityHeader, useIsMdScreen } from '../../components/CommunityAdminUI';

function MetricCard({ icon, label, value, sub, subIcon, bg, fg }) {
  return (
    <div
      className="lift-card"
      style={{
        background: colors.surfaceContainerLowest,
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: radius.md,
        padding: space.lg,
        display: 'flex',
        alignItems: 'flex-start',
        gap: space.md,
      }}
    >
      <div style={{ padding: 12, borderRadius: '50%', background: bg, color: fg, flexShrink: 0, display: 'flex' }}>
        <Icon name={icon} size={24} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11.5, fontWeight: 600, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
        {/* Tabular figures stop the numbers jittering as they change */}
        <p style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.15, marginTop: 4, color: colors.primary, fontFamily: "'Playfair Display', serif", fontVariantNumeric: 'tabular-nums' }}>
          {value.toLocaleString()}
        </p>
        <span style={{ fontSize: 12, color: colors.secondary, display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: space.xs }}>
          <Icon name={subIcon} size={14} />
          {sub}
        </span>
      </div>
    </div>
  );
}

function EventCard({ event, isLatest }) {
  const participants = event.participants || [];
  const participantCount = event.participantCount ?? participants.length;
  const shownNames = participants.slice(0, 3).map((participant) => participant.name);
  const extraCount = participants.length - shownNames.length;

  return (
    <article
      className="lift-card"
      style={{
        background: colors.surfaceContainerLowest,
        border: isLatest ? `2px solid ${colors.primary}` : `1px solid ${colors.outlineVariant}`,
        borderRadius: radius.md,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {isLatest && (
        <Chip tone="primary" style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>Latest</Chip>
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
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${colors.outlineVariant}` }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: colors.primary }}>
            <Icon name="group" size={16} /> {participantCount} joined
          </span>
          {shownNames.length > 0 && (
            <p style={{ marginTop: 6, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 1.5 }}>
              {shownNames.join(', ')}{extraCount > 0 ? ` and ${extraCount} more` : ''}
            </p>
          )}
        </div>
      </div>
    </article>
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
        .dashboard-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 36px;
        }
        .simple-note-list {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }
        @media (max-width: 1024px) {
          .dashboard-hero { grid-template-columns: 1fr; }
        }
      `}</style>

      <CommunitySidebar active="dashboard" open={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} isMd={isMd} />

      <main style={{ marginLeft: isMd ? 280 : 0, minHeight: '100vh', background: colors.surface, display: 'flex', flexDirection: 'column' }}>
        <CommunityHeader title="Dashboard" subtitle="Overview and recent activity" isMd={isMd} onMenuClick={() => setSidebarOpen(true)} />

        <div className="content-wrapper" style={{ padding: 36, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <div className="dashboard-hero">
            <section className="soft-card" style={{ padding: 30 }}>
              <p className="eyebrow">Overview</p>
              <h3 className="page-title">Welcome back{user?.name ? `, ${user.name}` : ''}</h3>
              <p className="page-subtitle">Check your numbers and manage events or messages from here.</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 26 }}>
                <Link to="/community-admin/events" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 999, background: colors.primary, color: colors.onPrimary, fontWeight: 700 }}>
                  <Icon name="add_circle" size={18} /> New event
                </Link>
                <Link to="/community-admin/messages" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 999, background: colors.accentSoft, color: colors.primaryDeep, border: `1px solid ${colors.accentBorder}`, fontWeight: 700 }}>
                  <Icon name="forum" size={18} /> Review messages
                </Link>
              </div>
            </section>
            <section className="soft-card" style={{ padding: 30 }}>
              <p className="eyebrow">Note</p>
              <h4 style={{ fontSize: 22, lineHeight: 1.3, color: colors.primaryDeep, fontFamily: "'Playfair Display', serif" }}>Keep it clear</h4>
              <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7, color: colors.onSurfaceVariant }}>
                {events.length === 0
                  ? 'Start by adding one event so members can see fresh activity on the community page.'
                  : 'Update event details and check recent messages when needed.'}
              </p>
              <div className="simple-note-list">
                <div style={{ padding: '14px 16px', borderRadius: 14, background: colors.accentSoft, border: `1px solid ${colors.accentBorder}`, color: colors.onSurfaceVariant, fontSize: 14 }}>
                  <strong style={{ color: colors.primary }}>Published events:</strong> {events.length}
                </div>
                <div style={{ padding: '14px 16px', borderRadius: 14, background: colors.accentSoft, border: `1px solid ${colors.accentBorder}`, color: colors.onSurfaceVariant, fontSize: 14 }}>
                  <strong style={{ color: colors.primary }}>Messages total:</strong> {stats.totalMessages}
                </div>
                <div style={{ padding: '14px 16px', borderRadius: 14, background: colors.accentSoft, border: `1px solid ${colors.accentBorder}`, color: colors.onSurfaceVariant, fontSize: 14 }}>
                  <strong style={{ color: colors.primary }}>Tip:</strong> Use short titles and simple venue names.
                </div>
              </div>
            </section>
          </div>

          {error && <div style={{ marginBottom: 20, padding: 16, borderRadius: 8, background: colors.errorContainer, color: colors.onErrorContainer }}>{error}</div>}

          <div className="metric-grid" style={{ marginBottom: 48 }}>
            {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </div>

          <div className="section-heading" style={{ marginBottom: 20 }}>
            <div>
              <p className="eyebrow">Publishing feed</p>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: colors.onSurface, fontFamily: "'Playfair Display', serif" }}>Latest events</h3>
            </div>
            <Link to="/community-admin/events" style={{ color: colors.primary, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 999, background: colors.accentSoft, border: `1px solid ${colors.accentBorder}` }}>
              Manage events <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          {loading && (
            <div className="event-grid" aria-hidden="true">
              {[0, 1, 2].map((n) => <SkeletonCard key={n} media />)}
            </div>
          )}

          {!loading && latestEvents.length === 0 && (
            <EmptyState
              icon="event_busy"
              title="No events published yet"
              message="Publish your first event and it will show up here and on the community page."
              action={<Button as={Link} to="/community-admin/events" icon="add_circle">Create an event</Button>}
            />
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
