import { useState, useEffect } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const c = {
  primary: "#003634",
  primaryContainer: "#1e4d4b",
  primaryFixed: "#bcece8",
  primaryFixedDim: "#a0cfcc",
  onPrimaryContainer: "#8ebdba",
  onPrimary: "#ffffff",
  secondary: "#80543f",
  secondaryContainer: "#fdc2a8",
  onSecondaryContainer: "#794d39",
  tertiaryFixed: "#ffdbcc",
  tertiaryFixedDim: "#f4baa0",
  onTertiaryFixedVariant: "#653d2a",
  tertiaryContainer: "#643c29",
  surface: "#f9f9f9",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f3f3f3",
  surfaceContainerHigh: "#e8e8e8",
  surfaceContainerHighest: "#e2e2e2",
  surfaceContainer: "#eeeeee",
  onSurface: "#1a1c1c",
  onSurfaceVariant: "#404848",
  outlineVariant: "#c0c8c7",
  outline: "#707978",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
};

// ── Static data ───────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { icon: "dashboard", label: "Dashboard", active: false },
  { icon: "calendar_today", label: "Events", active: true },
  { icon: "groups", label: "Community", active: false },
];

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Book Donation Drive",
    date: "Oct 12, 2024 • 10:00 AM",
    locationIcon: "location_on",
    location: "Central Library Courtyard",
    status: "Active",
    statusStyle: { background: "rgba(0,54,52,0.88)", color: "#fff" },
    footer: "avatars",
    avatars: [
      { initials: "JD", bg: c.surfaceContainerHigh, fg: c.onSurface },
      { initials: "MK", bg: c.secondaryContainer, fg: c.onSecondaryContainer },
      { initials: "+12", bg: c.primaryFixed, fg: c.primary },
    ],
    footerNote: null,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCEQPcc7-IN0jRtPB1YJ2csY2K9j0LGR6Rc4ChA0HibIHsEnwjsIK3mbecraUJaOWhr86Ukc1HQ2Q52_ohdq_-lfhHXpF2zKDr1HyN8Tvqs8p5xsOQTwnjJ56bGiimA5CZPEhBl4-PfWevPaTGU1CxoRSluvP1X7-T2MUuDQISGzsIjZKAi1IraYBmm2lXJ_fVTZzHUvv7d1MmJT2w1Oev-Q4EqLv1LSZLbLQ6syaoJThhw4w67calEH0ZpU-hoBV5Wub_UfcPwBbU",
  },
  {
    id: 2,
    title: "Volunteer Training",
    date: "Oct 15, 2024 • 2:00 PM",
    locationIcon: "videocam",
    location: "Online (Zoom Meeting)",
    status: "Upcoming",
    statusStyle: { background: c.secondary, color: "#fff" },
    footer: "note",
    avatars: [],
    footerNote: { text: "45 Participants Registered", color: c.onSurfaceVariant },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwB_AKpn5Bo6Tr33Ccw0k5wIVf_Hsx8IVkSGSDa1-A01wnen9yc57b8I8Pcp3xKZ9R7ojXa8PpjOcOGmpYeKBj4OoHEFU5bwy21-L-UpJuGcSSyGtMod8MOOcrd0YQjgpHfHhfaisDRNIc1fx3f83-jPa_ED77lrn9N3JX0-DF9hl5HrnrzDF1322kKuuy8Q_0t37UK0j_mjzvzk4GSvbqvge5Wr1NqiSd87G0G5bju5l_gtt-T4D5J4bsDG9Q1ra1E0ZBLqzQ6epI",
  },
  {
    id: 3,
    title: "Winter Literary Gala",
    date: "Dec 05, 2024 • 7:00 PM",
    locationIcon: "location_on",
    location: "Grand Hall, West Wing",
    status: "Draft",
    statusStyle: { background: c.outline, color: "#fff" },
    footer: "note",
    avatars: [],
    footerNote: { text: "Missing Venue Details", color: c.error },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9Qr15edVAC-wCqQhKoyktELcFkY3DB1WCPobmmqts4IfD5t7swtnbt2zKi-ALN0AullfUp6Tm9vSY06GphKJoC-8J95BiKOb2fzgHeWulkzmUnkEcdvqDRvL9Om-8tPXS0_ScxImVnMLRDJzPQ0Fhc6P_XnpYiSMFH3NaObJIrtNsk6Uc_ZoTfxPEhfkv7Pjfw6puE6af8zScXpJrCXIqrwf9HrJ2VGv4iDry_IQnfsUJQ6coARlmP-8XOgTZ4qFDnPXn66kDL-Yt",
  },
  {
    id: 4,
    title: "Community Story Swap",
    date: "Oct 28, 2024 • 11:30 AM",
    locationIcon: "location_on",
    location: "Public Library Plaza",
    status: "Active",
    statusStyle: { background: "rgba(0,54,52,0.88)", color: "#fff" },
    footer: "avatars",
    avatars: [
      { initials: "AA", bg: c.tertiaryFixed, fg: c.onTertiaryFixedVariant },
      { initials: "BL", bg: c.primaryFixedDim, fg: c.primary },
    ],
    footerNote: null,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY1GU2f6F51gKlGfzZnwF9unuNpMChU3OOLE_qbF9NQbw8CgotAT-_1ba2WoOFYHlgxFQsGKBa7mQeAfxPy0GkuIUt1oAqtdTGRw5b-uuh4KAK0Ciyjz8DCSFA02T8NtdanoOYFu22Gm7o6O_dqtYD_moPhlKIeLzAbdVzIZdt1RkCqF-eh60RG1XIOATweNgQQkQDwDqa7EPwUROazd8hBJGSR7fe03FbYRcKBGEPNp5-oyWHppXWjBk0GU2CSoUuBTJRtlozm2CB",
  },
];

