import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityAPI } from '../../services/api';
import { colors } from '../../components/communityTokens';
import { Icon, Button, Alert, SkeletonCard, EmptyState, CommunityAdminFonts, CommunitySidebar, CommunityHeader, useIsMdScreen } from '../../components/CommunityAdminUI';

// Shared field styling so every input in the event form matches
const fieldLabel = { display: 'block', fontSize: 13.5, fontWeight: 600, marginBottom: 7, color: colors.onSurface };
const requiredMark = { color: colors.error, marginLeft: 2 };
const fieldHint = { marginTop: 6, fontSize: 12, lineHeight: 1.5, color: colors.inkSoft };

const localDateTime = (value) => { if (!value) return ''; const date = new Date(value); const offset = date.getTimezoneOffset() * 60000; return new Date(date - offset).toISOString().slice(0, 16); };
const eventLabel = (event) => new Date(event.eventDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function EventForm({ event, onClose, onSave }) {
  const [form, setForm] = useState({ title: event?.title || '', description: event?.description || '', eventDate: localDateTime(event?.eventDate), venue: event?.venue || '', imageUrl: event?.imageUrl || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  // Escape closes the form and the page behind it stops scrolling
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [saving, onClose]);

  const submit = async (submitEvent) => {
    submitEvent.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, eventDate: new Date(form.eventDate).toISOString() });
    } catch (requestError) {
      setError(requestError.message || 'Unable to save the event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div onClick={() => !saving && onClose()} aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(10, 59, 50, 0.55)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-form-title"
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: colors.surfaceContainerLowest, borderRadius: 20, padding: 28, width: '90%', maxWidth: 560, zIndex: 101, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 48px -12px rgba(10, 59, 50, 0.24)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 id="event-form-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: colors.primary }}>{event ? 'Edit event' : 'Add new event'}</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex' }}>
            <Icon name="close" size={24} style={{ color: colors.onSurfaceVariant }} />
          </button>
        </div>
        {error && <Alert>{error}</Alert>}
        {form.imageUrl && (
          <img src={form.imageUrl} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
        )}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="event-title" style={fieldLabel}>Event title <span style={requiredMark} aria-hidden="true">*</span></label>
          <input id="event-title" className="event-field" type="text" required autoFocus value={form.title} onChange={(input) => update('title', input.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="event-description" style={fieldLabel}>Description <span style={requiredMark} aria-hidden="true">*</span></label>
          <textarea id="event-description" className="event-field" required value={form.description} onChange={(input) => update('description', input.target.value)} style={{ minHeight: 104, resize: 'vertical' }} />
          <p style={fieldHint}>Shown on the community page under the event title.</p>
        </div>
        <div className="event-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label htmlFor="event-date" style={fieldLabel}>Date &amp; time <span style={requiredMark} aria-hidden="true">*</span></label>
            <input id="event-date" className="event-field" type="datetime-local" required value={form.eventDate} onChange={(input) => update('eventDate', input.target.value)} />
          </div>
          <div>
            <label htmlFor="event-venue" style={fieldLabel}>Venue</label>
            <input id="event-venue" className="event-field" type="text" value={form.venue} onChange={(input) => update('venue', input.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label htmlFor="event-image" style={fieldLabel}>Image URL</label>
          <input id="event-image" className="event-field" type="url" value={form.imageUrl} onChange={(input) => update('imageUrl', input.target.value)} placeholder="https://example.com/image.jpg" />
          <p style={fieldHint}>Leave empty to use the default event picture.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button type="button" variant="quiet" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" loading={saving}>{saving ? 'Saving...' : event ? 'Update event' : 'Create event'}</Button>
        </div>
      </form>
    </>
  );
}

function EventCard({ event, onEdit, onDelete, deleting }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isUpcoming = new Date(event.eventDate) >= new Date();

  return (
    <article className="lift-card event-card" onMouseLeave={() => setMenuOpen(false)} style={{ background: colors.surfaceContainerLowest, border: `1px solid ${colors.outlineVariant}`, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
      {/* Kept mounted rather than hover-only: a hover gate made Edit and
          Delete unreachable for keyboard and touch users entirely. */}
      <div className="event-card-actions" style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
        <div>
          <button onClick={() => setMenuOpen(!menuOpen)} aria-haspopup="menu" aria-expanded={menuOpen} aria-label={`Actions for ${event.title}`} style={{ background: 'rgba(10, 59, 50, 0.72)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)' }}>
            <Icon name="more_vert" size={20} />
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', top: 40, right: 0, background: colors.surfaceContainerLowest, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 20, border: `1px solid ${colors.outlineVariant}` }}>
              <button onClick={() => { onEdit(event); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: colors.onSurface, fontSize: 14 }}>
                <Icon name="edit" size={18} /> Edit
              </button>
              <button onClick={() => { onDelete(event); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: colors.error, fontSize: 14 }}>
                <Icon name="delete" size={18} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <img src={event.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=200&fit=crop'} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', transform: imgHovered ? 'scale(1.05)' : 'scale(1)' }} />
        <span style={{ position: 'absolute', top: 16, left: 16, padding: '4px 12px', borderRadius: 40, fontSize: 12, fontWeight: 500, backdropFilter: 'blur(4px)', background: isUpcoming ? 'rgba(0,109,91,0.88)' : colors.outlineVariant, color: isUpcoming ? '#fff' : colors.onSurface }}>{isUpcoming ? 'Upcoming' : 'Past'}</span>
      </div>
      <div style={{ padding: 20 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: colors.onSurface, marginBottom: 12 }}>{event.title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: colors.onSurfaceVariant }}>
            <Icon name="calendar_today" size={18} />
            <span style={{ fontSize: 14 }}>{eventLabel(event)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: colors.onSurfaceVariant }}>
            <Icon name="location_on" size={18} />
            <span style={{ fontSize: 14 }}>{event.venue || 'Venue to be announced'}</span>
          </div>
        </div>
      </div>
      {deleting && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'grid', placeItems: 'center', fontWeight: 600, color: colors.error }}>Deleting...</div>}
    </article>
  );
}

function Toast({ notice }) {
  if (!notice) return null;
  const isError = notice.type === 'error';
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 200, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 10, background: isError ? colors.errorContainer : colors.primary, color: isError ? colors.onErrorContainer : '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', fontSize: 14, fontWeight: 500, maxWidth: 360 }}>
      <Icon name={isError ? 'error' : 'check_circle'} size={20} />
      <span>{notice.message}</span>
    </div>
  );
}

