import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Token system with MORE GREEN & WHITE SIDEBAR TEXT ─────────────────────────
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

// ✅ ADD THIS - Sidebar Colors (FIXED)
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

// ── MOCK DATA (Replace with your API calls) ───────────────────────────────────
const fetchDashboardStats = () => {
  return {
    totalUsers: 2847,
    totalEventsThisMonth: 14,
    totalMessagesToday: 8,
    usersTrend: "+12% vs last month",
    eventsTrend: "3 upcoming this week",
    messagesTrend: "Mostly event inquiries",
  };
};

// Sample events data (sorted by date - latest first)
const getAllEvents = () => [
  {
    id: 1,
    category: "Workshop",
    date: "2024-03-25",
    formattedDate: "Mar 25, 2024",
    title: "Community Storytelling Night",
    description: "An evening dedicated to sharing personal narratives from local community members.",
    headerBg: colors.primaryContainer,
    headerFg: colors.onPrimaryContainer,
    icon: "event_note",
  },
  {
    id: 2,
    category: "Fundraiser",
    date: "2024-03-20",
    formattedDate: "Mar 20, 2024",
    title: "Winter Book Fair Drive",
    description: "Annual collection of children's literature for local primary school libraries.",
    headerBg: colors.tertiaryContainer,
    headerFg: colors.onTertiaryContainer,
    icon: "menu_book",
  },
  {
    id: 3,
    category: "Social",
    date: "2024-03-28",
    formattedDate: "Mar 28, 2024",
    title: "Librarian Coffee Chat",
    description: "Networking morning for local archivists and library volunteers.",
    headerBg: colors.secondaryContainer,
    headerFg: colors.onSecondaryContainer,
    icon: "group",
  },
  {
    id: 4,
    category: "Workshop",
    date: "2024-04-01",
    formattedDate: "Apr 1, 2024",
    title: "Digital Literacy Workshop",
    description: "Teaching essential digital skills to community members of all ages.",
    headerBg: colors.primaryContainer,
    headerFg: colors.onPrimaryContainer,
    icon: "computer",
  },
  {
    id: 5,
    category: "Volunteer",
    date: "2024-03-18",
    formattedDate: "Mar 18, 2024",
    title: "Park Cleanup Day",
    description: "Join us for a community-wide park restoration and cleanup event.",
    headerBg: colors.tertiaryContainer,
    headerFg: colors.onTertiaryContainer,
    icon: "cleaning_services",
  },
];

const navLinks = [
  { icon: "dashboard", label: "Dashboard", active: true, path: "/community-admin/dashboard" },
  { icon: "calendar_today", label: "Events", active: false, path: "/community-admin/events" },
  { icon: "forum", label: "Messages", active: false, path: "/community-admin/messages" },
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

// Metric Card with dynamic values
function MetricCard({ icon, label, value, sub, subIcon, bg, fg, trend }) {
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
      <div style={{ flex: 1 }}>
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
          {value.toLocaleString()}
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
          {trend || sub}
        </span>
      </div>
    </div>
  );
}

// SIMPLIFIED Event Card - NO EDIT/DELETE buttons
function EventCard({ event, isLatest = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.surfaceContainerLowest,
        border: isLatest ? `2px solid ${colors.primary}` : `1px solid ${colors.outlineVariant}`,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 10px 25px -5px rgba(0,0,0,0.05)"
          : "none",
        position: "relative",
      }}
    >
      {isLatest && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: colors.primary,
            color: colors.onPrimary,
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 600,
            zIndex: 2,
            letterSpacing: "0.5px",
          }}
        >
          LATEST
        </div>
      )}
      
      {/* Card header - NO buttons */}
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
            {event.formattedDate}
          </span>
        </div>
        <h4
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: colors.onSurface,
            marginBottom: 8,
            lineHeight: "22px",
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
      </div>
    </div>
  );
}

