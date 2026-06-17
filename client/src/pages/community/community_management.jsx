import { useState, useEffect } from "react";

// ============================================================
// COLOR TOKENS (Green Planet + White Sidebar Text - SAME AS DASHBOARD)
// ============================================================
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
  onErrorContainer: "#93000A",
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

// ============================================================
// INITIAL MESSAGES DATA
// ============================================================
const INITIAL_MESSAGES = [
  {
    id: 1,
    user: "Julianne Devis",
    avatar: "JD",
    content: "This book donation drive is a joke. I've been waiting for three weeks and nobody has picked up my box. Extremely frustrated with the service here! #BadService",
    posted: "Oct 15, 2024, 10:32 AM",
    status: "flagged",
    statusLabel: "Flagged: Profanity",
  },
  {
    id: 2,
    user: "Marcus Rivera",
    avatar: "MR",
    content: "Does anyone have a copy of 'The Shadow of the Wind'? I'm looking to complete my collection and would love to trade some of my historical fiction pieces for it.",
    posted: "Oct 15, 2024, 10:20 AM",
    status: "regular",
    statusLabel: "Regular Post",
  },
  {
    id: 3,
    user: "Unknown Account #552",
    avatar: "?",
    content: "CLICK HERE FOR FREE BOOK VOUCHERS AND AMAZON GIFTCARDS!!! http://bit.ly/fake-link-moderation-needed-fast-now",
    posted: "Oct 15, 2024, 9:15 AM",
    status: "spam",
    statusLabel: "Spam Detected",
  },
  {
    id: 4,
    user: "Sarah Higgins",
    avatar: "SH",
    content: "I just finished reading 'The Great Gatsby' for the tenth time. Every time I find something new. Is there a book club meeting this Friday to discuss classic literature?",
    posted: "Oct 15, 2024, 7:45 AM",
    status: "regular",
    statusLabel: "Regular Post",
  },
  {
    id: 5,
    user: "Elena Wong",
    avatar: "EW",
    content: "The children's reading hour was magical yesterday! Thank you to all volunteers. 📚✨",
    posted: "Oct 14, 2024, 6:12 PM",
    status: "regular",
    statusLabel: "Regular Post",
  },
  {
    id: 6,
    user: "Daniel Park",
    avatar: "DP",
    content: "Is the library open during the holiday break? I need to return some rare manuscripts.",
    posted: "Oct 14, 2024, 2:05 PM",
    status: "regular",
    statusLabel: "Regular Post",
  },
];

// ============================================================
// HELPER COMPONENTS
// ============================================================
function Icon({ name, size = 24, style = {} }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: size, lineHeight: 1, ...style }}>
      {name}
    </span>
  );
}

function Badge({ status, label }) {
  const styles = {
    flagged: { background: colors.errorContainer, color: colors.onErrorContainer, border: `1px solid ${colors.errorContainer}` },
    spam: { background: colors.error, color: "#fff", border: `1px solid ${colors.error}` },
    regular: { background: colors.surfaceContainer, color: colors.onSurfaceVariant, border: `1px solid ${colors.outlineVariant}` },
    approved: { background: colors.primaryFixed, color: colors.primary, border: `1px solid ${colors.primaryFixed}` },
  };
  const s = styles[status] || styles.regular;
  return (
    <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 40, fontSize: 11, fontWeight: 600, ...s }}>
      {label}
    </span>
  );
}

