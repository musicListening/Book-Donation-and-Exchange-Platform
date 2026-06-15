import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Token system (mirrors the original Tailwind config) ──────────────────────
const colors = {
  primary: "#003634",
  primaryContainer: "#1e4d4b",
  primaryFixed: "#bcece8",
  onPrimaryContainer: "#8ebdba",
  secondary: "#80543f",
  secondaryContainer: "#fdc2a8",
  onSecondaryContainer: "#794d39",
  tertiaryFixed: "#ffdbcc",
  tertiaryContainer: "#643c29",
  onTertiaryContainer: "#dfa88f",
  tertiary: "#4a2615",
  surface: "#f9f9f9",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f3f3f3",
  surfaceContainerHigh: "#e8e8e8",
  surfaceContainer: "#eeeeee",
  onSurface: "#1a1c1c",
  onSurfaceVariant: "#404848",
  outlineVariant: "#c0c8c7",
  error: "#ba1a1a",
  onPrimary: "#ffffff",
};

// ── Static data ───────────────────────────────────────────────────────────────
const metrics = [
  {
    icon: "person",
    label: "Total Users",
    value: "2,847",
    sub: "+12% vs last month",
    subIcon: "trending_up",
    bg: colors.primaryFixed,
    fg: colors.primary,
  },
  {
    icon: "event_available",
    label: "Events This Month",
    value: "14",
    sub: "3 upcoming this week",
    subIcon: "calendar_month",
    bg: colors.tertiaryFixed,
    fg: colors.tertiary,
  },
  {
    icon: "groups",
    label: "Active Hubs",
    value: "42",
    sub: "4 new this phase",
    subIcon: "rocket_launch",
    bg: colors.secondaryContainer,
    fg: colors.onSecondaryContainer,
  },
];

const events = [
  {
    id: 1,
    category: "Workshop",
    date: "Oct 24, 2023",
    title: "Community Storytelling Night",
    description: "An evening dedicated to sharing personal narratives from local community members.",
    headerBg: colors.primaryContainer,
    headerFg: colors.onPrimaryContainer,
    icon: "event_note",
  },
  {
    id: 2,
    category: "Fundraiser",
    date: "Nov 02, 2023",
    title: "Winter Book Fair Drive",
    description: "Annual collection of children's literature for local primary school libraries.",
    headerBg: colors.tertiaryContainer,
    headerFg: colors.onTertiaryContainer,
    icon: "menu_book",
  },
  {
    id: 3,
    category: "Social",
    date: "Nov 15, 2023",
    title: "Librarian Coffee Chat",
    description: "Networking morning for local archivists and library volunteers.",
    headerBg: colors.secondaryContainer,
    headerFg: colors.onSecondaryContainer,
    icon: "group",
  },
];

const navLinks = [
  { icon: "dashboard", label: "Dashboard", active: true, path: "/community-admin/dashboard" },
  { icon: "calendar_today", label: "Events", active: false, path: "/community-admin/events" },
  { icon: "groups", label: "Community", active: false, path: "/community-admin/messages" },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function Icon({ name, size = 24, style = {} }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1, ...style }}
    >
      {name}
    </span>
  );
}

function MetricCard({ icon, label, value, sub, subIcon, bg, fg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.surfaceContainerLowest,
        border: `1px solid #E5E5E5`,
        borderRadius: 8,
        padding: 20,
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02)"
          : "none",
      }}
    >
      <div
        style={{
          padding: 12,
          borderRadius: "50%",
          background: bg,
          color: fg,
          flexShrink: 0,
          display: "flex",
        }}
      >
        <Icon name={icon} size={24} />
      </div>
      <div>
        <p
          style={{
            fontSize: 12,
            color: colors.onSurfaceVariant,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 2,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: 32,
            fontWeight: 700,
            lineHeight: "40px",
            color: colors.primary,
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {value}
        </p>
        <span
          style={{
            fontSize: 12,
            color: colors.secondary,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
          }}
        >
          <Icon name={subIcon} size={14} />
          {sub}
        </span>
      </div>
    </div>
  );
}