// ── Icon helper ───────────────────────────────────────────────────────────────
function Icon({ name, size = 24, style = {} }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1, verticalAlign: "middle", userSelect: "none", ...style }}
    >
      {name}
    </span>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose, isMd }) {
  return (
    <>
      {!isMd && open && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }}
        />
      )}
      <aside
        style={{
          position: "fixed",
          left: 0, top: 0,
          height: "100%",
          width: 260,
          background: c.surfaceContainerLow,
          borderRight: `1px solid ${c.outlineVariant}`,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          transform: isMd || open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24, fontWeight: 600,
            color: c.primary,
            marginBottom: 40, paddingLeft: 16,
          }}
        >
          Libris Admin
        </h1>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href="#"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                borderRadius: 4,
                fontWeight: link.active ? 700 : 400,
                color: link.active ? c.primary : c.onSurfaceVariant,
                background: link.active ? c.surfaceContainer : "transparent",
                borderRight: link.active ? `4px solid ${c.primary}` : "4px solid transparent",
                opacity: link.active ? 1 : 0.7,
                fontSize: 14,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
            >
              <Icon name={link.icon} />
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}

// ── Event card ────────────────────────────────────────────────────────────────
function EventCard({ event, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: c.surfaceContainerLowest,
        border: `1px solid ${c.outlineVariant}`,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.3s",
        boxShadow: hovered ? "0 10px 30px -6px rgba(0,0,0,0.12)" : "none",
      }}
    >
      {/* Image */}
      <div
        style={{ position: "relative", height: 192, overflow: "hidden" }}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        <img
          src={event.image}
          alt={event.title}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: imgHovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        <span
          style={{
            position: "absolute", top: 16, left: 16,
            padding: "4px 12px",
            borderRadius: 40,
            fontSize: 12,
            fontWeight: 500,
            backdropFilter: "blur(4px)",
            ...event.statusStyle,
          }}
        >
          {event.status}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24, fontWeight: 600,
            color: c.onSurface,
            marginBottom: 12,
            lineHeight: "32px",
          }}
        >
          {event.title}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: c.onSurfaceVariant }}>
            <Icon name="calendar_today" size={18} />
            <span style={{ fontSize: 14 }}>{event.date}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: c.onSurfaceVariant }}>
            <Icon name={event.locationIcon} size={18} />
            <span style={{ fontSize: 14 }}>{event.location}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 16,
            borderTop: `1px solid ${c.outlineVariant}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left side */}
          {event.footer === "avatars" ? (
            <div style={{ display: "flex", marginLeft: 4 }}>
              {event.avatars.map((av, i) => (
                <div
                  key={i}
                  style={{
                    width: 32, height: 32,
                    borderRadius: "50%",
                    border: `2px solid ${c.surfaceContainerLowest}`,
                    background: av.bg,
                    color: av.fg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700,
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: event.avatars.length - i,
                    position: "relative",
                  }}
                >
                  {av.initials}
                </div>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 500, color: event.footerNote?.color }}>
              {event.footerNote?.text}
            </span>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 4 }}>
            <IconBtn
              icon="edit"
              title="Edit"
              fg={c.tertiaryContainer}
              hoverBg={c.tertiaryFixed}
              onClick={() => onEdit(event)}
            />
            <IconBtn
              icon="delete"
              title="Delete"
              fg={c.error}
              hoverBg={c.errorContainer}
              onClick={() => onDelete(event.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ icon, title, fg, hoverBg, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 8,
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        background: hovered ? hoverBg : "transparent",
        color: fg,
        display: "flex",
        transition: "background 0.15s",
      }}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

// ── Add-new placeholder card ───────────────────────────────────────────────────
function AddEventCard({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: c.surfaceContainerLow,
        border: `2px dashed ${hovered ? c.primary : c.outlineVariant}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
        padding: 32,
        textAlign: "center",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
    >
      <div
        style={{
          width: 64, height: 64,
          borderRadius: "50%",
          background: hovered ? c.primaryContainer : c.surfaceContainerHighest,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16,
          transition: "background 0.2s",
        }}
      >
        <Icon name="post_add" size={32} style={{ color: hovered ? c.onPrimaryContainer : c.onSurfaceVariant }} />
      </div>
      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 24, fontWeight: 600,
          color: c.onSurface, marginBottom: 4,
        }}
      >
        Add New Event
      </h3>
      <p style={{ fontSize: 14, color: c.onSurfaceVariant }}>
        Plan your next collection or workshop
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EventManagement() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => { setIsMd(e.matches); if (e.matches) setSidebarOpen(false); };
    setIsMd(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleDelete = (id) => {
    const event = events.find((e) => e.id === id);
    if (window.confirm(`Delete "${event?.title}"? This cannot be undone.`)) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleEdit = (event) => alert(`Edit "${event.title}" (simulated)`);
  const handleCreate = () => alert("Create new event (simulated)");

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f5f5; font-family: 'Inter', sans-serif; min-height: 100dvh; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
        }
        .event-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) { .event-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .event-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isMd={isMd} />

      <main
        style={{
          marginLeft: isMd ? 260 : 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#f5f5f5",
        }}
      >
        {/* Header */}
        <header
          style={{
            position: "sticky", top: 0, zIndex: 40,
            background: c.surface,
            borderBottom: `1px solid ${c.outlineVariant}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 64,
            padding: "0 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {!isMd && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: c.primary }}
              >
                <Icon name="menu" />
              </button>
            )}
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 24, fontWeight: 700,
                color: c.primary,
              }}
            >
              Events
            </h2>
          </div>
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: c.primaryFixed,
              border: `1px solid ${c.outlineVariant}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: c.primary, fontWeight: 700, fontSize: 14,
              cursor: "pointer",
            }}
          >
            A
          </div>
        </header>

        {/* Body */}
        <section style={{ padding: "20px 24px", maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          {/* Page heading row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  color: c.secondary, marginBottom: 4,
                }}
              >
                Event management
              </p>
              <h3
                style={{
                  fontSize: 24, fontWeight: 700,
                  color: c.primary,
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "-0.01em",
                }}
              >
                Manage events
              </h3>
            </div>

            <CreateButton onClick={handleCreate} />
          </div>

          {/* Event grid */}
          <div className="event-grid">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
            <AddEventCard onClick={handleCreate} />
          </div>
        </section>
      </main>
    </>
  );
}

function CreateButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: c.primaryContainer,
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 24px",
        fontSize: 14, fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        filter: hovered ? "brightness(1.12)" : "brightness(1)",
        transition: "filter 0.15s",
      }}
    >
      <Icon name="add" size={20} style={{ color: "#fff" }} />
      Create New Event
    </button>
  );
}
