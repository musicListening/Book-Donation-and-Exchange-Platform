import React, { useState, useEffect } from "react";

// ── Design tokens (Balanced Teal & Earth Tones) ────────────────
const c = {
  primary: "#1A6D6A",
  onPrimary: "#FFFFFF",
  primaryHover: "#0F5250",
  primaryContainer: "#E0F0EF",
  primaryLight: "#EFF8F7",
  secondary: "#F4B942",
  onSecondary: "#2D2B26",
  secondaryHover: "#E0A532",
  tertiary: "#A35C3A",
  onTertiary: "#FFFFFF",
  tertiaryLight: "#F7EDE8",
  neutral: "#7C7E7E",
  neutralLight: "#E6E8E8",
  neutralDark: "#3A3C3C",
  background: "#FBFCFD",
  surface: "#FFFFFF",
  surfaceContainerLowest: "#F4F6F7",
  surfaceContainerHigh: "#EAEEEF",
  onSurface: "#1E2A2A",
  onSurfaceVariant: "#5C6A6A",
  outlineVariant: "#DCE2E2",
  success: "#1A6D6A",
  warning: "#F4B942",
  error: "#C65D53",
  white: "#FFFFFF",
  shadow: "rgba(0, 0, 0, 0.05)",
  shadowHover: "rgba(26, 109, 106, 0.15)",
};

// ── Static event data ─────────────────────────────────────────
const EVENTS = [
  {
    id: 1,
    title: "Vintage Book Restoration",
    image: "https://picsum.photos/seed/book/800/400",
    tag: "Workshop",
    tagStyle: { background: c.primary, color: c.onPrimary },
    date: "Oct 24, 2024 • 10:00 AM",
    time: "10:00 AM – 1:00 PM",
    location: "Central Archive Wing",
    description: "Learn the delicate art of restoring vintage books. We will cover binding techniques, paper preservation, and archival storage.",
    availableSlots: 15,
    organizer: "Archivist Sarah Jenkins",
    status: "upcoming"
  },
  {
    id: 2,
    title: "Midnight Myths & Fables",
    image: "https://picsum.photos/seed/myth/800/400",
    tag: "Storytelling",
    tagStyle: { background: c.tertiary, color: c.onTertiary },
    date: "Oct 28, 2024 • 8:00 PM",
    time: "8:00 PM – 9:30 PM",
    location: "Open Sky Courtyard",
    description: "Join us around the fire for an evening of ancient myths and forgotten fables from around the world.",
    availableSlots: 40,
    organizer: "The Storytellers Guild",
    status: "upcoming"
  },
  {
    id: 3,
    title: "Annual Scholars' Collection",
    image: "https://picsum.photos/seed/scholar/800/400",
    tag: "Book Drive",
    tagStyle: { background: c.secondary, color: c.onSecondary },
    date: "Nov 02, 2024 • 9:00 AM",
    time: "9:00 AM – 5:00 PM",
    location: "North Plaza Lobby",
    description: "Our annual community book drive. Donate your old academic books to help support the local scholars' program.",
    availableSlots: 100,
    organizer: "University Library",
    status: "upcoming"
  },
  {
    id: 4,
    title: "Digital Archives Seminar",
    image: "https://picsum.photos/seed/digital/800/400",
    tag: "Seminar",
    tagStyle: { background: c.primary, color: c.onPrimary },
    date: "Nov 15, 2024 • 2:00 PM",
    time: "2:00 PM – 4:00 PM",
    location: "Main Auditorium",
    description: "Discover how we are preserving history for the next generation using modern digital scanning and indexing technologies.",
    availableSlots: 200,
    organizer: "Technology & History Dept",
    status: "upcoming"
  }
];

// ── Icon Component ────────────────────────────────────────────
function Icon({ name, size = 24, style = {} }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: size, ...style }}>
      {name}
    </span>
  );
}

