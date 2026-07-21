import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { communityAPI } from '../../services/api';

const c = { primary: '#176b63', dark: '#0f4e48', soft: '#e2f1ee', yellow: '#fff4cc', yellowBorder: '#edd77d', surface: '#fff', canvas: '#f8f8f2', ink: '#172b29', muted: '#5c6a68', border: '#d6e2df', error: '#b74f47' };
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

function formatEvent(event) {
  const date = new Date(event.eventDate);
  return { ...event, image: event.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&h=500&fit=crop', date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }), time: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) };
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

function Events({ events, loading, error, onOpen, isAdmin, onAdd, onEdit, onDelete, deletingId }) {
  return (
    <section>
      <div className="heading">
        <div><p>Community calendar</p><h1>Upcoming events</h1></div>
        <div className="heading-actions">
          <span className="count">{events.length} published</span>
          {isAdmin && <button className="primary-button" onClick={onAdd}><Icon name="add" size={20} />Add event</button>}
        </div>
      </div>
      {loading && <div className="empty">Loading events...</div>}
      {!loading && error && <div className="empty error">{error}</div>}
      {!loading && !error && events.length === 0 && <div className="empty"><Icon name="event_busy" size={48} /><h2>No events published</h2><p>{isAdmin ? 'Click "Add event" to publish the first one.' : 'The community administrator has not published an event yet.'}</p></div>}
      <div className="event-grid">
        {events.map((event) => (
          <article className="event-card" key={event.id} onClick={() => onOpen(event)}>
            {isAdmin && (
              <div className="card-admin-actions" onClick={(clickEvent) => clickEvent.stopPropagation()}>
                <button aria-label="Edit event" title="Edit event" onClick={() => onEdit(event)}><Icon name="edit" size={18} /></button>
                <button aria-label="Delete event" title="Delete event" className="danger" disabled={deletingId === event.id} onClick={() => onDelete(event)}><Icon name="delete" size={18} /></button>
              </div>
            )}
            <img src={event.image} alt="" />
            <div>
              <span className="label">Community event</span>
              <h2>{event.title}</h2>
              <p className="description">{event.description}</p>
              <div className="meta">
                <span><Icon name="calendar_today" size={18} />{event.date}</span>
                <span><Icon name="schedule" size={18} />{event.time}</span>
                <span><Icon name="location_on" size={18} />{event.venue || 'Venue to be announced'}</span>
              </div>
              <button className="text-button">View event <Icon name="arrow_forward" size={18} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Details({ event, onBack, isAdmin, onEdit, onDelete, deleting }) {
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
        <span className="label">Community event</span>
        <h1>{event.title}</h1>
        <p className="detail-description">{event.description}</p>
        <div className="detail-meta">
          <div><Icon name="calendar_today" /><span>Date<strong>{event.date}</strong></span></div>
          <div><Icon name="schedule" /><span>Time<strong>{event.time}</strong></span></div>
          <div><Icon name="location_on" /><span>Location<strong>{event.venue || 'Venue to be announced'}</strong></span></div>
        </div>
      </div>
    </section>
  );
}

function Conversation({ messages, loading, error, onSend, onRefresh }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try { await onSend(content); setContent(''); } finally { setSending(false); }
  };

  return (
    <section className="conversation">
      <div className="conversation-header">
        <div className="conversation-icon"><Icon name="forum" /></div>
        <div><p>Member space</p><h1>Community conversation</h1><span>Messages from ShareShelf customers</span></div>
        <button className="icon-button" title="Refresh messages" aria-label="Refresh messages" onClick={onRefresh}><Icon name="refresh" /></button>
      </div>
      <div className="message-list">
        {loading && <p className="center">Loading messages...</p>}
        {!loading && error && <p className="center error">{error}</p>}
        {!loading && !error && messages.length === 0 && <div className="center"><Icon name="chat_bubble_outline" size={48} /><p>Be the first to start the conversation.</p></div>}
        {messages.map((message) => (
          <article className="message" key={message.id}>
            <div className="avatar">{message.user.name.charAt(0).toUpperCase()}</div>
            <div><div className="message-top"><strong>{message.user.name}</strong><time>{new Date(message.createdAt).toLocaleString()}</time></div><p>{message.content}</p></div>
          </article>
        ))}
      </div>
      <form className="composer" onSubmit={submit}>
        <textarea aria-label="Community message" value={content} onChange={(event) => setContent(event.target.value)} maxLength={1000} placeholder="Share a message with the community..." />
        <button className="send" disabled={!content.trim() || sending} title="Send message" aria-label="Send message"><Icon name="send" /></button>
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

  const switchTab = (next) => { setTab(next); setSelected(null); };

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
    <div className="community-page">
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0,0&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box}
        .community-page{min-height:100vh;background:radial-gradient(circle at top left, rgba(255,244,204,.95), transparent 30%), radial-gradient(circle at top right, rgba(226,241,238,.75), transparent 26%), ${c.canvas};color:${c.ink};font-family:'DM Sans',sans-serif}
        button{font:inherit}
        h1,h2{font-family:'Libre Baskerville',serif;letter-spacing:0}
        .nav{position:sticky;top:0;z-index:10;background:rgba(255,255,255,.92);border-bottom:1px solid ${c.yellowBorder};backdrop-filter:blur(12px)}
        .nav-inner{max-width:1200px;margin:auto;min-height:72px;padding:0 24px;display:flex;align-items:center;gap:24px;justify-content:space-between}
        .brand{color:${c.primary};font-family:'Libre Baskerville',serif;font-size:22px;font-weight:700;text-decoration:none}
        .tabs{display:flex;align-self:stretch;gap:4px}
        .tab{border:0;border-bottom:3px solid transparent;background:transparent;color:${c.muted};padding:0 18px;cursor:pointer;display:flex;gap:8px;align-items:center;font-weight:600}
        .tab.active{color:${c.primary};border-bottom-color:${c.primary}}
        .exit{color:#fff;background:${c.error};text-decoration:none;padding:9px 13px;border-radius:6px;display:flex;align-items:center;gap:6px;font-weight:600}
        .content{max-width:1200px;margin:auto;padding:56px 24px 84px}
        .hero-panel{display:grid;grid-template-columns:1.15fr .85fr;gap:20px;margin-bottom:30px}
        .hero-card,.spotlight-card{background:rgba(255,255,255,.94);border:1px solid ${c.yellowBorder};border-radius:16px;box-shadow:0 12px 28px rgba(23,107,99,.06)}
        .hero-card{padding:32px}
        .spotlight-card{padding:32px;background:${c.yellow};color:${c.ink}}
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
        .count{border:1px solid ${c.yellowBorder};background:${c.yellow};border-radius:99px;padding:10px 15px;color:${c.muted};font-size:14px;white-space:nowrap}
        .primary-button{display:flex;align-items:center;gap:8px;border:0;border-radius:999px;background:${c.primary};color:#fff;padding:12px 18px;font-weight:700;cursor:pointer}
        .event-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
        .event-card{background:#fff;border:1px solid ${c.yellowBorder};border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;position:relative}
        .event-card:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgba(23,107,99,.12)}
        .event-card img{width:100%;height:190px;object-fit:cover;display:block}
        .event-card>div:last-child{padding:20px}
        .card-admin-actions{position:absolute;top:12px;right:12px;display:flex;gap:6px;z-index:2}
        .card-admin-actions button{width:34px;height:34px;border:0;border-radius:6px;background:rgba(255,255,255,0.92);color:${c.primary};display:grid;place-items:center;cursor:pointer}
        .card-admin-actions button.danger{color:${c.error}}
        .card-admin-actions button:disabled{opacity:.5;cursor:not-allowed}
        .label{display:inline-block;background:${c.yellow};color:${c.dark};border-radius:99px;padding:6px 10px;font-size:12px;font-weight:700}
        .event-card h2{margin:14px 0 8px;font-size:21px;line-height:1.35}
        .description{color:${c.muted};line-height:1.5;margin:0 0 18px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .meta{display:grid;gap:8px;color:${c.muted};font-size:13px}
        .meta span{display:flex;align-items:center;gap:8px}
        .text-button,.back{color:${c.primary};border:0;background:transparent;padding:0;display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:700;margin-top:18px}
        .empty{border:1px dashed ${c.yellowBorder};background:#fff;padding:68px 28px;text-align:center;color:${c.muted};border-radius:12px;grid-column:1/-1}
        .empty h2{color:${c.ink};font-size:20px;margin:12px 0 6px}
        .error{color:${c.error}}
        .details,.conversation{max-width:900px;margin:auto;background:#fff;border:1px solid ${c.yellowBorder};border-radius:12px;overflow:hidden}
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
        .conversation-header{padding:24px;border-bottom:1px solid ${c.border};display:flex;align-items:center;gap:14px}
        .conversation-header h1{font-size:27px}
        .conversation-header span{color:${c.muted};font-size:14px}
        .conversation-icon,.avatar{background:${c.primary};color:#fff;display:grid;place-items:center;border-radius:50%;flex:0 0 auto}
        .conversation-icon{width:48px;height:48px;background:${c.soft};color:${c.primary}}
        .icon-button{margin-left:auto;width:42px;height:42px;border:1px solid ${c.border};border-radius:6px;background:#fff;color:${c.primary};display:grid;place-items:center;cursor:pointer}
        .message-list{min-height:390px;max-height:56vh;overflow:auto;padding:28px;background:#fffdf4}
        .message{display:flex;gap:11px;margin-bottom:22px;max-width:760px}
        .avatar{width:38px;height:38px;font-weight:700}
        .message-top{display:flex;gap:9px;align-items:baseline;flex-wrap:wrap}
        .message-top time{color:${c.muted};font-size:12px}
        .message p{margin:5px 0 0;color:${c.ink};line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}
        .center{text-align:center;color:${c.muted};padding:60px 20px}
        .composer{padding:20px 24px;display:flex;gap:12px;border-top:1px solid ${c.yellowBorder}}
        .composer textarea{flex:1;resize:vertical;min-height:56px;max-height:110px;padding:14px;border:1px solid ${c.yellowBorder};border-radius:10px;color:${c.ink};font:inherit}
        .composer textarea:focus{outline:2px solid ${c.soft};border-color:${c.primary}}
        .send{width:52px;height:52px;align-self:end;border:0;border-radius:10px;background:${c.primary};color:#fff;display:grid;place-items:center;cursor:pointer}
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
          .exit{padding:9px}
          .exit span:last-child{display:none}
          .content{padding:28px 14px 48px}
          .hero-panel{grid-template-columns:1fr}
          .heading h1,.conversation-header h1{font-size:24px}
          .detail-meta{grid-template-columns:1fr}
          .hero{height:230px}
          .detail-body{padding:24px 18px}
          .detail-body h1{font-size:27px}
          .message-list{padding:18px 14px}
        }
      `}</style>

      <header className="nav">
        <div className="nav-inner">
          <Link to="/user-dashboard" className="brand">ShareShelf Community</Link>
          <nav className="tabs">
            <button className={`tab ${tab === 'events' ? 'active' : ''}`} onClick={() => switchTab('events')}><Icon name="event" size={20} />Events</button>
            <button className={`tab ${tab === 'messages' ? 'active' : ''}`} onClick={() => switchTab('messages')}><Icon name="forum" size={20} />Conversation</button>
          </nav>
          <Link to="/user-dashboard" className="exit"><Icon name="arrow_back" size={19} /><span>Dashboard</span></Link>
        </div>
      </header>

      <main className="content">
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
        {tab === 'events' ? (
          selected ? (
            <Details event={selected} onBack={() => setSelected(null)} isAdmin={isAdmin} onEdit={openEdit} onDelete={deleteEvent} deleting={deletingId === selected.id} />
          ) : (
            <Events events={events} loading={loadingEvents} error={eventError} onOpen={setSelected} isAdmin={isAdmin} onAdd={openAdd} onEdit={openEdit} onDelete={deleteEvent} deletingId={deletingId} />
          )
        ) : (
          <Conversation messages={messages} loading={loadingMessages} error={messageError} onSend={sendMessage} onRefresh={loadMessages} />
        )}
      </main>

      {formOpen && <EventForm event={editingEvent} onClose={() => { setFormOpen(false); setEditingEvent(null); }} onSave={saveEvent} />}
    </div>
  );
}
