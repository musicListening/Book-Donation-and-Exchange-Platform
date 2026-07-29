import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================
// SHARED DESIGN TOKENS — used by every Community Admin screen
// (Dashboard, Events, Messages) so they look and behave the same.
// ============================================================
export const colors = {
  primary: "#006D5B",
  primaryDeep: "#0A3B32",
  accent: "#E4B93A",
  accentSoft: "#FFF4CC",
  accentBorder: "#F1D980",
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
  inkSoft: "#587169",
  outlineVariant: "#C5D9D3",
  error: "#BA1A1A",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#93000A",
};

// Non-colour design tokens. The palette above is unchanged — these only
// standardise spacing, corners, depth and motion so every Community screen
// uses the same rhythm instead of ad-hoc numbers.
export const space = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 44 };

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 };

// Three elevation steps: resting, raised on hover, floating (menus/drawers).
export const elevation = {
  rest: '0 1px 2px rgba(10, 59, 50, 0.04)',
  raised: '0 12px 28px -8px rgba(10, 59, 50, 0.16)',
  float: '0 24px 48px -12px rgba(10, 59, 50, 0.24)',
};

export const motion = {
  fast: '140ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '220ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '320ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Kept in one place so drawers, headers and menus never fight each other.
export const layer = { header: 30, drawerScrim: 40, drawer: 50, menu: 100 };

export const sidebarColors = {
  background: "#0A3B32",
  text: "#FFFFFF",
  textHover: "#E8F5F2",
  border: "rgba(255, 255, 255, 0.15)",
  activeBackground: "rgba(255, 255, 255, 0.12)",
  hoverBackground: "rgba(255, 255, 255, 0.08)",
  icon: "#FFFFFF",
  iconHover: "#C8F0EA",
};

export const NAV_LINKS = [
  { key: "dashboard", icon: "dashboard", label: "Dashboard", path: "/community-admin/dashboard" },
  { key: "events", icon: "calendar_today", label: "Events", path: "/community-admin/events" },
  { key: "messages", icon: "forum", label: "Messages", path: "/community-admin/messages" },
];

export function Icon({ name, size = 24, style = {} }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: size, lineHeight: 1, ...style }}>
      {name}
    </span>
  );
}

// ============================================================
// SHARED PRIMITIVES
// Every page was rebuilding the same pill button and status chip inline
// with slightly different padding each time. These keep them identical.
// ============================================================

const BUTTON_VARIANTS = {
  primary: { background: colors.primary, color: colors.onPrimary, border: `1px solid ${colors.primary}` },
  accent: { background: colors.accentSoft, color: colors.primaryDeep, border: `1px solid ${colors.accentBorder}` },
  quiet: { background: 'transparent', color: colors.primary, border: `1px solid ${colors.outlineVariant}` },
  danger: { background: 'transparent', color: colors.error, border: `1px solid ${colors.outlineVariant}` },
};

const BUTTON_SIZES = {
  sm: { padding: '8px 14px', fontSize: 12.5 },
  md: { padding: '11px 18px', fontSize: 14 },
};

export function Button({ children, variant = 'primary', size = 'md', icon, as = 'button', loading = false, disabled, style = {}, ...rest }) {
  const Tag = as;
  return (
    <Tag
      className="community-btn"
      disabled={Tag === 'button' ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: radius.pill,
        fontWeight: 700,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        transition: `transform ${motion.fast}, box-shadow ${motion.fast}, background ${motion.fast}`,
        ...BUTTON_SIZES[size],
        ...BUTTON_VARIANTS[variant],
        ...style,
      }}
      {...rest}
    >
      {loading ? <span className="community-spinner" aria-hidden="true" /> : icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} /> : null}
      {children}
    </Tag>
  );
}

// Small status/label chip — e.g. "LATEST", "Newest first".
export function Chip({ children, tone = 'accent', style = {} }) {
  const tones = {
    accent: { background: colors.accentSoft, color: colors.primaryDeep, border: `1px solid ${colors.accentBorder}` },
    primary: { background: colors.primary, color: colors.onPrimary, border: `1px solid ${colors.primary}` },
    soft: { background: colors.tertiaryFixed, color: colors.tertiary, border: `1px solid ${colors.outlineVariant}` },
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: radius.pill, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', ...tones[tone], ...style }}>
      {children}
    </span>
  );
}