// ── YouTube-style Post Card for Joined Events ─────────────────
function JoinedEventPost({ event, onLeave, onViewDetails }) {
  return (
    <div className="post-card" style={{ background: c.surface, border: `1px solid ${c.outlineVariant}`, borderRadius: 20, overflow: "hidden", marginBottom: "clamp(16px, 2vw, 24px)", transition: "all 0.2s", boxShadow: `0 2px 8px ${c.shadow}` }}>
      <div style={{ display: "flex", alignItems: "center", padding: "clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)", gap: 12, flexWrap: "wrap" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: c.primary, color: c.onPrimary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18 }}>
          {event.organizer[0]}
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontWeight: 600, color: c.onSurface, fontSize: "clamp(14px, 1.2vw, 16px)" }}>{event.organizer}</div>
          <div style={{ fontSize: "clamp(12px, 1vw, 14px)", color: c.onSurfaceVariant }}>{event.date}</div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onLeave(event.id); }} className="leave-btn">
          <Icon name="exit_to_app" size={18} /> Leave
        </button>
      </div>
      <div style={{ width: "100%", height: "clamp(200px, 25vh, 400px)", cursor: "pointer", position: "relative" }} onClick={() => onViewDetails(event.id)}>
        <img src={event.image} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div className="post-image-overlay" style={{ position: "absolute", bottom: "clamp(12px, 1.5vw, 20px)", left: "clamp(12px, 1.5vw, 20px)", right: "clamp(12px, 1.5vw, 20px)", background: "rgba(26, 109, 106, 0.9)", backdropFilter: "blur(4px)", color: c.onPrimary, padding: "clamp(8px, 1vw, 12px) clamp(12px, 1.5vw, 20px)", borderRadius: 12, fontWeight: 600, fontSize: "clamp(14px, 1.5vw, 18px)" }}>
          {event.title}
        </div>
      </div>
      <div style={{ padding: "clamp(16px, 2vw, 20px)" }}>
        <div style={{ display: "flex", gap: "clamp(12px, 2vw, 24px)", marginBottom: 16, color: c.onSurfaceVariant, fontSize: "clamp(13px, 1.1vw, 15px)", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="schedule" size={20} /> {event.time}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="location_on" size={20} /> {event.location}</span>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="action-btn"><Icon name="thumb_up" size={18} /> Like</button>
          <button className="action-btn"><Icon name="share" size={18} /> Share</button>
        </div>
      </div>
    </div>
  );
}

// ── Event Card (Browse view) ──────────────────────────────────
function EventCard({ event, isJoined, onToggleJoin, onViewDetails }) {
  const [cardHovered, setCardHovered] = useState(false);

  return (
    <div onMouseEnter={() => setCardHovered(true)} onMouseLeave={() => setCardHovered(false)} style={{ background: c.surface, border: `1px solid ${cardHovered ? c.primary : c.outlineVariant}`, borderRadius: 20, overflow: "hidden", transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)", boxShadow: cardHovered ? `0 12px 28px ${c.shadowHover}` : `0 2px 8px ${c.shadow}`, cursor: "pointer", display: "flex", flexDirection: "column", height: "100%" }} onClick={() => onViewDetails(event.id)}>
      <div style={{ position: "relative", height: "clamp(180px, 20vh, 240px)" }}>
        <img src={event.image} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <span style={{ position: "absolute", top: 12, right: 12, padding: "6px 14px", borderRadius: 30, fontSize: "clamp(11px, 1vw, 13px)", fontWeight: 600, ...event.tagStyle }}>{event.tag}</span>
      </div>
      <div style={{ padding: "clamp(16px, 2vw, 24px)", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "clamp(18px, 1.5vw, 22px)", fontWeight: 600, color: c.onSurface, lineHeight: 1.3 }}>{event.title}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, flex: 1 }}>
          {[
            { icon: "calendar_today", text: event.date },
            { icon: "schedule", text: event.time },
            { icon: "location_on", text: event.location },
          ].map(({ icon, text }, idx) => (
             <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, color: c.onSurfaceVariant, fontSize: "clamp(13px, 1.1vw, 15px)" }}>
               <Icon name={icon} size={20} /> <span className="truncate-text">{text}</span>
             </div>
          ))}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleJoin(event.id); }} style={{ width: "100%", height: "clamp(44px, 4vw, 52px)", background: isJoined ? c.primaryContainer : c.primary, color: isJoined ? c.primary : c.onPrimary, border: isJoined ? `1.5px solid ${c.primary}` : "none", borderRadius: 40, fontSize: "clamp(14px, 1.2vw, 16px)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {isJoined ? "Joined ✓" : "Join Event"}
        </button>
      </div>
    </div>
  );
}