function EventCard({ event, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.surfaceContainerLowest,
        border: "1px solid #E5E5E5",
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 10px 25px -5px rgba(0,0,0,0.05)"
          : "none",
      }}
    >
      {/* Card header */}
      <div
        style={{
          height: 128,
          background: event.headerBg,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={event.icon} size={48} style={{ color: event.headerFg, opacity: 0.5 }} />
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            gap: 4,
          }}
        >
          <button
            onClick={() => onEdit(event)}
            style={{
              width: 32, height: 32, borderRadius: 4,
              background: "rgba(255,255,255,0.9)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: colors.primary,
            }}
          >
            <Icon name="edit" size={16} />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            style={{
              width: 32, height: 32, borderRadius: 4,
              background: "rgba(255,255,255,0.9)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: colors.error,
            }}
          >
            <Icon name="delete" size={16} />
          </button>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: colors.secondary,
            }}
          >
            {event.category}
          </span>
          <span style={{ fontSize: 12, color: colors.onSurfaceVariant, fontWeight: 500 }}>
            {event.date}
          </span>
        </div>
        <h4
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.onSurface,
            marginBottom: 8,
            lineHeight: "20px",
          }}
        >
          {event.title}
        </h4>
        <p
          style={{
            fontSize: 14,
            color: colors.onSurfaceVariant,
            lineHeight: "20px",
            flex: 1,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {event.description}
        </p>
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${colors.outlineVariant}`,
          }}
        />
      </div>
    </div>
  );
}

function Sidebar({ open, onClose, navigate }) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 40,
          display: open ? "block" : "none",
        }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: "fixed",
          left: 0, top: 0,
          height: "100%",
          width: 260,
          background: colors.surfaceContainerLow,
          borderRight: `1px solid ${colors.outlineVariant}`,
          zIndex: 50,
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 600,
            color: colors.primary,
            marginBottom: 40,
            paddingLeft: 16,
          }}
        >
          Community Admin
        </h1>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              onClick={(e) => {
                e.preventDefault();
                navigate(link.path);
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                textDecoration: "none",
                borderRadius: 4,
                fontWeight: link.active ? 700 : 400,
                color: link.active ? colors.primary : colors.onSurfaceVariant,
                background: link.active ? colors.surfaceContainer : "transparent",
                borderRight: link.active ? `4px solid ${colors.primary}` : "4px solid transparent",
                opacity: link.active ? 1 : 0.7,
                fontSize: 14,
                lineHeight: "16px",
                transition: "background 0.15s",
                cursor: "pointer",
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

// ── Main component ────────────────────────────────────────────────────────────
export default function LibrisDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const [eventList, setEventList] = useState(events);

  // Responsive breakpoint watcher
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

  const handleDelete = (id) => setEventList((prev) => prev.filter((e) => e.id !== id));
  const handleEdit = (event) => alert(`Edit: ${event.title}`);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F5F5F5; font-family: 'Inter', sans-serif; }
        a { text-decoration: none; }

        /* Permanent sidebar on md+ */
        @media (min-width: 768px) {
          #sidebar-permanent { display: flex !important; }
        }

        /* Event grid */
        .event-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .event-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .event-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* Metric grid */
        .metric-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .metric-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .metric-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* ── Permanent sidebar (md+) ─────────────────────── */}
      <aside
        id="sidebar-permanent"
        style={{
          display: "none",
          position: "fixed",
          left: 0, top: 0,
          height: "100%",
          width: 260,
          background: colors.surfaceContainerLow,
          borderRight: `1px solid ${colors.outlineVariant}`,
          zIndex: 50,
          flexDirection: "column",
          padding: "24px 16px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 600,
            color: colors.primary,
            marginBottom: 40,
            paddingLeft: 16,
          }}
        >
          Community Admin
        </h1>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              onClick={(e) => {
                e.preventDefault();
                navigate(link.path);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 4,
                fontWeight: link.active ? 700 : 400,
                color: link.active ? colors.primary : colors.onSurfaceVariant,
                background: link.active ? colors.surfaceContainer : "transparent",
                borderRight: link.active ? `4px solid ${colors.primary}` : "4px solid transparent",
                opacity: link.active ? 1 : 0.7,
                fontSize: 14,
                lineHeight: "16px",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
            >
              <Icon name={link.icon} />
              {link.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* ── Mobile drawer ───────────────────────────────── */}
      {!isMd && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} />}

      {/* ── Main content ────────────────────────────────── */}
      <main
        style={{
          marginLeft: isMd ? 260 : 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#F5F5F5",
        }}
      >
        {/* Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: colors.surface,
            borderBottom: `1px solid ${colors.outlineVariant}`,
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
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 8,
                  color: colors.onSurface,
                  display: "flex",
                }}
              >
                <Icon name="menu" />
              </button>
            )}
            
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 24,
                fontWeight: 700,
                color: colors.primary,
              }}
            >
              Dashboard
            </h2>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              color: colors.error,
              display: "flex",
              alignItems: "center",
              gap: 4,
              borderRadius: 4,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ffe9e9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Icon name="logout" size={20} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Logout</span>
          </button>
        </header>

        {/* Body */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Metric cards */}
          <div className="metric-grid">
            {metrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>

          {/* Upcoming Events */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 24,
                  fontWeight: 600,
                  color: colors.primary,
                }}
              >
                Upcoming Events
              </h3>
              <button
                style={{
                  background: colors.primary,
                  color: colors.onPrimary,
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Icon name="add" size={16} />
                Create Event
              </button>
            </div>

            <div className="event-grid">
              {eventList.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer
          style={{
            marginTop: "auto",
            padding: "32px 20px",
            textAlign: "center",
            borderTop: `1px solid ${colors.outlineVariant}`,
            background: colors.surfaceContainerLowest,
          }}
        >
          <p style={{ fontSize: 14, color: `${colors.onSurfaceVariant}99` }}>
            © 2023 Community Admin Ecosystem. All rights reserved.
          </p>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 24 }}>
            {["System Status", "Terms of Service", "Privacy Policy"].map((link) => (
              <a
                key={link}
                href="#"
                style={{ fontSize: 12, color: colors.onSurfaceVariant, transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = colors.onSurfaceVariant)}
              >
                {link}
              </a>
            ))}
          </div>
        </footer>
      </main>
    </>
  );
}