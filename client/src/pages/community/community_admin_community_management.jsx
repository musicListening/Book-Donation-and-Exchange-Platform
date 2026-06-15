import { useState, useEffect } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const c = {
  primary: "#003634",
  primaryFixed: "#bcece8",
  secondary: "#80543f",
  surface: "#f9f9f9",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f3f3f3",
  surfaceContainerHigh: "#e8e8e8",
  surfaceContainer: "#eeeeee",
  onSurface: "#1a1c1c",
  onSurfaceVariant: "#404848",
  outlineVariant: "#c0c8c7",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
};

// ── Static data ───────────────────────────────────────────────────────────────
const INITIAL_MESSAGES = [
  {
    id: 1,
    user: "Julianne Devis",
    content: '"This book donation drive is a joke. I\'ve been waiting for three weeks and nobody has picked up my box. Extremely frustrated with the service here! #BadService"',
    posted: "Oct 15, 2024, 10:32 AM",
    status: "flagged",
    statusLabel: "Flagged: Profanity",
  },
  {
    id: 2,
    user: "Marcus Rivera",
    content: '"Does anyone have a copy of \'The Shadow of the Wind\'? I\'m looking to complete my collection and would love to trade some of my historical fiction pieces for it."',
    posted: "Oct 15, 2024, 10:20 AM",
    status: "regular",
    statusLabel: "Regular Post",
  },
  {
    id: 3,
    user: "Unknown Account #552",
    content: '"CLICK HERE FOR FREE BOOK VOUCHERS AND AMAZON GIFTCARDS!!! http://bit.ly/fake-link-moderation-needed-fast-now"',
    posted: "Oct 15, 2024, 9:15 AM",
    status: "spam",
    statusLabel: "Spam Detected",
  },
  {
    id: 4,
    user: "Sarah Higgins",
    content: '"I just finished reading \'The Great Gatsby\' for the tenth time. Every time I find something new. Is there a book club meeting this Friday to discuss classic literature?"',
    posted: "Oct 15, 2024, 7:45 AM",
    status: "regular",
    statusLabel: "Regular Post",
  },
  {
    id: 5,
    user: "Elena Wong",
    content: '"The children\'s reading hour was magical yesterday! Thank you to all volunteers. 📚✨"',
    posted: "Oct 14, 2024, 6:12 PM",
    status: "regular",
    statusLabel: "Regular Post",
  },
  {
    id: 6,
    user: "Daniel Park",
    content: '"Is the library open during the holiday break? I need to return some rare manuscripts."',
    posted: "Oct 14, 2024, 2:05 PM",
    status: "regular",
    statusLabel: "Regular Post",
  },
];

const NAV_LINKS = [
  { icon: "dashboard", label: "Dashboard", active: false },
  { icon: "calendar_today", label: "Events", active: false },
  { icon: "groups", label: "Community", active: true },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function Icon({ name, size = 24, style = {} }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1, userSelect: "none", ...style }}
    >
      {name}
    </span>
  );
}

function Badge({ status, label }) {
  const styles = {
    flagged: { background: c.errorContainer, color: c.onErrorContainer },
    spam: { background: c.error, color: "#fff" },
    regular: { background: c.surfaceContainer, color: c.onSurfaceVariant },
    approved: { background: c.primaryFixed, color: c.primary },
  };
  const s = styles[status] || styles.regular;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 11px",
        borderRadius: 30,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        ...s,
      }}
    >
      {label}
    </span>
  );
}

function ActionButton({ variant, icon, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  const variants = {
    reply: {
      base: { background: "#eef2ff", color: "#1f4e4c", border: "1px solid #dce3ec" },
      hover: { background: "#e0e7f5" },
    },
    approve: {
      base: { background: "#e0f2e9", color: "#1f6e5c", border: "1px solid #cce5db" },
      hover: { background: "#cfe8de" },
    },
    delete: {
      base: { background: "#ffe9e9", color: "#b91c1c", border: "1px solid #ffd6d6" },
      hover: { background: "#ffdada" },
    },
  };
  const v = variants[variant];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "7px 14px",
        borderRadius: 40,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-1px)" : "none",
        ...v.base,
        ...(hovered ? v.hover : {}),
      }}
    >
      <Icon name={icon} size={16} />
      <span className="btn-label">{label}</span>
    </button>
  );
}