export default function EventManagement() {
  const navigate = useNavigate();
  const isMd = useIsMdScreen();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('soonest');
  const [notice, setNotice] = useState(null);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    window.clearTimeout(showNotice._t);
    showNotice._t = window.setTimeout(() => setNotice(null), 3500);
  };

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await communityAPI.getEvents();
      setEvents(data);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const handleAddEvent = () => { setEditingEvent(null); setModalOpen(true); };
  const handleEditEvent = (event) => { setEditingEvent(event); setModalOpen(true); };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    setDeletingId(event.id);
    setError('');
    try {
      await communityAPI.deleteEvent(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
      showNotice('success', `"${event.title}" was deleted.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the event.');
      showNotice('error', requestError.message || 'Unable to delete the event.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveEvent = async (data) => {
    const saved = editingEvent ? await communityAPI.updateEvent(editingEvent.id, data) : await communityAPI.createEvent(data);
    setEvents((current) => {
      const next = editingEvent ? current.map((event) => (event.id === saved.id ? saved : event)) : [saved, ...current];
      return next;
    });
    setModalOpen(false);
    showNotice('success', editingEvent ? `"${saved.title}" was updated.` : `"${saved.title}" was published.`);
    setEditingEvent(null);
  };

  const term = search.trim().toLowerCase();
  const filteredEvents = events.filter((event) => {
    if (!term) return true;
    return event.title.toLowerCase().includes(term) || (event.venue || '').toLowerCase().includes(term) || event.description.toLowerCase().includes(term);
  });
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const diff = new Date(a.eventDate) - new Date(b.eventDate);
    return sortOrder === 'soonest' ? diff : -diff;
  });
  const now = new Date();
  const upcomingCount = events.filter((event) => new Date(event.eventDate) >= now).length;
  const pastCount = events.length - upcomingCount;
  const nextEvent = sortedEvents.find((event) => new Date(event.eventDate) >= now);

  return (
    <>
      <CommunityAdminFonts />
      <style>{`
        .event-grid { display: grid; grid-template-columns: 1fr; gap: 24px; padding-bottom: 20px; }
        @media (min-width: 768px) { .event-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .event-grid { grid-template-columns: repeat(3, 1fr); } }
        .event-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .event-stat-card { background: ${colors.surfaceContainerLowest}; border: 1px solid ${colors.outlineVariant}; border-radius: 12px; padding: 16px 20px; }
        .event-toolbar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 24px; }
        .event-search { flex: 1; min-width: 220px; padding: 10px 14px 10px 40px; border-radius: 40px; border: 1px solid ${colors.outlineVariant}; font-size: 14px; background-position: 12px center; background-repeat: no-repeat; }
        .event-hero { display: grid; grid-template-columns: 1.2fr .8fr; gap: 20px; margin-bottom: 28px; }
        @media (max-width: 1024px) { .event-hero { grid-template-columns: 1fr; } }

        /* Actions stay in the DOM and in the tab order; they only fade
           visually, and come fully forward on hover or keyboard focus. */
        .event-card-actions { opacity: 0.35; transition: opacity 180ms ease; }
        .event-card:hover .event-card-actions,
        .event-card:focus-within .event-card-actions { opacity: 1; }
        @media (hover: none) { .event-card-actions { opacity: 1; } }

        .event-card img { transition: transform 500ms ease; }
        .event-card:hover img { transform: scale(1.05); }

        /* One field style for the whole event form */
        .event-field {
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1px solid ${colors.outlineVariant};
          background: ${colors.surfaceContainerLowest};
          color: ${colors.onSurface};
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          transition: border-color 140ms ease, box-shadow 140ms ease;
        }
        .event-field::placeholder { color: ${colors.inkSoft}; opacity: 0.75; }
        .event-field:hover { border-color: ${colors.primaryContainer}; }
        .event-field:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${colors.primaryFixed};
        }
        /* Only flag a required field once the browser has judged it */
        .event-field:user-invalid {
          border-color: ${colors.error};
          box-shadow: 0 0 0 3px ${colors.errorContainer};
        }
        /* The stacked date/venue row is too tight on small screens */
        @media (max-width: 520px) {
          .event-form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <CommunitySidebar active="events" open={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} isMd={isMd} />

      <main style={{ marginLeft: isMd ? 280 : 0, minHeight: '100vh', background: colors.surface, display: 'flex', flexDirection: 'column' }}>
        <CommunityHeader title="Events" subtitle="Simple event management" isMd={isMd} onMenuClick={() => setSidebarOpen(true)} />

        <div className="content-wrapper" style={{ padding: 36, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <div className="event-hero">
            <section className="soft-card" style={{ padding: 30 }}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Event management</p>
                  <h3 className="page-title">All events</h3>
                  <p className="page-subtitle">Create, edit, and manage your community events.</p>
                </div>
                <button onClick={handleAddEvent} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: colors.primary, color: 'white', border: 'none', borderRadius: 40, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  <Icon name="add" size={20} /> Add Event
                </button>
              </div>
            </section>
            <section className="soft-card" style={{ padding: 30 }}>
              <p className="eyebrow">Next event</p>
              {nextEvent ? (
                <>
                  <h4 style={{ fontSize: 22, lineHeight: 1.3, fontFamily: "'Playfair Display', serif", marginBottom: 10, color: colors.primaryDeep }}>{nextEvent.title}</h4>
                  <p style={{ color: colors.onSurfaceVariant, fontSize: 14, lineHeight: 1.8 }}>{new Date(nextEvent.eventDate).toLocaleString()} {nextEvent.venue ? `• ${nextEvent.venue}` : ''}</p>
                </>
              ) : (
                <p style={{ color: colors.onSurfaceVariant, fontSize: 14, lineHeight: 1.8 }}>No upcoming event is scheduled yet.</p>
              )}
            </section>
          </div>

          <div className="event-stats">
            <div className="event-stat-card" style={{ background: colors.accentSoft, border: `1px solid ${colors.accentBorder}`, padding: '18px 22px' }}>
              <p style={{ fontSize: 12, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Total events</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: colors.primary, fontFamily: "'Playfair Display', serif" }}>{events.length}</p>
            </div>
            <div className="event-stat-card" style={{ background: colors.accentSoft, border: `1px solid ${colors.accentBorder}`, padding: '18px 22px' }}>
              <p style={{ fontSize: 12, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Upcoming</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: colors.tertiary, fontFamily: "'Playfair Display', serif" }}>{upcomingCount}</p>
            </div>
            <div className="event-stat-card" style={{ background: colors.accentSoft, border: `1px solid ${colors.accentBorder}`, padding: '18px 22px' }}>
              <p style={{ fontSize: 12, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Past</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: colors.onSurfaceVariant, fontFamily: "'Playfair Display', serif" }}>{pastCount}</p>
            </div>
          </div>

          <div className="event-toolbar">
            <input
              className="event-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, venue, or description..."
              style={{ backgroundImage: "none", background: '#fff', boxShadow: '0 10px 24px rgba(10,59,50,0.04)', border: `1px solid ${colors.accentBorder}`, padding: '14px 18px' }}
            />
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} style={{ padding: '12px 16px', borderRadius: 40, border: `1px solid ${colors.accentBorder}`, fontSize: 14, background: colors.accentSoft }}>
              <option value="soonest">Soonest first</option>
              <option value="latest">Latest first</option>
            </select>
          </div>

          {error && <div style={{ marginBottom: 20, padding: 16, borderRadius: 8, background: colors.errorContainer, color: colors.onErrorContainer }}>{error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, background: colors.surfaceContainerLowest, borderRadius: 12, border: `1px solid ${colors.outlineVariant}` }}>
              <p style={{ color: colors.onSurfaceVariant }}>Loading events...</p>
            </div>
          ) : (
            <div className="event-grid">
              {sortedEvents.map((event) => (
                <EventCard key={event.id} event={event} onEdit={handleEditEvent} onDelete={handleDeleteEvent} deleting={deletingId === event.id} />
              ))}
            </div>
          )}

          {!loading && sortedEvents.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, background: colors.surfaceContainerLowest, borderRadius: 12, border: `1px solid ${colors.outlineVariant}` }}>
              <Icon name="event_busy" size={48} style={{ color: colors.onSurfaceVariant, opacity: 0.5 }} />
              <p style={{ marginTop: 16, color: colors.onSurfaceVariant }}>{events.length === 0 ? 'No events found. Click "Add Event" to create one.' : 'No events match your search.'}</p>
            </div>
          )}
        </div>

        <footer style={{ flexShrink: 0, padding: '28px 32px', textAlign: 'center', borderTop: `1px solid ${colors.outlineVariant}`, background: colors.surfaceContainerLowest }}>
          <p style={{ fontSize: 13, color: `${colors.onSurfaceVariant}CC` }}>© 2026 Community Admin Ecosystem — Growing together, sustainably.</p>
        </footer>
      </main>

      {modalOpen && <EventForm event={editingEvent} onClose={() => { setModalOpen(false); setEditingEvent(null); }} onSave={handleSaveEvent} />}
      <Toast notice={notice} />
    </>
  );
}
