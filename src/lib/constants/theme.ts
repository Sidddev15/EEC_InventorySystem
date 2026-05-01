export const EEC_THEME = {
  background: "#F6F7F9",
  surface: "#FFFFFF",
  sidebar: "#17202A",
  sidebarActive: "#243447",
  border: "#E2E8F0",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  accent: "#2563EB",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  stockStatus: {
    low: "#DC2626",
    reorderSoon: "#CA8A04",
    normal: "#16A34A",
  },
} as const;

export type EecThemeToken = keyof typeof EEC_THEME;
