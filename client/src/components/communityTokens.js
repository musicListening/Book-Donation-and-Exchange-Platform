// ============================================================
// SHARED DESIGN TOKENS — used by every Community screen so the
// palette, spacing, depth and motion stay identical between them.
// Kept out of CommunityAdminUI.jsx so that file only exports
// components and Vite fast refresh keeps working.
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
