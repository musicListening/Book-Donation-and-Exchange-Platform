import { useState, useEffect } from "react";

const colors = {
  primary: "#006D5B",
  primaryContainer: "#1B8C78",
  primaryFixed: "#C8F0EA",
  onPrimaryContainer: "#E8F5F2",
  onPrimary: "#FFFFFF",
  secondary: "#8B5E3C",
  secondaryContainer: "#FFD5B8",
  onSecondaryContainer: "#6B472A",
  tertiaryFixed: "#E6F4F0",
  tertiaryContainer: "#2D6A4F",
  onTertiaryContainer: "#B2DFCC",
  tertiary: "#1B4D3E",
  surface: "#F8FDFB",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F2F9F6",
  surfaceContainerHigh: "#E8F2EF",
  surfaceContainer: "#EEF6F3",
  onSurface: "#1A2E28",
  onSurfaceVariant: "#3D5A52",
  outlineVariant: "#C5D9D3",
  error: "#BA1A1A",
  errorContainer: "#FFDAD6",
};

const sidebarColors = {
  background: "#0A3B32",
  text: "#FFFFFF",
  textHover: "#E8F5F2",
  border: "rgba(255, 255, 255, 0.15)",
  activeBackground: "rgba(255, 255, 255, 0.12)",
  hoverBackground: "rgba(255, 255, 255, 0.08)",
  icon: "#FFFFFF",
  iconHover: "#C8F0EA",
};

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Book Donation Drive",
    date: "Oct 12, 2024 • 10:00 AM",
    locationIcon: "location_on",
    location: "Central Library Courtyard",
    status: "Active",
    statusStyle: { background: "rgba(0,109,91,0.88)", color: "#fff" },
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=200&fit=crop",
  },
  {
    id: 2,
    title: "Volunteer Training",
    date: "Oct 15, 2024 • 2:00 PM",
    locationIcon: "videocam",
    location: "Online (Zoom Meeting)",
    status: "Upcoming",
    statusStyle: { background: "#8B5E3C", color: "#fff" },
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
  },
  {
    id: 3,
    title: "Winter Literary Gala",
    date: "Dec 05, 2024 • 7:00 PM",
    locationIcon: "location_on",
    location: "Grand Hall, West Wing",
    status: "Draft",
    statusStyle: { background: "#C5D9D3", color: "#1A2E28" },
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=200&fit=crop",
  },
  {
    id: 4,
    title: "Community Story Swap",
    date: "Oct 28, 2024 • 11:30 AM",
    locationIcon: "location_on",
    location: "Public Library Plaza",
    status: "Active",
    statusStyle: { background: "rgba(0,109,91,0.88)", color: "#fff" },
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=200&fit=crop",
  },
];

function Icon({ name, size = 24, style = {} }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: size, lineHeight: 1, ...style }}>
      {name}
    </span>
  );
}

