import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { communityAPI } from '../../services/api';

const c = { primary: '#176b63', dark: '#0f4e48', soft: '#dcf1ea', softer: '#eef8f4', green: '#2f8f73', greenBorder: '#bfe3d3', yellow: '#fff4cc', yellowBorder: '#edd77d', surface: '#fff', canvas: '#f4f9f6', ink: '#172b29', muted: '#5c6a68', border: '#d6e2df', error: '#b74f47' };
const Icon = ({ name, size = 22 }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>{name}</span>;

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

const localDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 16);
};

// Group chats colour each sender's name so a busy thread stays readable.
// Hues are picked from the page palette rather than at random.
const SENDER_COLOURS = ['#176b63', '#2f8f73', '#9a6420', '#0f4e48', '#7a4a2f', '#3c6e5c'];
const nameColour = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return SENDER_COLOURS[Math.abs(hash) % SENDER_COLOURS.length];
};

// 14:32 — the short stamp shown inside each bubble
const clockTime = (value) => new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

// "Today" / "Yesterday" / a date, used for the separators between days
const dayLabel = (value) => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
};

// Messages within 5 minutes from the same person collapse into one run,
// so only the first keeps its avatar and name.
const CHAT_GROUP_WINDOW_MS = 5 * 60 * 1000;
const startsNewRun = (message, previous) => {
  if (!previous) return true;
  if (previous.user.id !== message.user.id) return true;
  if (new Date(message.createdAt).toDateString() !== new Date(previous.createdAt).toDateString()) return true;
  return new Date(message.createdAt) - new Date(previous.createdAt) > CHAT_GROUP_WINDOW_MS;
};

function formatEvent(event) {
  const date = new Date(event.eventDate);
  return {
    ...event,
    image: event.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&h=500&fit=crop',
    date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    day: date.toLocaleDateString(undefined, { day: 'numeric' }),
    month: date.toLocaleDateString(undefined, { month: 'short' }),
    time: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    participantCount: event.participantCount || 0,
    isParticipating: Boolean(event.isParticipating),
  };
}

// Full add / edit form for community admins, used directly on this page.
function EventForm({ event, onClose, onSave }) {
  const [form, setForm] = useState({ title: event?.title || '', description: event?.description || '', eventDate: localDateTime(event?.eventDate), venue: event?.venue || '', imageUrl: event?.imageUrl || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

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
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label={event ? 'Edit event' : 'Create event'}>
      <div className="modal-backdrop" onClick={onClose} />
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div><p>{event ? 'Update event' : 'New event'}</p><h2>{event ? 'Edit community event' : 'Publish community event'}</h2></div>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}><Icon name="close" /></button>
        </div>
        {error && <p className="form-error">{error}</p>}
        <label>Event title<input required value={form.title} onChange={(input) => update('title', input.target.value)} /></label>
        <label>Description<textarea required value={form.description} onChange={(input) => update('description', input.target.value)} /></label>
        <div className="two-columns">
          <label>Date and time<input type="datetime-local" required value={form.eventDate} onChange={(input) => update('eventDate', input.target.value)} /></label>
          <label>Venue<input value={form.venue} onChange={(input) => update('venue', input.target.value)} placeholder="Optional" /></label>
        </div>
        <label>Image URL<input type="url" value={form.imageUrl} onChange={(input) => update('imageUrl', input.target.value)} placeholder="Optional image URL" /></label>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>Cancel</button>
          <button className="primary" disabled={saving}>{saving ? 'Saving...' : event ? 'Save changes' : 'Publish event'}</button>
        </div>
      </form>
    </div>
  );
}