// Message Card Component
function MessageCard({ msg, onDelete, onApprove, onReply, removing }) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const statusBg = {
    flagged: "linear-gradient(135deg, rgba(255,218,214,0.3) 0%, rgba(255,218,214,0.1) 100%)",
    spam: "linear-gradient(135deg, rgba(186,26,26,0.05) 0%, rgba(186,26,26,0.02) 100%)",
    regular: "transparent",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMenuOpen(false);
      }}
      style={{
        background: statusBg[msg.status] || "transparent",
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: 16,
        padding: 20,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.28s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02)"
          : "none",
        opacity: removing ? 0 : 1,
        position: "relative",
      }}
    >
      {hovered && (
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: colors.surfaceContainerLowest,
              border: `1px solid ${colors.outlineVariant}`,
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: colors.onSurfaceVariant,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <Icon name="more_vert" size={18} />
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: 40,
                right: 0,
                background: colors.surfaceContainerLowest,
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                overflow: "hidden",
                zIndex: 20,
                border: `1px solid ${colors.outlineVariant}`,
                minWidth: 140,
              }}
            >
              <button
                onClick={() => {
                  onReply(msg);
                  setMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: colors.onSurface,
                  fontSize: 13,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceContainerLow)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Icon name="reply" size={18} /> Reply
              </button>
              <button
                onClick={() => {
                  onApprove(msg.id);
                  setMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: colors.primary,
                  fontSize: 13,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceContainerLow)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Icon name="check_circle" size={18} /> Approve
              </button>
              <button
                onClick={() => {
                  onDelete(msg.id, msg.user);
                  setMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: colors.error,
                  fontSize: 13,
                  transition: "background 0.2s",
                  borderTop: `1px solid ${colors.outlineVariant}`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.errorContainer)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Icon name="delete" size={18} /> Delete
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: colors.primaryFixed,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.primary,
            fontWeight: 600,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {msg.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: colors.onSurface, fontSize: 16 }}>{msg.user}</span>
            <Badge status={msg.status} label={msg.statusLabel} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: colors.onSurfaceVariant, fontSize: 12 }}>
            <Icon name="schedule" size={14} />
            <span>{msg.posted}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "12px 0 8px 0",
          color: msg.status === "spam" ? colors.error : colors.onSurface,
          fontSize: 14,
          lineHeight: 1.55,
          borderTop: `1px solid ${colors.outlineVariant}`,
          marginTop: 4,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <Icon name="format_quote" size={18} style={{ color: colors.outlineVariant, flexShrink: 0 }} />
          <p style={{ margin: 0, flex: 1, wordBreak: "break-word" }}>{msg.content}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16, paddingTop: 8, borderTop: `1px solid ${colors.outlineVariant}`, flexWrap: "wrap" }}>
        <button
          onClick={() => onReply(msg)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: colors.surfaceContainerLow,
            border: `1px solid ${colors.outlineVariant}`,
            borderRadius: 40,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            color: colors.onSurfaceVariant,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.surfaceContainer;
            e.currentTarget.style.color = colors.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.surfaceContainerLow;
            e.currentTarget.style.color = colors.onSurfaceVariant;
          }}
        >
          <Icon name="reply" size={16} /> Reply
        </button>
        <button
          onClick={() => onApprove(msg.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: colors.primaryFixed,
            border: `1px solid ${colors.primaryFixed}`,
            borderRadius: 40,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            color: colors.primary,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.primary;
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.primaryFixed;
            e.currentTarget.style.color = colors.primary;
          }}
        >
          <Icon name="check_circle" size={16} /> Approve
        </button>
        <button
          onClick={() => onDelete(msg.id, msg.user)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: "transparent",
            border: `1px solid ${colors.outlineVariant}`,
            borderRadius: 40,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            color: colors.error,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.errorContainer;
            e.currentTarget.style.borderColor = colors.errorContainer;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = colors.outlineVariant;
          }}
        >
          <Icon name="delete" size={16} /> Delete
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR (SAME AS DASHBOARD)
// ============================================================
function Sidebar({ open, onClose, navigate, isMd }) {
  const navLinks = [
    { icon: "dashboard", label: "Dashboard", active: false, path: "/community-admin/dashboard" },
    { icon: "calendar_today", label: "Events", active: false, path: "/community-admin/events" },
    { icon: "forum", label: "Messages", active: true, path: "/community-admin/messages" },
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

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MessageModeration() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const [filter, setFilter] = useState("all");

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

  const handleDelete = (id, userName) => {
    if (!window.confirm(`⚠️ Permanently delete message from ${userName}?`)) return;
    setRemovingIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setRemovingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }, 300);
  };

  const handleApprove = (id) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: "approved", statusLabel: "Approved ✓" } : m));
  };

  const handleReply = (msg) => { alert(`📝 Compose reply to ${msg.user} (simulated)`); };

  const filteredMessages = messages.filter((msg) => {
    if (filter === "all") return true;
    if (filter === "flagged") return msg.status === "flagged";
    if (filter === "spam") return msg.status === "spam";
    if (filter === "regular") return msg.status === "regular";
    if (filter === "approved") return msg.status === "approved";
    return true;
  });

  const counts = {
    all: messages.length,
    flagged: messages.filter((m) => m.status === "flagged").length,
    spam: messages.filter((m) => m.status === "spam").length,
    regular: messages.filter((m) => m.status === "regular").length,
    approved: messages.filter((m) => m.status === "approved").length,
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${colors.surface}; font-family: 'Inter', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-family: 'Material Symbols Outlined'; }
        .message-grid { display: grid; grid-template-columns: 1fr; gap: 20px; padding-bottom: 20px; }
        @media (min-width: 768px) { .message-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1200px) { .message-grid { grid-template-columns: repeat(3, 1fr); } }
        .content-wrapper { flex: 1; }
        /* Hide scrollbar track - FIX */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent !important; border: none !important; }
        ::-webkit-scrollbar-thumb { background: ${colors.primaryContainer}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${colors.primary}; }
        * { scrollbar-width: thin; scrollbar-color: ${colors.primaryContainer} transparent; }
      `}</style>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} isMd={isMd} />

      <main style={{ marginLeft: isMd ? 280 : 0, minHeight: "100vh", background: colors.surface, display: "flex", flexDirection: "column", border: "none", outline: "none" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 40, background: colors.surfaceContainerLowest, borderBottom: `1px solid ${colors.outlineVariant}`, display: "flex", justifyContent: "space-between", alignItems: "center", height: 70, padding: "0 28px", boxShadow: "0 1px 2px rgba(0,0,0,0.03)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {!isMd && <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: colors.primary, display: "flex", borderRadius: 8 }}><Icon name="menu" size={24} /></button>}
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: colors.primary }}>Message Moderation</h2>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.primaryFixed, display: "flex", alignItems: "center", justifyContent: "center", color: colors.primary, fontWeight: 600 }}><Icon name="person" size={20} /></div>
        </header>

       <div
  className="content-wrapper"
  style={{
    padding: "28px",
    maxWidth: 1400,
    margin: "0 auto",
    width: "100%",
    flex: 1,
  }}
>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: colors.secondary, letterSpacing: "0.08em", marginBottom: 4 }}>Moderation queue</p>
              <h3 style={{ fontSize: 26, fontWeight: 700, color: colors.primary, fontFamily: "'Playfair Display', serif" }}>Community messages</h3>
            </div>
            <div style={{ background: colors.surfaceContainerLowest, padding: "8px 20px", borderRadius: 40, fontSize: 14, border: `1px solid ${colors.outlineVariant}` }}>
              <span style={{ fontWeight: 700, color: colors.primary, fontSize: 18 }}>{filteredMessages.length}</span> <span style={{ color: colors.onSurfaceVariant }}>messages</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", borderBottom: `1px solid ${colors.outlineVariant}`, paddingBottom: 12 }}>
            {["all", "flagged", "spam", "regular", "approved"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: 40, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", border: "none", background: filter === f ? colors.primary : "transparent", color: filter === f ? "white" : colors.onSurfaceVariant, textTransform: "capitalize" }} onMouseEnter={(e) => { if (filter !== f) { e.currentTarget.style.background = colors.surfaceContainerLow; } }} onMouseLeave={(e) => { if (filter !== f) { e.currentTarget.style.background = "transparent"; } }}>
                {f} ({counts[f]})
              </button>
            ))}
          </div>

          {filteredMessages.length > 0 ? (
            <div className="message-grid">
              {filteredMessages.map((msg) => (<MessageCard key={msg.id} msg={msg} removing={removingIds.has(msg.id)} onDelete={handleDelete} onApprove={handleApprove} onReply={handleReply} />))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 60, background: colors.surfaceContainerLowest, borderRadius: 16, border: `1px solid ${colors.outlineVariant}` }}>
              <Icon name="forum" size={48} style={{ color: colors.onSurfaceVariant, opacity: 0.5 }} />
              <p style={{ marginTop: 16, color: colors.onSurfaceVariant }}>No messages found in this category.</p>
            </div>
          )}
        </div>

        <footer style={{ flexShrink: 0, padding: "28px 32px", textAlign: "center", borderTop: "1px solid #e0e0e0", background: colors.surfaceContainerLowest }}>
          <p style={{ fontSize: 13, color: `${colors.onSurfaceVariant}CC` }}>© 2024 Community Admin Ecosystem — Growing together, sustainably.</p>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 28 }}>
            {["System Status", "Terms of Service", "Privacy Policy"].map((link) => (<a key={link} href="#" style={{ fontSize: 12, color: colors.onSurfaceVariant, transition: "color 0.2s", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)} onMouseLeave={(e) => (e.currentTarget.style.color = colors.onSurfaceVariant)}>{link}</a>))}
          </div>
        </footer>
      </main>
    </>
  );
}