function MessageRow({ msg, onDelete, onApprove, onReply, removing }) {
  return (
    <tr
      style={{
        opacity: removing ? 0 : 1,
        transform: removing ? "translateX(20px)" : "none",
        transition: "opacity 0.28s ease, transform 0.28s ease",
        background: msg.status === "spam" ? "rgba(186,26,26,0.03)" : "transparent",
      }}
    >
      <td
        style={{
          padding: "16px 20px",
          fontWeight: 600,
          color: c.primary,
          verticalAlign: "top",
          borderBottom: `1px solid #edf2f7`,
          whiteSpace: "nowrap",
        }}
      >
        {msg.user}
      </td>
      <td
        style={{
          padding: "16px 20px",
          maxWidth: 420,
          wordBreak: "break-word",
          lineHeight: 1.45,
          color: msg.status === "spam" ? c.error : "#1a2c2c",
          borderBottom: `1px solid #edf2f7`,
          fontSize: 14,
        }}
      >
        {msg.content}
      </td>
      <td
        style={{
          padding: "16px 20px",
          fontSize: 13,
          color: c.onSurfaceVariant,
          whiteSpace: "nowrap",
          verticalAlign: "middle",
          borderBottom: `1px solid #edf2f7`,
        }}
      >
        {msg.posted}
      </td>
      <td
        style={{
          padding: "16px 20px",
          verticalAlign: "middle",
          borderBottom: `1px solid #edf2f7`,
        }}
      >
        <Badge status={msg.status} label={msg.statusLabel} />
      </td>
      <td
        style={{
          padding: "16px 20px",
          verticalAlign: "middle",
          borderBottom: `1px solid #edf2f7`,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <ActionButton variant="reply" icon="reply" label="Reply" onClick={() => onReply(msg)} />
          <ActionButton
            variant="approve"
            icon="check_circle"
            label="Approve"
            onClick={() => onApprove(msg.id)}
          />
          <ActionButton
            variant="delete"
            icon="delete"
            label="Delete"
            onClick={() => onDelete(msg.id, msg.user)}
          />
        </div>
      </td>
    </tr>
  );
}

function Sidebar({ open, onClose, isMd }) {
  return (
    <>
      {!isMd && open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40,
          }}
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
            fontSize: 24,
            fontWeight: 600,
            color: c.primary,
            marginBottom: 40,
            paddingLeft: 16,
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
                display: "flex",
                alignItems: "center",
                gap: 12,
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

// ── Main component ────────────────────────────────────────────────────────────
export default function MessageModeration() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMd, setIsMd] = useState(false);

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

  const handleDelete = (id, userName) => {
    if (!window.confirm(`⚠️ Permanently delete message from ${userName}? This cannot be undone.`)) return;
    setRemovingIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  const handleApprove = (id) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: "approved", statusLabel: "Approved ✓" } : m
      )
    );
  };

  const handleReply = (msg) => {
    alert(`📝 Compose reply to ${msg.user} (simulated). In a full implementation, a modal would open.`);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f5f5; font-family: 'Inter', sans-serif; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
        }
        .mod-table { width: 100%; border-collapse: collapse; }
        .mod-table th {
          text-align: left;
          padding: 16px 20px;
          background: #fff;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #2c3e3e;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .mod-table tbody tr:hover td { background-color: #faf9fc !important; }
        @media (max-width: 640px) {
          .btn-label { display: none; }
        }
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
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            borderBottom: `1px solid ${c.outlineVariant}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 64,
            padding: "0 24px",
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
                  borderRadius: "50%",
                  display: "flex",
                  color: c.onSurface,
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
                color: c.primary,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon name="forum" size={24} />
              Message Moderation
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: c.onSurfaceVariant, display: "flex" }}
            >
              <Icon name="notifications" />
            </button>
            <div
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: c.primaryFixed,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${c.outlineVariant}`,
                color: c.primary, fontWeight: 700, fontSize: 13,
              }}
            >
              A
            </div>
          </div>
        </header>

        {/* Body */}
        <div style={{ padding: "24px 24px", maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          {/* Page heading row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: c.secondary,
                  marginBottom: 4,
                }}
              >
                Moderation queue
              </p>
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: c.primary,
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "-0.01em",
                }}
              >
                Community messages
              </h3>
            </div>

            <div
              style={{
                background: c.surfaceContainerLowest,
                padding: "8px 16px",
                borderRadius: 40,
                fontSize: 14,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <span style={{ fontWeight: 600, color: c.primary }}>{messages.length}</span>{" "}
              <span style={{ color: c.onSurfaceVariant }}>pending items</span>
            </div>
          </div>

          {/* Table card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: `1px solid ${c.outlineVariant}`,
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table className="mod-table">
                <thead>
                  <tr>
                    {["User", "Message content", "Posted", "Status", "Actions"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <MessageRow
                      key={msg.id}
                      msg={msg}
                      removing={removingIds.has(msg.id)}
                      onDelete={handleDelete}
                      onApprove={handleApprove}
                      onReply={handleReply}
                    />
                  ))}
                  {messages.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: "48px 20px",
                          textAlign: "center",
                          color: c.onSurfaceVariant,
                          fontSize: 14,
                        }}
                      >
                        No messages in the queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: 12,
                color: c.onSurfaceVariant,
                padding: "12px 20px",
                borderTop: `1px solid ${c.outlineVariant}`,
                background: c.surface,
              }}
            >
              All messages are displayed on this single page — easy moderation, no pagination.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