function Events({ events, loading, error, onOpen, isAdmin, onAdd, onEdit, onDelete, deletingId, onParticipate, participatingId }) {
  return (
    <section>
      <div className="heading">
        <div><p>Community calendar</p><h1>Upcoming events</h1></div>
        <div className="heading-actions">
          <span className="count">{events.length} published</span>
          {isAdmin && <button className="primary-button" onClick={onAdd}><Icon name="add" size={20} />Add event</button>}
        </div>
      </div>
      {loading && (
        <div className="event-grid" aria-hidden="true">
          {[0, 1, 2].map((n) => (
            <div key={n} className="event-card skel-card">
              <div className="skel skel-media" />
              <div className="skel-body">
                <div className="skel" style={{ height: 11, width: '36%' }} />
                <div className="skel" style={{ height: 18, width: '74%' }} />
                <div className="skel" style={{ height: 12 }} />
                <div className="skel" style={{ height: 12, width: '84%' }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && error && <div className="empty error">{error}</div>}
      {!loading && !error && events.length === 0 && <div className="empty"><Icon name="event_busy" size={48} /><h2>No events published</h2><p>{isAdmin ? 'Click "Add event" to publish the first one.' : 'The community administrator has not published an event yet.'}</p></div>}
      <div className="event-grid">
        {events.map((event) => (
          <article className="event-card" key={event.id} onClick={() => onOpen(event)}>
            <div className="event-card-media">
              <img src={event.image} alt="" />
              <span className="date-chip"><strong>{event.day}</strong>{event.month}</span>
              {isAdmin && (
                <div className="card-admin-actions" onClick={(clickEvent) => clickEvent.stopPropagation()}>
                  <button aria-label="Edit event" title="Edit event" onClick={() => onEdit(event)}><Icon name="edit" size={18} /></button>
                  <button aria-label="Delete event" title="Delete event" className="danger" disabled={deletingId === event.id} onClick={() => onDelete(event)}><Icon name="delete" size={18} /></button>
                </div>
              )}
            </div>
            <div>
              <div className="card-top-row">
                <span className="label">Community event</span>
                <span className="participant-chip"><Icon name="group" size={15} />{event.participantCount}</span>
              </div>
              <h2>{event.title}</h2>
              <p className="description">{event.description}</p>
              <div className="meta">
                <span><Icon name="schedule" size={18} />{event.time}</span>
                <span><Icon name="location_on" size={18} />{event.venue || 'Venue to be announced'}</span>
              </div>
              <div className="card-actions" onClick={(clickEvent) => clickEvent.stopPropagation()}>
                <button className="text-button" onClick={() => onOpen(event)}>View event <Icon name="arrow_forward" size={18} /></button>
                {!isAdmin && (
                  <button
                    className={`join-button ${event.isParticipating ? 'joined' : ''}`}
                    disabled={participatingId === event.id}
                    onClick={() => onParticipate(event)}
                  >
                    <Icon name={event.isParticipating ? 'check_circle' : 'add_circle'} size={17} />
                    {event.isParticipating ? 'Going' : 'Join event'}
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Details({ event, onBack, isAdmin, onEdit, onDelete, deleting, onParticipate, participating }) {
  return (
    <section className="details">
      <div className="details-topbar">
        <button className="back" onClick={onBack}><Icon name="arrow_back" size={20} />All events</button>
        {isAdmin && (
          <div className="details-admin-actions">
            <button className="secondary" onClick={() => onEdit(event)}><Icon name="edit" size={18} />Edit</button>
            <button className="secondary danger-text" disabled={deleting} onClick={() => onDelete(event)}><Icon name="delete" size={18} />{deleting ? 'Deleting...' : 'Delete'}</button>
          </div>
        )}
      </div>
      <img className="hero" src={event.image} alt="" />
      <div className="detail-body">
        <div className="card-top-row">
          <span className="label">Community event</span>
          <span className="participant-chip"><Icon name="group" size={15} />{event.participantCount} joined</span>
        </div>
        <h1>{event.title}</h1>
        <p className="detail-description">{event.description}</p>
        <div className="detail-meta">
          <div><Icon name="calendar_today" /><span>Date<strong>{event.date}</strong></span></div>
          <div><Icon name="schedule" /><span>Time<strong>{event.time}</strong></span></div>
          <div><Icon name="location_on" /><span>Location<strong>{event.venue || 'Venue to be announced'}</strong></span></div>
        </div>
        {!isAdmin && (
          <button className={`join-button large ${event.isParticipating ? 'joined' : ''}`} disabled={participating} onClick={() => onParticipate(event)}>
            <Icon name={event.isParticipating ? 'check_circle' : 'add_circle'} size={19} />
            {event.isParticipating ? 'You are going' : 'Join this event'}
          </button>
        )}
      </div>
    </section>
  );
}

function MessageItem({ message, isOwn, showMeta, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(message.content);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const startEdit = () => { setValue(message.content); setEditing(true); };
  const cancelEdit = () => { setValue(message.content); setEditing(false); };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!value.trim() || saving) return;
    setSaving(true);
    try { await onUpdate(message.id, value); setEditing(false); } finally { setSaving(false); }
  };

  const remove = async () => {
    setRemoving(true);
    try { await onDelete(message); } finally { setRemoving(false); }
  };

  return (
    <article className={`message ${isOwn ? 'own' : ''} ${showMeta ? '' : 'grouped'}`}>
      {/* Round letter avatar for the sender. Within a run of messages only
          the first one carries it, so the thread does not repeat itself. */}
      {showMeta
        ? <div className="avatar" title={message.user.name} style={{ background: nameColour(message.user.name) }}>{message.user.name.charAt(0).toUpperCase()}</div>
        : <div className="avatar-spacer" aria-hidden="true" />}
      <div className="bubble">
        {/* Sender name is group-chat information — no point telling you your own */}
        {showMeta && !isOwn && <p className="sender" style={{ color: nameColour(message.user.name) }}>{message.user.name}</p>}
        {editing ? (
          <form className="edit-form" onSubmit={saveEdit}>
            <textarea autoFocus value={value} onChange={(event) => setValue(event.target.value)} maxLength={1000} aria-label="Edit your message" />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={cancelEdit}>Cancel</button>
              <button className="save-button" disabled={!value.trim() || saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        ) : (
          <>
            <p className="bubble-text">{message.content}</p>
            <time className="stamp" dateTime={message.createdAt} title={new Date(message.createdAt).toLocaleString()}>
              {clockTime(message.createdAt)}
            </time>
            {isOwn && (
              <div className="bubble-actions">
                <button type="button" aria-label="Edit message" title="Edit" onClick={startEdit}><Icon name="edit" size={15} /></button>
                <button type="button" className="danger" aria-label="Delete message" title="Delete" onClick={remove} disabled={removing}><Icon name={removing ? 'hourglass_top' : 'delete'} size={15} /></button>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function Conversation({ messages, loading, error, onSend, onUpdate, onDelete, onRefresh, currentUserId }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const endRef = useRef(null);

  // A chat reads newest-last, so open at the bottom and follow new messages —
  // but only when the reader is already near the bottom, so scrolling back
  // through history is not yanked away when someone else posts.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
    if (distanceFromBottom < 160) endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      await onSend(content);
      setContent('');
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } finally { setSending(false); }
  };

  // Enter sends, Shift+Enter makes a new line — the usual chat behaviour
  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit(event);
    }
  };

  const participants = new Set(messages.map((message) => message.user.id)).size;

  return (
    <section className="conversation">
      <div className="chat-header">
        <div className="chat-avatar" aria-hidden="true"><Icon name="groups" /></div>
        <div className="chat-title">
          <h1>Community conversation</h1>
          <span>
            {loading
              ? 'Loading messages…'
              : `${messages.length} ${messages.length === 1 ? 'message' : 'messages'}${participants ? ` · ${participants} ${participants === 1 ? 'member' : 'members'}` : ''}`}
          </span>
        </div>
        <button className="chat-action" title="Refresh messages" aria-label="Refresh messages" onClick={onRefresh}><Icon name="refresh" size={20} /></button>
      </div>

      <div className="message-list" ref={listRef}>
        {loading && (
          <div aria-hidden="true" className="skel-chat">
            {[70, 46, 60].map((width, n) => (
              <div key={n} className={`skel skel-bubble ${n === 1 ? 'own' : ''}`} style={{ width: `${width}%` }} />
            ))}
          </div>
        )}
        {!loading && error && <p className="center error">{error}</p>}
        {!loading && !error && messages.length === 0 && (
          <div className="center">
            <Icon name="chat_bubble_outline" size={48} />
            <p>No messages yet. Say hello to the community.</p>
          </div>
        )}
        {!loading && messages.map((message, index) => {
          const previous = messages[index - 1];
          const newDay = !previous || new Date(message.createdAt).toDateString() !== new Date(previous.createdAt).toDateString();
          return (
            <div key={message.id}>
              {newDay && <div className="day-divider"><span>{dayLabel(message.createdAt)}</span></div>}
              <MessageItem
                message={message}
                isOwn={message.user.id === currentUserId}
                showMeta={startsNewRun(message, newDay ? null : previous)}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form className="composer" onSubmit={submit}>
        <textarea
          aria-label="Community message"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={onKeyDown}
          maxLength={1000}
          rows={1}
          placeholder="Type a message"
        />
        <button className="send" disabled={!content.trim() || sending} title="Send message" aria-label="Send message">
          <Icon name={sending ? 'hourglass_top' : 'send'} size={21} />
        </button>
      </form>
    </section>
  );
}

export default function CommunityHome() {
  const user = currentUser();
  const isAdmin = user?.role === 'COMMUNITY_ADMIN';

  const [tab, setTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [eventError, setEventError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [participatingId, setParticipatingId] = useState(null);
  const nextEvent = events.find((event) => new Date(event.eventDate) >= new Date()) || events[0];

  const loadEvents = async () => {
    setLoadingEvents(true);
    setEventError('');
    try {
      setEvents((await communityAPI.getEvents()).map(formatEvent));
    } catch (error) {
      setEventError(error.message || 'Unable to load events.');
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadMessages = async () => {
    setLoadingMessages(true);
    setMessageError('');
    try {
      setMessages(await communityAPI.getMessages());
    } catch (error) {
      setMessageError(error.message || 'Unable to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);
  useEffect(() => {
    if (tab !== 'messages') return undefined;
    loadMessages();
    const interval = window.setInterval(loadMessages, 15000);
    return () => window.clearInterval(interval);
  }, [tab]);

  const sendMessage = async (content) => {
    try {
      const message = await communityAPI.sendMessage(content);
      setMessages((current) => [...current, message]);
    } catch (error) {
      setMessageError(error.message || 'Unable to send your message.');
      throw error;
    }
  };

  const updateMessage = async (id, content) => {
    try {
      const updatedMessage = await communityAPI.updateMessage(id, content);
      setMessages((current) => current.map((message) => (message.id === id ? updatedMessage : message)));
    } catch (error) {
      setMessageError(error.message || 'Unable to update your message.');
      throw error;
    }
  };

  const deleteMessage = async (message) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    try {
      await communityAPI.deleteMessage(message.id);
      setMessages((current) => current.filter((item) => item.id !== message.id));
    } catch (error) {
      setMessageError(error.message || 'Unable to delete your message.');
      throw error;
    }
  };

  const switchTab = (next) => { setTab(next); setSelected(null); };

  const toggleParticipation = async (event) => {
    setParticipatingId(event.id);
    setEventError('');
    try {
      const result = await communityAPI.participateInEvent(event.id);
      const apply = (item) => (item.id === event.id ? { ...item, isParticipating: result.isParticipating, participantCount: result.participantCount } : item);
      setEvents((current) => current.map(apply));
      setSelected((current) => (current ? apply(current) : current));
    } catch (error) {
      setEventError(error.message || 'Unable to update your participation.');
    } finally {
      setParticipatingId(null);
    }
  };

  const openAdd = () => { setEditingEvent(null); setFormOpen(true); };
  const openEdit = (event) => { setEditingEvent(event); setFormOpen(true); };

  const saveEvent = async (data) => {
    const saved = editingEvent ? await communityAPI.updateEvent(editingEvent.id, data) : await communityAPI.createEvent(data);
    const formatted = formatEvent(saved);
    setEvents((current) => {
      const next = editingEvent ? current.map((event) => (event.id === formatted.id ? formatted : event)) : [...current, formatted];
      return next;
    });
    if (selected?.id === formatted.id) setSelected(formatted);
    setFormOpen(false);
    setEditingEvent(null);
  };

  const deleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    setDeletingId(event.id);
    setEventError('');
    try {
      await communityAPI.deleteEvent(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
      if (selected?.id === event.id) setSelected(null);
    } catch (error) {
      setEventError(error.message || 'Unable to delete the event.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`community-page ${tab === 'messages' ? 'chat-view' : ''}`}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Playfair+Display:wght@700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0,0&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box}
        /* Nothing on this page showed keyboard focus */
        :focus{outline:none}
        :focus-visible{outline:3px solid ${c.primary};outline-offset:2px;border-radius:8px}
        @media (prefers-reduced-motion: reduce){
          *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important}
        }
        .community-page{min-height:100vh;background:radial-gradient(circle at top right, rgba(255,244,204,.85), transparent 24%), radial-gradient(circle at top left, rgba(191,227,211,.65), transparent 32%), ${c.canvas};color:${c.ink};font-family:'DM Sans',sans-serif}
        button{font:inherit}
        h1,h2{font-family:'Libre Baskerville',serif;letter-spacing:0}
        .nav{position:sticky;top:0;z-index:10;background:rgba(255,255,255,.92);border-bottom:1px solid ${c.greenBorder};backdrop-filter:blur(12px)}
        .nav-inner{max-width:1200px;margin:auto;min-height:72px;padding:0 24px;display:flex;align-items:center;gap:24px;justify-content:space-between}
        .brand{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;transition:opacity .2s,transform .2s}
        .brand:hover{opacity:.85;transform:translateY(-1px)}
        .brand-mark{width:38px;height:38px;flex:0 0 auto;border-radius:10px;background:linear-gradient(135deg,${c.primary},${c.dark});color:#fff;display:grid;place-items:center;font-size:16px;box-shadow:0 4px 12px rgba(23,107,99,.25)}
        .brand-text{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:${c.primary};letter-spacing:-.3px}
        .tabs{display:flex;align-self:stretch;gap:4px}
        .tab{border:0;border-bottom:3px solid transparent;background:transparent;color:${c.muted};padding:0 18px;cursor:pointer;display:flex;gap:8px;align-items:center;font-weight:600}
        .tab.active{color:${c.primary};border-bottom-color:${c.primary}}
        /* Icon-only round back button */
        .exit{color:${c.primary};background:#fff;border:1px solid ${c.greenBorder};text-decoration:none;width:40px;height:40px;flex:0 0 auto;border-radius:50%;display:grid;place-items:center;transition:background .18s,border-color .18s,transform .18s}
        .exit:hover{background:${c.soft};border-color:${c.primary};transform:translateX(-2px)}
        .content{max-width:1200px;margin:auto;padding:56px 24px 84px}
        .hero-panel{display:grid;grid-template-columns:1.15fr .85fr;gap:20px;margin-bottom:30px}
        .hero-card,.spotlight-card{background:rgba(255,255,255,.94);border:1px solid ${c.greenBorder};border-radius:16px;box-shadow:0 12px 28px rgba(23,107,99,.06)}
        .hero-card{padding:32px;background:linear-gradient(165deg,#fff,${c.softer})}
        .spotlight-card{padding:32px;background:${c.yellow};color:${c.ink};border-color:${c.yellowBorder}}
        .hero-card p.hero-kicker,.spotlight-card p.hero-kicker{margin:0 0 8px;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:700;color:#9a6420}
        .spotlight-card p.hero-kicker{color:#9a6420}
        .hero-title{font-size:clamp(28px,4vw,40px);line-height:1.12;margin:0;color:${c.dark}}
        .hero-copy{margin-top:16px;color:${c.muted};font-size:14px;line-height:1.9;max-width:620px}
        .hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:24px}
        .hero-chip{padding:12px 18px;border-radius:999px;background:${c.yellow};border:1px solid ${c.yellowBorder};font-weight:700;color:${c.primary}}
        .heading{display:flex;justify-content:space-between;align-items:end;margin-bottom:28px;gap:16px;flex-wrap:wrap}
        .heading-actions{display:flex;align-items:center;gap:12px}
        .heading p,.conversation-header p{margin:0 0 6px;color:#9a6420;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:700}
        .heading h1,.conversation-header h1{margin:0;font-size:30px}
        .count{border:1px solid ${c.greenBorder};background:${c.softer};color:${c.primary};border-radius:99px;padding:10px 15px;font-size:14px;white-space:nowrap;font-weight:700}
        .primary-button{display:flex;align-items:center;gap:8px;border:0;border-radius:999px;background:${c.primary};color:#fff;padding:12px 18px;font-weight:700;cursor:pointer}
        .event-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px}
        .event-card{background:#fff;border:1px solid ${c.greenBorder};border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;position:relative;display:flex;flex-direction:column}
        .event-card:hover{transform:translateY(-4px);box-shadow:0 16px 30px rgba(23,107,99,.14)}
        .event-card-media{position:relative}
        .event-card img{width:100%;height:190px;object-fit:cover;display:block}
        .event-card-media::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,78,72,0) 55%,rgba(15,78,72,.45) 100%)}
        .event-card>div:last-child{padding:20px;display:flex;flex-direction:column;flex:1}
        .date-chip{position:absolute;top:12px;left:12px;z-index:2;background:#fff;border-radius:10px;padding:6px 10px;text-align:center;line-height:1.1;color:${c.dark};box-shadow:0 6px 14px rgba(15,78,72,.18)}
        .date-chip strong{display:block;font-size:16px}
        .date-chip{font-size:11px;text-transform:uppercase;font-weight:700}
        .card-admin-actions{position:absolute;top:12px;right:12px;display:flex;gap:6px;z-index:2}
        .card-admin-actions button{width:34px;height:34px;border:0;border-radius:6px;background:rgba(255,255,255,0.92);color:${c.primary};display:grid;place-items:center;cursor:pointer}
        .card-admin-actions button.danger{color:${c.error}}
        .card-admin-actions button:disabled{opacity:.5;cursor:not-allowed}
        .card-top-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .label{display:inline-block;background:${c.yellow};color:${c.dark};border-radius:99px;padding:6px 10px;font-size:12px;font-weight:700}
        .participant-chip{display:inline-flex;align-items:center;gap:5px;background:${c.softer};color:${c.green};border:1px solid ${c.greenBorder};border-radius:99px;padding:5px 10px;font-size:12px;font-weight:700}
        .event-card h2{margin:14px 0 8px;font-size:21px;line-height:1.35}
        .description{color:${c.muted};line-height:1.5;margin:0 0 18px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .meta{display:grid;gap:8px;color:${c.muted};font-size:13px}
        .meta span{display:flex;align-items:center;gap:8px}
        .card-actions{margin-top:auto;padding-top:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .text-button,.back{color:${c.primary};border:0;background:transparent;padding:0;display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:700;margin-top:18px}
        .card-actions .text-button{margin-top:0}
        .join-button{display:inline-flex;align-items:center;gap:6px;border:1px solid ${c.primary};background:#fff;color:${c.primary};border-radius:999px;padding:8px 14px;font-weight:700;font-size:13px;cursor:pointer;transition:background .2s,color .2s}
        .join-button:hover{background:${c.softer}}
        .join-button.joined{background:${c.green};border-color:${c.green};color:#fff}
        .join-button:disabled{opacity:.6;cursor:not-allowed}
        .join-button.large{margin-top:26px;padding:13px 22px;font-size:14px}
        .skel{background:linear-gradient(100deg, ${c.soft} 28%, #fff 48%, ${c.soft} 68%);background-size:220% 100%;animation:chShimmer 1.3s ease-in-out infinite;border-radius:8px}
        @keyframes chShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .skel-card{cursor:default}
        .skel-media{height:170px;border-radius:0}
        .skel-body{padding:18px;display:grid;gap:10px}
        @media (prefers-reduced-motion: reduce){ .skel{animation:none;background:${c.soft}} }
        .empty{border:1px dashed ${c.greenBorder};background:#fff;padding:68px 28px;text-align:center;color:${c.muted};border-radius:12px;grid-column:1/-1}
        .empty h2{color:${c.ink};font-size:20px;margin:12px 0 6px}
        .error{color:${c.error}}
        .details,.conversation{max-width:900px;margin:auto;background:#fff;border:1px solid ${c.greenBorder};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(23,43,41,.07)}
        .conversation{display:flex;flex-direction:column;max-width:960px}
        /* When the thread owns the page, the page itself becomes the flex
           column and the chat takes whatever height is left. No magic numbers,
           so it cannot drift out of step with the nav or the padding. */
        .community-page.chat-view{height:100vh;display:flex;flex-direction:column;overflow:hidden}
        /* width:100% because .content uses margin:auto, and an auto margin on
           a flex item stops it stretching - it collapses to its content width. */
        .community-page.chat-view .content{flex:1;min-height:0;width:100%;display:flex;padding-top:24px;padding-bottom:24px}
        /* The tab panel sits between .content and the chat, so it has to pass
           the available height through rather than wrapping it in an auto box. */
        .community-page.chat-view .tab-panel{flex:1;min-height:0;display:flex}
        /* height:100% makes the height definite. Relying on flex stretch alone
           left it sizing to its own content, so the list had nothing to
           shrink against and the thread never scrolled. */
        .community-page.chat-view .conversation{flex:1;min-height:0;height:100%;max-width:none}
        /* The resting min-height would stop the list shrinking, which is what
           makes it scroll internally instead of stretching the whole page. */
        .community-page.chat-view .message-list{min-height:0}
        .details-topbar{display:flex;justify-content:space-between;align-items:center;margin:20px 24px;flex-wrap:wrap;gap:12px}
        .details-admin-actions{display:flex;gap:10px}
        .details-admin-actions .secondary{display:flex;align-items:center;gap:6px;border:1px solid ${c.border};background:#fff;border-radius:6px;padding:8px 14px;cursor:pointer;font-weight:700;color:${c.ink}}
        .details-admin-actions .danger-text{color:${c.error}}
        .hero{width:100%;height:340px;object-fit:cover;display:block}
        .detail-body{padding:32px}
        .detail-body h1{font-size:34px;margin:16px 0}
        .detail-description{color:${c.muted};font-size:17px;line-height:1.65;margin:0 0 30px}
        .detail-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .detail-meta>div{padding:18px;background:${c.yellow};border-radius:10px;display:flex;gap:11px;color:${c.primary}}
        .detail-meta span{color:${c.muted};font-size:12px;display:grid;gap:4px}
        .detail-meta strong{color:${c.ink};font-size:14px}
        /* ---------- Group chat ---------- */
        .chat-header{padding:14px 20px;border-bottom:1px solid ${c.border};display:flex;align-items:center;gap:13px;background:${c.primary}}
        .chat-avatar{width:44px;height:44px;flex:0 0 auto;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;display:grid;place-items:center}
        .chat-title{flex:1;min-width:0}
        .chat-title h1{margin:0;font-size:18px;color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .chat-title span{display:block;margin-top:2px;font-size:12.5px;color:rgba(255,255,255,.78)}
        .chat-action{border:0;background:transparent;color:#fff;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;cursor:pointer;transition:background .18s}
        .chat-action:hover{background:rgba(255,255,255,.16)}

        /* Chat surface — a soft tint of the page palette, not a photo */
        .message-list{flex:1;min-height:320px;overflow-y:auto;overflow-x:hidden;padding:20px 22px 8px;background:
          radial-gradient(circle at 18% 12%, rgba(220,241,234,.55), transparent 26%),
          radial-gradient(circle at 82% 78%, rgba(255,244,204,.5), transparent 24%),
          ${c.softer};scroll-behavior:smooth}

        .day-divider{display:flex;justify-content:center;margin:14px 0 18px}
        .day-divider span{background:rgba(255,255,255,.92);border:1px solid ${c.greenBorder};color:${c.muted};font-size:11.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:5px 14px;border-radius:999px}

        .message{display:flex;gap:9px;margin-bottom:10px;max-width:78%;align-items:flex-end}
        /* Own messages mirror the row so the avatar sits on the right */
        .message.own{margin-left:auto;flex-direction:row-reverse}
        .message.grouped{margin-bottom:4px}
        /* Round letter avatar — the sender's initial on their own colour */
        .avatar{width:36px;height:36px;flex:0 0 auto;border-radius:50%;display:grid;place-items:center;
          color:#fff;font-weight:700;font-size:15px;line-height:1;text-transform:uppercase;
          box-shadow:0 1px 3px rgba(23,43,41,.18);user-select:none}
        .avatar-spacer{width:36px;flex:0 0 auto}

        /* The bubble, with a small tail on the first of each run */
        .bubble{position:relative;background:#fff;border:1px solid ${c.greenBorder};border-radius:14px;padding:8px 12px 6px;box-shadow:0 1px 1px rgba(23,43,41,.06);min-width:96px}
        .message.own .bubble{background:${c.soft};border-color:${c.greenBorder}}
        .message:not(.grouped) .bubble{border-top-left-radius:4px}
        .message.own:not(.grouped) .bubble{border-top-left-radius:14px;border-top-right-radius:4px}

        .sender{margin:0 0 3px;font-size:13px;font-weight:700;line-height:1.2}
        .bubble-text{margin:0;color:${c.ink};line-height:1.5;font-size:14.5px;white-space:pre-wrap;overflow-wrap:anywhere;padding-right:52px}
        .stamp{position:absolute;right:11px;bottom:6px;font-size:11px;color:${c.muted};font-variant-numeric:tabular-nums}

        /* Own-message controls: out of the way until hover or keyboard focus */
        .bubble-actions{position:absolute;top:-13px;right:6px;display:flex;gap:2px;opacity:0;transition:opacity .16s}
        .message:hover .bubble-actions,.message:focus-within .bubble-actions{opacity:1}
        @media (hover:none){.bubble-actions{opacity:1}}
        .bubble-actions button{width:27px;height:27px;border:1px solid ${c.greenBorder};border-radius:50%;background:#fff;color:${c.muted};display:grid;place-items:center;cursor:pointer;box-shadow:0 2px 6px rgba(23,43,41,.12)}
        .bubble-actions button:hover{color:${c.primary};border-color:${c.primary}}
        .bubble-actions button.danger:hover{color:${c.error};border-color:${c.error}}
        .bubble-actions button:disabled{opacity:.6;cursor:not-allowed}

        .edit-form{margin-top:4px;display:flex;flex-direction:column;gap:8px;min-width:220px}
        .edit-form textarea{width:100%;resize:vertical;min-height:56px;padding:10px;border:1px solid ${c.yellowBorder};border-radius:10px;color:${c.ink};font:inherit;background:#fff}
        .edit-form textarea:focus{outline:2px solid ${c.soft};border-color:${c.primary}}
        .edit-actions{display:flex;justify-content:flex-end;gap:12px;align-items:center}
        .edit-actions .text-button{margin:0;color:${c.muted};font-weight:700}
        .save-button{border:0;border-radius:999px;background:${c.primary};color:#fff;font-weight:700;padding:7px 16px;cursor:pointer}
        .save-button:disabled{background:#9db6b1;cursor:not-allowed}

        .skel-chat{display:grid;gap:12px;padding-top:6px}
        .skel-bubble{height:52px;border-radius:14px}
        .skel-bubble.own{margin-left:auto}
        .center{text-align:center;color:${c.muted};padding:60px 20px}
        /* Chat input bar: pill field plus a round send button */
        .composer{padding:14px 18px;display:flex;gap:10px;align-items:flex-end;border-top:1px solid ${c.border};background:#fff}
        .composer textarea{flex:1;resize:none;min-height:46px;max-height:132px;padding:13px 18px;border:1px solid ${c.border};border-radius:24px;color:${c.ink};font:inherit;line-height:1.45;background:${c.softer}}
        .composer textarea::placeholder{color:${c.muted}}
        .composer textarea:focus{outline:none;border-color:${c.primary};background:#fff;box-shadow:0 0 0 3px ${c.soft}}
        .send{width:46px;height:46px;flex:0 0 auto;border:0;border-radius:50%;background:${c.primary};color:#fff;display:grid;place-items:center;cursor:pointer;transition:transform .16s,background .16s}
        .send:hover:not(:disabled){transform:scale(1.06)}
        .send:disabled{background:#b6c5c2;cursor:not-allowed}
        .modal-layer{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px}
        .modal-backdrop{position:absolute;inset:0;background:rgba(10,35,32,.55)}
        .modal{position:relative;width:min(100%,600px);max-height:calc(100vh - 40px);overflow:auto;background:#fff;border-radius:12px;padding:30px;box-shadow:0 24px 60px rgba(0,0,0,.2)}
        .modal-header{display:flex;justify-content:space-between;gap:12px;align-items:start;margin-bottom:18px}
        .modal h2{font-size:23px}
        .modal label{display:grid;gap:7px;font-size:14px;font-weight:700;margin-top:14px;color:${c.ink}}
        .modal input,.modal textarea{width:100%;padding:11px;border:1px solid ${c.border};border-radius:6px;font:inherit;color:${c.ink};font-weight:400}
        .modal textarea{min-height:100px;resize:vertical}
        .two-columns{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .form-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}
        .form-error{color:${c.error};background:#fff5f4;padding:10px;border-radius:6px}
        .primary,.secondary{border:0;border-radius:6px;cursor:pointer;font-weight:700;padding:10px 18px}
        .primary{background:${c.primary};color:#fff}
        .primary:disabled{background:#9db6b1;cursor:not-allowed}
        .secondary{background:#fff;color:${c.ink};border:1px solid ${c.border}}
        @media(max-width:640px){
          .nav-inner{min-height:64px;padding:0 14px;gap:9px}
          .brand{display:none}
          .tabs{flex:1}
          .tab{flex:1;justify-content:center;padding:0 8px;font-size:13px}
          .tab .material-symbols-outlined{display:none}
          .exit{width:36px;height:36px}
          .content{padding:28px 14px 48px}
          .hero-panel{grid-template-columns:1fr}
          .heading h1,.conversation-header h1{font-size:24px}
          .detail-meta{grid-template-columns:1fr}
          .hero{height:230px}
          .detail-body{padding:24px 18px}
          .detail-body h1{font-size:27px}
          .message-list{padding:14px 12px 6px}
          /* Nav is 64px on small screens and the page padding is tighter */
          .message{max-width:88%}
          .bubble-text{font-size:14px}
          .chat-title h1{font-size:16px}
          .composer{padding:12px}
        }
      `}</style>

      <header className="nav">
        <div className="nav-inner">
          {/* Same brand mark as the site navbar, drawn in the community palette */}
          <Link to="/" className="brand" aria-label="ShareShelf home">
            <span className="brand-mark"><i className="fa-solid fa-book-open" /></span>
            <span className="brand-text">ShareShelf</span>
          </Link>
          <nav className="tabs" role="tablist" aria-label="Community sections">
            <button role="tab" aria-selected={tab === 'events'} aria-controls="panel-events" className={`tab ${tab === 'events' ? 'active' : ''}`} onClick={() => switchTab('events')}><Icon name="event" size={20} />Events</button>
            <button role="tab" aria-selected={tab === 'messages'} aria-controls="panel-messages" className={`tab ${tab === 'messages' ? 'active' : ''}`} onClick={() => switchTab('messages')}><Icon name="forum" size={20} />Conversation</button>
          </nav>
          {/* Icon only — the arrow carries the meaning, the label is for
              screen readers and the native tooltip. */}
          <Link to="/user-dashboard" className="exit" aria-label="Back to dashboard" title="Back to dashboard"><Icon name="arrow_back" size={21} /></Link>
        </div>
      </header>

      <main className="content">
        {/* The hero introduces the events view. On the conversation tab it
            just pushes the chat down, so it is only rendered for events. */}
        {tab === 'events' && (
        <section className="hero-panel">
          <div className="hero-card">
            <p className="hero-kicker">Community hub</p>
            <h1 className="hero-title">Discover events and join the conversation.</h1>
            <p className="hero-copy">See new events and share simple messages with the community.</p>
            <div className="hero-actions">
              <button className="hero-chip" onClick={() => switchTab('events')}>Browse events</button>
              <button className="hero-chip" onClick={() => switchTab('messages')}>Open conversation</button>
            </div>
          </div>
          <div className="spotlight-card">
            <p className="hero-kicker">Next event</p>
            {nextEvent ? (
              <>
                <h2 style={{ fontSize: 28, lineHeight: 1.2 }}>{nextEvent.title}</h2>
                <p style={{ marginTop: 14, color: c.muted, lineHeight: 1.8 }}>{nextEvent.date} at {nextEvent.time}{nextEvent.venue ? ` • ${nextEvent.venue}` : ''}</p>
              </>
            ) : (
              <p style={{ color: c.muted, lineHeight: 1.8 }}>No event is published yet.</p>
            )}
          </div>
        </section>
        )}
        {tab === 'events' ? (
          <div id="panel-events" className="tab-panel" role="tabpanel" tabIndex={-1}>
            {selected ? (
              <Details event={selected} onBack={() => setSelected(null)} isAdmin={isAdmin} onEdit={openEdit} onDelete={deleteEvent} deleting={deletingId === selected.id} onParticipate={toggleParticipation} participating={participatingId === selected.id} />
            ) : (
              <Events events={events} loading={loadingEvents} error={eventError} onOpen={setSelected} isAdmin={isAdmin} onAdd={openAdd} onEdit={openEdit} onDelete={deleteEvent} deletingId={deletingId} onParticipate={toggleParticipation} participatingId={participatingId} />
            )}
          </div>
        ) : (
          <div id="panel-messages" className="tab-panel" role="tabpanel" tabIndex={-1}>
            <Conversation messages={messages} loading={loadingMessages} error={messageError} onSend={sendMessage} onUpdate={updateMessage} onDelete={deleteMessage} onRefresh={loadMessages} currentUserId={user?.id} />
          </div>
        )}
      </main>

      {formOpen && <EventForm event={editingEvent} onClose={() => { setFormOpen(false); setEditingEvent(null); }} onSave={saveEvent} />}
    </div>
  );
}