function DisplayEventCard({ event, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); setMenuOpen(false); }} style={{ background: colors.surfaceContainerLowest, border: `1px solid ${colors.outlineVariant}`, borderRadius: 12, overflow: "hidden", transition: "transform 0.2s ease, box-shadow 0.2s ease", transform: hovered ? "translateY(-2px)" : "translateY(0)", boxShadow: hovered ? "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02)" : "none", position: "relative" }}>
      {hovered && (
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", backdropFilter: "blur(4px)" }}>
            <Icon name="more_vert" size={20} />
          </button>
          {menuOpen && (
            <div style={{ position: "absolute", top: 40, right: 0, background: colors.surfaceContainerLowest, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 20, border: `1px solid ${colors.outlineVariant}` }}>
              <button onClick={() => { onEdit(event); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", width: "100%", border: "none", background: "transparent", cursor: "pointer", color: colors.onSurface, fontSize: 14, transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceContainerLow)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <Icon name="edit" size={18} /> Edit
              </button>
              <button onClick={() => { onDelete(event.id); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", width: "100%", border: "none", background: "transparent", cursor: "pointer", color: colors.error, fontSize: 14, transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceContainerLow)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <Icon name="delete" size={18} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }} onMouseEnter={() => setImgHovered(true)} onMouseLeave={() => setImgHovered(false)}>
        <img src={event.image} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: imgHovered ? "scale(1.05)" : "scale(1)" }} />
        <span style={{ position: "absolute", top: 16, left: 16, padding: "4px 12px", borderRadius: 40, fontSize: 12, fontWeight: 500, backdropFilter: "blur(4px)", ...event.statusStyle }}>{event.status}</span>
      </div>
      <div style={{ padding: 20 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: colors.onSurface, marginBottom: 12 }}>{event.title}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: colors.onSurfaceVariant }}>
            <Icon name="calendar_today" size={18} />
            <span style={{ fontSize: 14 }}>{event.date}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: colors.onSurfaceVariant }}>
            <Icon name={event.locationIcon} size={18} />
            <span style={{ fontSize: 14 }}>{event.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventModal({ isOpen, onClose, onSave, event }) {
  const [formData, setFormData] = useState({ title: "", date: "", time: "", location: "", status: "Active", image: "" });

  useEffect(() => {
    if (event) {
      const dateParts = event.date.split(" • ");
      setFormData({ title: event.title, date: dateParts[0] || "", time: dateParts[1] || "", location: event.location, status: event.status, image: event.image });
    } else {
      setFormData({ title: "", date: "", time: "", location: "", status: "Active", image: "" });
    }
  }, [event, isOpen]);

  const statusOptions = [
    { label: "Active", color: "rgba(0,109,91,0.88)", textColor: "#fff" },
    { label: "Upcoming", color: "#8B5E3C", textColor: "#fff" },
    { label: "Draft", color: "#C5D9D3", textColor: "#1A2E28" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedDate = `${formData.date} • ${formData.time}`;
    const statusOption = statusOptions.find(s => s.label === formData.status);
    const newEvent = {
      id: event ? event.id : Date.now(),
      title: formData.title,
      date: formattedDate,
      locationIcon: "location_on",
      location: formData.location,
      status: formData.status,
      statusStyle: { background: statusOption?.color || "rgba(0,109,91,0.88)", color: statusOption?.textColor || "#fff" },
      image: formData.image || "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=200&fit=crop",
    };
    onSave(newEvent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: colors.surfaceContainerLowest, borderRadius: 16, padding: 28, width: "90%", maxWidth: 500, zIndex: 101, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: colors.primary }}>{event ? "Edit Event" : "Add New Event"}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 8, borderRadius: "50%", display: "flex" }}>
            <Icon name="close" size={24} style={{ color: colors.onSurfaceVariant }} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: colors.onSurface }}>Event Title *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${colors.outlineVariant}`, fontSize: 14, fontFamily: "'Inter', sans-serif" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: colors.onSurface }}>Date *</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${colors.outlineVariant}`, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: colors.onSurface }}>Time *</label>
              <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${colors.outlineVariant}`, fontSize: 14 }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: colors.onSurface }}>Location *</label>
            <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${colors.outlineVariant}`, fontSize: 14 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: colors.onSurface }}>Status *</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${colors.outlineVariant}`, fontSize: 14, background: "white" }}>
              {statusOptions.map(opt => (<option key={opt.label} value={opt.label}>{opt.label}</option>))}
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: colors.onSurface }}>Image URL (optional)</label>
            <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://example.com/image.jpg" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${colors.outlineVariant}`, fontSize: 14 }} />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${colors.outlineVariant}`, background: "transparent", cursor: "pointer", fontSize: 14, color: colors.onSurfaceVariant }}>Cancel</button>
            <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: colors.primary, color: "white", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>{event ? "Update Event" : "Create Event"}</button>
          </div>
        </form>
      </div>
    </>
  );
}

function Sidebar({ open, onClose, navigate, isMd }) {
  const navLinks = [
    { icon: "dashboard", label: "Dashboard", active: false, path: "/community-admin/dashboard" },
    { icon: "calendar_today", label: "Events", active: true, path: "/community-admin/events" },
    { icon: "forum", label: "Messages", active: false, path: "/community-admin/messages" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (navigate) { navigate('/login'); } else { window.location.href = "/login"; }
    if (onClose) onClose();
  };

  const sidebarContent = (
    <aside style={{ height: "100%", width: 280, background: sidebarColors.background, borderRight: `1px solid ${sidebarColors.border}`, display: "flex", flexDirection: "column", padding: "28px 20px" }}>
      <div style={{ marginBottom: 48, paddingLeft: 12 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: sidebarColors.text, marginBottom: 8, letterSpacing: "-0.5px" }}>Community Admin</h1>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {navLinks.map((link) => (
          <a key={link.label} onClick={(e) => { e.preventDefault(); if (navigate) { navigate(link.path); } if (onClose) onClose(); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", textDecoration: "none", borderRadius: 10, fontWeight: link.active ? 600 : 400, color: link.active ? sidebarColors.text : "rgba(255, 255, 255, 0.7)", background: link.active ? sidebarColors.activeBackground : "transparent", borderLeft: link.active ? `3px solid ${colors.primaryFixed}` : "3px solid transparent", fontSize: 14, lineHeight: "20px", transition: "all 0.2s ease", cursor: "pointer" }} onMouseEnter={(e) => { if (!link.active) { e.currentTarget.style.background = sidebarColors.hoverBackground; e.currentTarget.style.color = sidebarColors.textHover; } }} onMouseLeave={(e) => { if (!link.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"; } }}>
            <Icon name={link.icon} size={20} style={{ color: "inherit" }} />
            <span style={{ fontWeight: link.active ? 600 : 400 }}>{link.label}</span>
          </a>
        ))}
      </nav>
      <div style={{ marginTop: "auto", paddingTop: 24, borderTop: `1px solid ${sidebarColors.border}` }}>
        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", width: "100%", background: "transparent", border: "none", borderRadius: 10, color: "rgba(255, 255, 255, 0.7)", fontSize: 14, cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'Inter', sans-serif" }} onMouseEnter={(e) => { e.currentTarget.style.background = sidebarColors.hoverBackground; e.currentTarget.style.color = sidebarColors.textHover; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"; }}>
          <Icon name="logout" size={20} style={{ color: "inherit" }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  if (!isMd) {
    return (
      <>
        {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />}
        <div style={{ position: "fixed", left: 0, top: 0, height: "100%", zIndex: 50, transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", transform: open ? "translateX(0)" : "translateX(-100%)" }}>{sidebarContent}</div>
      </>
    );
  }
  return <div style={{ position: "fixed", left: 0, top: 0, height: "100%", zIndex: 50 }}>{sidebarContent}</div>;
}

export default function EventManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => {
      setIsMd(e.matches);
      if (e.matches) setSidebarOpen(false);
    };
    setIsMd(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const navigate = (path) => { window.location.href = path; };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const handleSaveEvent = (savedEvent) => {
    if (editingEvent) {
      setEvents(events.map(event => event.id === savedEvent.id ? savedEvent : event));
    } else {
      setEvents([savedEvent, ...events]);
    }
    setModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${colors.surface}; font-family: 'Inter', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-family: 'Material Symbols Outlined'; }
        .event-grid { display: grid; grid-template-columns: 1fr; gap: 24px; padding-bottom: 20px; }
        @media (min-width: 768px) { .event-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .event-grid { grid-template-columns: repeat(3, 1fr); } }
        .content-wrapper { flex: 1; }
        /* Remove scrollbar track color */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${colors.primaryContainer}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${colors.primary}; }
      `}</style>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} isMd={isMd} />

      <main style={{ marginLeft: isMd ? 280 : 0, minHeight: "100vh", background: colors.surface, display: "flex", flexDirection: "column" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 40, background: colors.surfaceContainerLowest, borderBottom: `1px solid ${colors.outlineVariant}`, display: "flex", justifyContent: "space-between", alignItems: "center", height: 70, padding: "0 28px", boxShadow: "0 1px 2px rgba(0,0,0,0.03)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {!isMd && <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: colors.primary, display: "flex", borderRadius: 8 }}><Icon name="menu" size={24} /></button>}
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: colors.primary }}>Events</h2>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.primaryFixed, display: "flex", alignItems: "center", justifyContent: "center", color: colors.primary, fontWeight: 600 }}><Icon name="person" size={20} /></div>
        </header>

        <div className="content-wrapper" style={{ padding: "28px", maxWidth: 1400, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: colors.secondary, letterSpacing: "0.08em", marginBottom: 4 }}>Event management</p>
              <h3 style={{ fontSize: 26, fontWeight: 700, color: colors.primary, fontFamily: "'Playfair Display', serif" }}>All events</h3>
              <p style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 }}>Browse, edit, and manage community events ({events.length} total)</p>
            </div>
            <button onClick={handleAddEvent} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: colors.primary, color: "white", border: "none", borderRadius: 40, fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "transform 0.2s, background 0.2s", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryContainer; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.transform = "translateY(0)"; }}>
              <Icon name="add" size={20} /> Add Event
            </button>
          </div>

          <div className="event-grid">
            {events.map((event) => (<DisplayEventCard key={event.id} event={event} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />))}
          </div>

          {events.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, background: colors.surfaceContainerLowest, borderRadius: 12, border: `1px solid ${colors.outlineVariant}` }}>
              <Icon name="event_busy" size={48} style={{ color: colors.onSurfaceVariant, opacity: 0.5 }} />
              <p style={{ marginTop: 16, color: colors.onSurfaceVariant }}>No events found. Click "Add Event" to create one.</p>
            </div>
          )}
        </div>

        <footer style={{ flexShrink: 0, padding: "28px 32px", textAlign: "center", borderTop: `1px solid ${colors.outlineVariant}`, background: colors.surfaceContainerLowest }}>
          <p style={{ fontSize: 13, color: `${colors.onSurfaceVariant}CC` }}>© 2024 Community Admin Ecosystem — Growing together, sustainably.</p>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 28 }}>
            {["System Status", "Terms of Service", "Privacy Policy"].map((link) => (<a key={link} href="#" style={{ fontSize: 12, color: colors.onSurfaceVariant, transition: "color 0.2s", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)} onMouseLeave={(e) => (e.currentTarget.style.color = colors.onSurfaceVariant)}>{link}</a>))}
          </div>
        </footer>
      </main>

      <EventModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingEvent(null); }} onSave={handleSaveEvent} event={editingEvent} />
    </>
  );
}