// ── Event Details View ────────────────────────────────────────
function EventDetails({ event, isJoined, onToggleJoin, onBack }) {
  return (
    <div style={{ background: c.surface, borderRadius: 24, overflow: "hidden", border: `1px solid ${c.outlineVariant}`, boxShadow: `0 4px 20px ${c.shadow}`, maxWidth: "100%" }}>
      <button onClick={onBack} style={{ margin: "clamp(16px, 2vw, 24px)", display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: c.primary, fontSize: "clamp(14px, 1.2vw, 16px)", fontWeight: 600, cursor: "pointer" }}>
        <Icon name="arrow_back" /> Back to events
      </button>
      <img src={event.image} alt={event.title} style={{ width: "100%", height: "clamp(250px, 35vh, 450px)", objectFit: "cover" }} />
      <div className="details-padding" style={{ padding: "clamp(24px, 4vw, 48px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <h1 className="details-title" style={{ margin: 0, fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 600, color: c.onSurface, letterSpacing: "-0.01em" }}>{event.title}</h1>
          <span style={{ padding: "8px 20px", borderRadius: 40, fontSize: "clamp(14px, 1.2vw, 16px)", fontWeight: 600, ...event.tagStyle }}>{event.tag}</span>
        </div>
        <p style={{ fontSize: "clamp(15px, 1.3vw, 18px)", color: c.onSurfaceVariant, lineHeight: 1.6, marginBottom: 40 }}>{event.description}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 28, marginBottom: 48 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ padding: 12, background: c.primaryLight, borderRadius: "50%", color: c.primary, display: "flex" }}><Icon name="calendar_today" size={28} /></div>
            <div><div style={{ fontSize: "clamp(11px, 1vw, 13px)", color: c.onSurfaceVariant, fontWeight: 500, textTransform: "uppercase" }}>Date</div><div style={{ fontWeight: 600, fontSize: "clamp(15px, 1.2vw, 17px)" }}>{event.date}</div></div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ padding: 12, background: c.primaryLight, borderRadius: "50%", color: c.primary, display: "flex" }}><Icon name="schedule" size={28} /></div>
            <div><div style={{ fontSize: "clamp(11px, 1vw, 13px)", color: c.onSurfaceVariant, fontWeight: 500, textTransform: "uppercase" }}>Time</div><div style={{ fontWeight: 600, fontSize: "clamp(15px, 1.2vw, 17px)" }}>{event.time}</div></div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ padding: 12, background: c.primaryLight, borderRadius: "50%", color: c.primary, display: "flex" }}><Icon name="location_on" size={28} /></div>
            <div><div style={{ fontSize: "clamp(11px, 1vw, 13px)", color: c.onSurfaceVariant, fontWeight: 500, textTransform: "uppercase" }}>Location</div><div style={{ fontWeight: 600, fontSize: "clamp(15px, 1.2vw, 17px)" }}>{event.location}</div></div>
          </div>
        </div>
        <button onClick={() => onToggleJoin(event.id)} style={{ width: "100%", maxWidth: 300, padding: "clamp(14px, 1.5vw, 18px) 32px", background: isJoined ? c.error : c.primary, color: c.onPrimary, border: "none", borderRadius: 40, fontSize: "clamp(15px, 1.2vw, 18px)", fontWeight: 600, cursor: "pointer", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 12, transition: "all 0.2s" }}>
          {isJoined ? "Leave Event" : "Participate"}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function UpcomingEvents() {
  const [currentView, setCurrentView] = useState("browse");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [activePage, setActivePage] = useState("events");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0,1";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const toggleJoinEvent = (id) => {
    const isJoining = !joinedEvents.includes(id);
    setJoinedEvents((prev) =>
      isJoining ? [...prev, id] : prev.filter((eventId) => eventId !== id)
    );
  };

  const openDetails = (id) => {
    setSelectedEventId(id);
    setCurrentView("details");
  };

  const activeEvent = EVENTS.find((e) => e.id === selectedEventId);
  const myJoinedEventsList = EVENTS.filter((e) => joinedEvents.includes(e.id));

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: c.background, fontFamily: "'Inter', sans-serif" }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          h1, h2, h3 { font-family: 'Playfair Display', serif; letter-spacing: -0.01em; }
          body, button, span, p, div { font-family: 'Inter', sans-serif; }
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            font-family: 'Material Symbols Outlined';
          }
          
          /* Full Area Auto-Grid Magic */
          .event-grid {
            display: grid;
            /* This is the key to auto-filling the full area fluidly */
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
            gap: clamp(20px, 2.5vw, 32px);
            width: 100%;
          }
          
          .nav-tab {
            padding: clamp(12px, 1.5vw, 16px) clamp(20px, 3vw, 32px);
            cursor: pointer;
            border-bottom: 3px solid transparent;
            font-weight: 600;
            font-size: clamp(14px, 1.2vw, 16px);
            color: ${c.onSurfaceVariant};
            transition: all 0.2s;
            background: none;
            border-top: none;
            border-left: none;
            border-right: none;
            text-align: center;
            white-space: nowrap;
          }
          .nav-tab:hover {
            color: ${c.primary};
            background: ${c.primaryContainer};
            border-radius: 40px 40px 0 0;
          }
          .nav-tab.active {
            border-bottom: 3px solid ${c.primary};
            color: ${c.primary};
          }

          /* General Buttons */
          .action-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: clamp(8px, 1vw, 10px) clamp(16px, 1.5vw, 20px);
            background: ${c.surfaceContainerHigh};
            border: none;
            border-radius: 40px;
            color: ${c.onSurfaceVariant};
            font-size: clamp(13px, 1.1vw, 15px);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }
          .action-btn:hover { background: ${c.outlineVariant}; }
          
          .leave-btn {
            background: transparent;
            border: 1px solid ${c.error}40;
            border-radius: 40px;
            padding: 8px 18px;
            color: ${c.error};
            font-size: clamp(13px, 1.1vw, 15px);
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .leave-btn:hover { background: ${c.error}10; }

          .truncate-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

          /* Mobile Layout Resets */
          @media (max-width: 768px) {
            .app-header { flex-direction: column; align-items: flex-start !important; padding: 20px !important; gap: 20px !important; }
            .header-controls { width: 100%; overflow-x: auto; }
            .nav-tab-container { overflow-x: auto; display: flex; width: 100%; }
            .nav-tab { flex: 1; padding: 14px 16px; }
          }
        `}
      </style>

      <header className="app-header" style={{ width: "100%", padding: "clamp(16px, 2vw, 24px) clamp(24px, 4vw, 48px)", display: "flex", alignItems: "center", justifyContent: "space-between", background: c.surface, borderBottom: `1px solid ${c.outlineVariant}`, boxShadow: `0 1px 4px ${c.shadow}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
          {currentView === "details" && activeEvent ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, overflow: "hidden", width: "100%" }}>
              <button onClick={() => { setActivePage("events"); setCurrentView("browse"); setSelectedEventId(null); }} aria-label="Back to events" style={{ background: c.surfaceContainerLowest, border: "none", display: "flex", alignItems: "center", cursor: "pointer", color: c.primary, padding: 10, borderRadius: "50%" }}>
                <Icon name="arrow_back" size={24} />
              </button>
              <h2 style={{ color: c.primary, margin: 0, fontSize: "clamp(20px, 2vw, 26px)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{activeEvent.title}</h2>
            </div>
          ) : (
            <h2 style={{ color: c.primary, margin: 0, fontSize: "clamp(24px, 2.5vw, 32px)", fontWeight: 600 }}>Community Hub</h2>
          )}
        </div>

        <div className="header-controls" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={() => { setActivePage("events"); setCurrentView("browse"); }} style={{ display: "flex", alignItems: "center", gap: "8px", background: activePage === "events" ? c.primaryContainer : "transparent", border: "none", cursor: "pointer", color: activePage === "events" ? c.primary : c.onSurfaceVariant, fontWeight: activePage === "events" ? "700" : "500", fontSize: "clamp(15px, 1.2vw, 17px)", padding: "12px 24px", borderRadius: 40, transition: "all 0.2s" }}>
              <Icon name="event" size={22} /> Events
            </button>
            <button onClick={() => { setActivePage("groups"); setCurrentView("browse"); }} style={{ display: "flex", alignItems: "center", gap: "8px", background: activePage === "groups" ? c.primaryContainer : "transparent", border: "none", cursor: "pointer", color: activePage === "groups" ? c.primary : c.onSurfaceVariant, fontWeight: activePage === "groups" ? "700" : "500", fontSize: "clamp(15px, 1.2vw, 17px)", padding: "12px 24px", borderRadius: 40, transition: "all 0.2s" }}>
              <Icon name="groups" size={22} /> Groups
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container takes full fluid width without a strict MaxWidth lock */}
      <main style={{ width: "100%", padding: "clamp(24px, 4vw, 48px)", margin: "0 auto" }}>
        {activePage === "events" ? (
          <>
            {currentView !== "details" && (
              <div className="nav-tab-container" style={{ borderBottom: `1px solid ${c.outlineVariant}`, marginBottom: "clamp(24px, 3vw, 40px)", display: "flex", gap: 12 }}>
                <button className={`nav-tab ${currentView === "browse" ? "active" : ""}`} onClick={() => setCurrentView("browse")}>Browse Events</button>
                <button className={`nav-tab ${currentView === "my-events" ? "active" : ""}`} onClick={() => setCurrentView("my-events")}>My Events {joinedEvents.length > 0 && `(${joinedEvents.length})`}</button>
              </div>
            )}
            
            {currentView === "browse" && (
              <div className="event-grid">
                {EVENTS.map((event) => (
                  <EventCard key={event.id} event={event} isJoined={joinedEvents.includes(event.id)} onToggleJoin={toggleJoinEvent} onViewDetails={openDetails} />
                ))}
              </div>
            )}
            
            {currentView === "details" && activeEvent && (
              <EventDetails event={activeEvent} isJoined={joinedEvents.includes(activeEvent.id)} onToggleJoin={toggleJoinEvent} onBack={() => setCurrentView("browse")} />
            )}
            
            {currentView === "my-events" && (
              <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%" }}>
                <div style={{ marginBottom: "clamp(24px, 3vw, 36px)" }}>
                  <h2 style={{ fontSize: "clamp(26px, 2.5vw, 36px)", color: c.onSurface, marginBottom: 8, fontWeight: 600 }}>Your Events</h2>
                  <p style={{ color: c.onSurfaceVariant, fontSize: "clamp(15px, 1.2vw, 18px)" }}>{myJoinedEventsList.length} event{myJoinedEventsList.length !== 1 ? 's' : ''} joined</p>
                </div>
                {myJoinedEventsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "clamp(48px, 6vw, 80px) 24px", background: c.surface, borderRadius: 24, border: `1px solid ${c.outlineVariant}` }}>
                    <Icon name="celebration" size={64} style={{ color: c.neutral, marginBottom: 20 }} />
                    <h3 style={{ color: c.onSurface, marginBottom: 16, fontSize: "clamp(20px, 2vw, 26px)" }}>No events joined yet</h3>
                    <p style={{ color: c.onSurfaceVariant, marginBottom: 32, fontSize: "clamp(15px, 1.2vw, 18px)" }}>Browse events and join the ones you like!</p>
                    <button onClick={() => setCurrentView("browse")} style={{ padding: "14px 32px", background: c.primary, color: c.onPrimary, border: "none", borderRadius: 40, fontSize: "clamp(15px, 1.2vw, 17px)", fontWeight: 600, cursor: "pointer" }}>Browse Events</button>
                  </div>
                ) : (
                  myJoinedEventsList.map((event) => (
                    <JoinedEventPost key={event.id} event={event} onLeave={toggleJoinEvent} onViewDetails={openDetails} />
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "clamp(60px, 8vw, 120px) 24px", background: c.surface, borderRadius: 24, border: `1px solid ${c.outlineVariant}`, maxWidth: 800, margin: "0 auto" }}>
            <Icon name="groups" size={80} style={{ color: c.neutral, marginBottom: 24 }} />
            <h3 style={{ fontSize: "clamp(24px, 2vw, 32px)", color: c.onSurface, marginBottom: 16 }}>Groups Coming Soon</h3>
            <p style={{ color: c.onSurfaceVariant, fontSize: "clamp(16px, 1.3vw, 20px)" }}>Stay tuned for community groups and discussions.</p>
          </div>
        )}
      </main>
    </div>
  );
}