// Sidebar with WHITE TEXT and GREEN BACKGROUND
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
          width: 280,
          background: sidebarColors.background,
          borderRight: `1px solid ${sidebarColors.border}`,
          zIndex: 50,
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          display: "flex",
          flexDirection: "column",
          padding: "28px 20px",
        }}
      >
        <div style={{ marginBottom: 48, paddingLeft: 12 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 700,
              color: sidebarColors.text,
              marginBottom: 8,
              letterSpacing: "-0.5px",
            }}
          >
            Community Admin
          </h1>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
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
                gap: 14,
                padding: "12px 16px",
                textDecoration: "none",
                borderRadius: 10,
                fontWeight: link.active ? 600 : 400,
                color: link.active ? sidebarColors.text : "rgba(255, 255, 255, 0.7)",
                background: link.active ? sidebarColors.activeBackground : "transparent",
                borderLeft: link.active ? `3px solid ${colors.primaryFixed}` : "3px solid transparent",
                fontSize: 14,
                lineHeight: "20px",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!link.active) {
                  e.currentTarget.style.background = sidebarColors.hoverBackground;
                  e.currentTarget.style.color = sidebarColors.textHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!link.active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                }
              }}
            >
              <Icon name={link.icon} size={20} style={{ color: "inherit" }} />
              <span style={{ fontWeight: link.active ? 600 : 400 }}>{link.label}</span>
            </a>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ 
          marginTop: "auto", 
          paddingTop: 24, 
          borderTop: `1px solid ${sidebarColors.border}`,
        }}>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
              onClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 16px",
              width: "100%",
              background: "transparent",
              border: "none",
              borderRadius: 10,
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = sidebarColors.hoverBackground;
              e.currentTarget.style.color = sidebarColors.textHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
            }}
          >
            <Icon name="logout" size={20} style={{ color: "inherit" }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LibrisDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEventsThisMonth: 0,
    totalMessagesToday: 0,
  });

  // Load data on mount
  useEffect(() => {
    const dashboardStats = fetchDashboardStats();
    setStats(dashboardStats);
    
    const events = getAllEvents();
    const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
    setEventList(sortedEvents);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get latest 3 events for display
  const latestEvents = eventList.slice(0, 3);

  // Metric cards configuration with real values
  const metrics = [
    {
      icon: "person",
      label: "Total Registered Users",
      value: stats.totalUsers,
      sub: "Active community members",
      subIcon: "trending_up",
      bg: colors.primaryFixed,
      fg: colors.primary,
      trend: stats.usersTrend,
    },
    {
      icon: "event_available",
      label: "Total Events This Month",
      value: stats.totalEventsThisMonth,
      sub: stats.eventsTrend,
      subIcon: "calendar_month",
      bg: colors.tertiaryFixed,
      fg: colors.tertiary,
      trend: stats.eventsTrend,
    },
    {
      icon: "chat",
      label: "Total Messages Today",
      value: stats.totalMessagesToday,
      sub: stats.messagesTrend,
      subIcon: "sms",
      bg: colors.secondaryContainer,
      fg: colors.onSecondaryContainer,
      trend: stats.messagesTrend,
    },
  ];

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
        body { background: ${colors.surface}; font-family: 'Inter', sans-serif; }
        a { text-decoration: none; }

        @media (min-width: 768px) {
          #sidebar-permanent { display: flex !important; }
        }

        .event-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          padding-bottom: 20px;
        }
        @media (min-width: 768px) {
          .event-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .event-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .metric-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 640px) {
          .metric-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .metric-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .content-wrapper {
          flex: 1;
        }

        /* Hide scrollbar track - FIX */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent !important; border: none !important; }
        ::-webkit-scrollbar-thumb { background: ${colors.primaryContainer}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${colors.primary}; }
        * { scrollbar-width: thin; scrollbar-color: ${colors.primaryContainer} transparent; }
      `}</style>

      {/* ── PERMANENT SIDEBAR (md+) - WHITE TEXT ─────────────────────── */}
      <aside
        id="sidebar-permanent"
        style={{
          display: "none",
          position: "fixed",
          left: 0, top: 0,
          height: "100%",
          width: 280,
          background: sidebarColors.background,
          borderRight: `1px solid ${sidebarColors.border}`,
          zIndex: 50,
          flexDirection: "column",
          padding: "28px 20px",
        }}
      >
        <div style={{ marginBottom: 48, paddingLeft: 12 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 700,
              color: sidebarColors.text,
              marginBottom: 8,
              letterSpacing: "-0.5px",
            }}
          >
            Community Admin
          </h1>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
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
                gap: 14,
                padding: "12px 16px",
                borderRadius: 10,
                fontWeight: link.active ? 600 : 400,
                color: link.active ? sidebarColors.text : "rgba(255, 255, 255, 0.7)",
                background: link.active ? sidebarColors.activeBackground : "transparent",
                borderLeft: link.active ? `3px solid ${colors.primaryFixed}` : "3px solid transparent",
                fontSize: 14,
                lineHeight: "20px",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!link.active) {
                  e.currentTarget.style.background = sidebarColors.hoverBackground;
                  e.currentTarget.style.color = sidebarColors.textHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!link.active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                }
              }}
            >
              <Icon name={link.icon} size={20} style={{ color: "inherit" }} />
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        <div style={{ 
          marginTop: "auto", 
          paddingTop: 24, 
          borderTop: `1px solid ${sidebarColors.border}`,
        }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 16px",
              width: "100%",
              background: "transparent",
              border: "none",
              borderRadius: 10,
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = sidebarColors.hoverBackground;
              e.currentTarget.style.color = sidebarColors.textHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
            }}
          >
            <Icon name="logout" size={20} style={{ color: "inherit" }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile drawer ───────────────────────────────── */}
      {!isMd && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} />}

      {/* ── Main content ────────────────────────────────── */}
      <main
        style={{
          marginLeft: isMd ? 280 : 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: colors.surface,
          border: "none",
          outline: "none",
        }}
      >
        {/* Header - SIMPLIFIED with no welcome text */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: colors.surfaceContainerLowest,
            borderBottom: `1px solid ${colors.outlineVariant}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 70,
            padding: "0 28px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {!isMd && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 8,
                  color: colors.primary,
                  display: "flex",
                  borderRadius: 8,
                }}
              >
                <Icon name="menu" size={24} />
              </button>
            )}
            
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 700,
                color: colors.primary,
              }}
            >
              Dashboard
            </h2>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: colors.primaryFixed,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.primary,
              fontWeight: 600,
            }}>
              <Icon name="person" size={20} />
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="content-wrapper" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 36 }}>
          {/* Metric cards */}
          <div className="metric-grid">
            {metrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>

          {/* Latest Events Section - NO CREATE button */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 26,
                    fontWeight: 600,
                    color: colors.primary,
                  }}
                >
                  Latest Events
                </h3>
                <p style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 }}>
                  Most recent community gatherings ({latestEvents.length} events)
                </p>
              </div>
            </div>

            <div className="event-grid">
              {latestEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isLatest={index === 0}
                />
              ))}
            </div>

            {/* Show message if no events */}
            {latestEvents.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: 60,
                background: colors.surfaceContainerLowest,
                borderRadius: 12,
                border: `1px solid ${colors.outlineVariant}`,
              }}>
                <Icon name="event_busy" size={48} style={{ color: colors.onSurfaceVariant, opacity: 0.5 }} />
                <p style={{ marginTop: 16, color: colors.onSurfaceVariant }}>
                  No events found.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer
          style={{
            flexShrink: 0,
            padding: "28px 32px",
            textAlign: "center",
            borderTop: "1px solid #e0e0e0",
            background: colors.surfaceContainerLowest,
          }}
        >
          <p style={{ fontSize: 13, color: `${colors.onSurfaceVariant}CC` }}>
            © 2024 Community Admin Ecosystem — Growing together, sustainably.
          </p>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 28 }}>
            {["System Status", "Terms of Service", "Privacy Policy"].map((link) => (
              <a
                key={link}
                href="#"
                style={{ fontSize: 12, color: colors.onSurfaceVariant, transition: "color 0.2s", textDecoration: "none" }}
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