// Placeholder block used while data loads. Mirrors the shape of the real
// content so the layout does not jump when it arrives.
export function Skeleton({ height = 16, width = '100%', radius: r = radius.sm, style = {} }) {
  return <div className="community-skeleton" aria-hidden="true" style={{ height, width, borderRadius: r, ...style }} />;
}

// Card-shaped skeleton matching the event/message cards.
export function SkeletonCard({ media = false }) {
  return (
    <div style={{ background: colors.surfaceContainerLowest, border: `1px solid ${colors.outlineVariant}`, borderRadius: radius.md, overflow: 'hidden' }}>
      {media && <Skeleton height={128} radius={0} />}
      <div style={{ padding: space.lg, display: 'grid', gap: space.sm }}>
        <Skeleton height={11} width="38%" />
        <Skeleton height={18} width="72%" />
        <Skeleton height={12} />
        <Skeleton height={12} width="85%" />
        <Skeleton height={14} width="45%" style={{ marginTop: space.xs }} />
      </div>
    </div>
  );
}

// One empty state used by every list, so "nothing here" always reads the
// same and can offer the next action instead of dead-ending.
export function EmptyState({ icon = 'inbox', title, message, action }) {
  return (
    <div style={{ textAlign: 'center', padding: `${space.xxl + 16}px ${space.lg}px`, background: colors.surfaceContainerLowest, borderRadius: radius.md, border: `1px dashed ${colors.outlineVariant}` }}>
      <div style={{ width: 64, height: 64, margin: '0 auto', borderRadius: '50%', background: colors.tertiaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.tertiary }}>
        <Icon name={icon} size={30} />
      </div>
      <h4 style={{ marginTop: space.md, fontFamily: "'Playfair Display', serif", fontSize: 19, color: colors.onSurface }}>{title}</h4>
      {message && <p style={{ marginTop: space.xs, fontSize: 14, lineHeight: 1.7, color: colors.inkSoft, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>{message}</p>}
      {action && <div style={{ marginTop: space.lg }}>{action}</div>}
    </div>
  );
}

// Fonts + global resets shared by every Community Admin page.
export function CommunityAdminFonts() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background:
            radial-gradient(circle at top left, rgba(255, 244, 204, 0.9), transparent 30%),
            radial-gradient(circle at top right, rgba(200, 240, 234, 0.55), transparent 26%),
            linear-gradient(180deg, #fffef7 0%, ${colors.surface} 45%, #f6faf8 100%);
          font-family: 'Inter', sans-serif;
          color: ${colors.onSurface};
        }
        a { text-decoration: none; }

        /* Keyboard focus was invisible everywhere in this area. Only shows for
           keyboard users, so mouse clicks stay clean. */
        :focus { outline: none; }
        :focus-visible {
          outline: 3px solid ${colors.primary};
          outline-offset: 2px;
          border-radius: ${radius.sm}px;
        }
        .on-dark :focus-visible {
          outline-color: ${colors.primaryFixed};
        }
        /* Anything interactive should say so */
        button, [role="button"] { cursor: pointer; font-family: inherit; }
        button:disabled { cursor: not-allowed; opacity: 0.55; }

        /* Skip past the sidebar straight to the page content */
        .skip-link {
          position: absolute;
          left: ${space.md}px;
          top: -100px;
          z-index: ${layer.menu + 1};
          padding: ${space.sm}px ${space.md}px;
          border-radius: ${radius.sm}px;
          background: ${colors.primary};
          color: ${colors.onPrimary};
          font-weight: 700;
          font-size: 14px;
          transition: top ${motion.fast};
        }
        .skip-link:focus-visible { top: ${space.md}px; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-family: 'Material Symbols Outlined'; }
        .content-wrapper { flex: 1; }
        .soft-card {
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(227, 220, 173, 0.85);
          border-radius: 16px;
          box-shadow: 0 10px 26px rgba(10, 59, 50, 0.05);
        }
        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }
        .eyebrow {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: ${colors.secondary};
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }
        .page-title {
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.12;
          color: ${colors.primaryDeep};
          font-family: 'Playfair Display', serif;
        }
        .page-subtitle {
          margin-top: 12px;
          max-width: 680px;
          color: ${colors.inkSoft};
          font-size: 14px;
          line-height: 1.8;
        }
        .metric-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 14px;
        }
        .metric-pill {
          padding: 16px 18px;
          border-radius: 14px;
          background: ${colors.accentSoft};
          border: 1px solid ${colors.accentBorder};
        }
        .metric-pill strong {
          display: block;
          margin-top: 4px;
          font-size: 28px;
          color: ${colors.primaryDeep};
          font-family: 'Playfair Display', serif;
        }
        .community-skeleton {
          background: linear-gradient(100deg, ${colors.surfaceContainerHigh} 28%, ${colors.surfaceContainerLow} 48%, ${colors.surfaceContainerHigh} 68%);
          background-size: 220% 100%;
          animation: communityShimmer 1.3s ease-in-out infinite;
        }
        @keyframes communityShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .community-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: ${elevation.raised};
        }
        .community-btn:active:not(:disabled) { transform: translateY(0); box-shadow: none; }
        .community-spinner {
          width: 15px; height: 15px; flex-shrink: 0;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: communitySpin 620ms linear infinite;
        }
        @keyframes communitySpin { to { transform: rotate(360deg); } }
        @keyframes communityFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes communityMenuIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        /* Respect the OS "reduce motion" setting. The shimmer and spinner are
           the worst offenders here, so they stop rather than just shorten. */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          .community-skeleton { animation: none; background: ${colors.surfaceContainerHigh}; }
          .community-btn:hover:not(:disabled) { transform: none; }
        }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent !important; border: none !important; }
        ::-webkit-scrollbar-thumb { background: ${colors.primaryContainer}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${colors.primary}; }
        * { scrollbar-width: thin; scrollbar-color: ${colors.primaryContainer} transparent; }
      `}</style>
    </>
  );
}

// One Sidebar component reused by every Community Admin page.
export function CommunitySidebar({ active, open, onClose, navigate, isMd }) {
  // Mobile drawer behaviour: Escape closes it, and the page behind it stops
  // scrolling while it is open.
  useEffect(() => {
    if (isMd || !open) return;
    const onKeyDown = (e) => { if (e.key === "Escape" && onClose) onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMd, open, onClose]);

  const handleLogout = () => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (u?.id) fetch((import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://book-donation-and-exchange-platform.onrender.com/api')) + '/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u.id }) }).catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (navigate) navigate("/login"); else window.location.href = "/login";
    if (onClose) onClose();
  };

  const content = (
    <aside className="on-dark" style={{ height: "100%", width: 280, background: "linear-gradient(180deg, #0A3B32 0%, #0E4B3F 48%, #113A33 100%)", borderRight: `1px solid ${sidebarColors.border}`, display: "flex", flexDirection: "column", padding: "32px 20px", boxShadow: "18px 0 40px rgba(10, 59, 50, 0.1)" }}>
      <div style={{ marginBottom: 38, paddingLeft: 12 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: sidebarColors.text, marginBottom: 8, letterSpacing: "-0.5px" }}>Community Admin</h1>
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 1.7 }}>Simple tools for events and messages.</p>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }} aria-label="Community admin sections">
        {NAV_LINKS.map((link) => {
          const isActive = link.key === active;
          return (
            <a
              key={link.key}
              href={link.path}
              aria-current={isActive ? "page" : undefined}
              onClick={(e) => { e.preventDefault(); if (navigate) navigate(link.path); if (onClose) onClose(); }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", textDecoration: "none", borderRadius: 14, fontWeight: isActive ? 600 : 400, color: isActive ? sidebarColors.text : "rgba(255, 255, 255, 0.7)", background: isActive ? "linear-gradient(90deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))" : "transparent", borderLeft: isActive ? `3px solid ${colors.primaryFixed}` : "3px solid transparent", fontSize: 14, lineHeight: "20px", transition: "all 0.2s ease", cursor: "pointer", boxShadow: isActive ? "0 10px 25px rgba(0,0,0,0.12)" : "none" }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = sidebarColors.hoverBackground; e.currentTarget.style.color = sidebarColors.textHover; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"; } }}
            >
              <Icon name={link.icon} size={20} style={{ color: "inherit" }} />
              <span style={{ fontWeight: isActive ? 600 : 400 }}>{link.label}</span>
            </a>
          );
        })}
      </nav>
      <div style={{ marginTop: "auto", paddingTop: 24, borderTop: `1px solid ${sidebarColors.border}` }}>
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", width: "100%", background: "transparent", border: "none", borderRadius: 10, color: "rgba(255, 255, 255, 0.7)", fontSize: 14, cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'Inter', sans-serif" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = sidebarColors.hoverBackground; e.currentTarget.style.color = sidebarColors.textHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"; }}
        >
          <Icon name="logout" size={20} style={{ color: "inherit" }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  if (!isMd) {
    return (
      <>
        {open && (
          <div
            onClick={onClose}
            aria-hidden="true"
            style={{ position: "fixed", inset: 0, background: "rgba(10, 59, 50, 0.55)", backdropFilter: "blur(2px)", zIndex: layer.drawerScrim, animation: `communityFadeIn ${motion.base} both` }}
          />
        )}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Community admin menu"
          // Hidden from assistive tech and the tab order when closed, so the
          // off-screen menu cannot be tabbed into.
          aria-hidden={open ? undefined : "true"}
          inert={open ? undefined : ""}
          style={{ position: "fixed", left: 0, top: 0, height: "100%", zIndex: layer.drawer, transition: `transform ${motion.slow}`, transform: open ? "translateX(0)" : "translateX(-100%)", boxShadow: open ? elevation.float : "none" }}
        >
          {content}
        </div>
      </>
    );
  }
  return <div style={{ position: "fixed", left: 0, top: 0, height: "100%", zIndex: layer.drawer }}>{content}</div>;
}

// One sticky header reused by every Community Admin page.
export function CommunityHeader({ title, subtitle, action, isMd, onMenuClick }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const menuButtonRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // Lift the header once the page moves under it, so it reads as a layer
  // above the content rather than floating text.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape closes the menu and hands focus back to the button that opened it,
  // so keyboard users do not get dropped at the top of the page.
  useEffect(() => {
    if (!userMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [userMenuOpen]);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: layer.header, background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.92)", borderBottom: `1px solid ${colors.accentBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 82, padding: "18px 30px", boxShadow: scrolled ? elevation.raised : elevation.rest, flexShrink: 0, backdropFilter: "blur(10px)", transition: `box-shadow ${motion.base}, background ${motion.base}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {!isMd && (
          <button onClick={onMenuClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: colors.primary, display: "flex", borderRadius: 8 }}>
            <Icon name="menu" size={24} />
          </button>
        )}
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: colors.primary }}>{title}</h2>
          {subtitle && <p style={{ color: colors.inkSoft, fontSize: 13, marginTop: 5 }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {action}
        <div style={{ position: 'relative' }}>
          <button
            ref={menuButtonRef}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            aria-label={`Account menu for ${user?.name || 'Community Admin'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: radius.pill, background: colors.accentSoft, border: `1px solid ${colors.accentBorder}`, cursor: 'pointer', transition: `box-shadow ${motion.fast}` }}
          >
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: colors.primary, overflow: 'hidden', display: "flex", alignItems: "center", justifyContent: "center", color: colors.onPrimary, fontWeight: 600, position: "relative", flexShrink: 0 }}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <Icon name="person" size={18} />}
              <span style={{ position: "absolute", right: 1, bottom: 1, width: 8, height: 8, borderRadius: "50%", background: "#19c37d", boxShadow: "0 0 0 2px rgba(255,255,255,0.9)" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, textTransform: "uppercase", color: colors.inkSoft, letterSpacing: "0.08em" }}>Admin</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: colors.primaryDeep }}>{user?.name || 'Community Admin'}</p>
            </div>
          </button>
          {userMenuOpen && (
            <>
              <div onClick={() => setUserMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
              <div role="menu" style={{
                position: 'absolute', top: '100%', right: 0, marginTop: space.xs,
                background: colors.surfaceContainerLowest, borderRadius: radius.md, boxShadow: elevation.float,
                border: `1px solid ${colors.outlineVariant}`, minWidth: 190, zIndex: layer.menu, overflow: 'hidden',
                animation: `communityMenuIn ${motion.fast} both`
              }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #F1F3F5' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{user?.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#6C757D' }}>Community Admin</p>
                </div>
                <button
                  role="menuitem"
                  onClick={() => { if (navigate) navigate('/community-admin/profile'); else window.location.href = '/community-admin/profile'; setUserMenuOpen(false); }}
                  style={{ display: 'block', width: '100%', padding: '11px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: `background ${motion.fast}` }}
                  onMouseEnter={e => e.target.style.background = '#F8F9FA'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  Profile
                </button>
                <div style={{ height: 1, background: '#F1F3F5' }} />
                <button
                  role="menuitem"
                  onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }}
                  style={{ display: 'block', width: '100%', padding: '11px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: colors.error, transition: `background ${motion.fast}` }}
                  onMouseEnter={e => e.target.style.background = '#FFF5F5'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// Shared responsive breakpoint hook so every page reacts the same way.
export function useIsMdScreen() {
  const [isMd, setIsMd] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setIsMd(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMd;
}
