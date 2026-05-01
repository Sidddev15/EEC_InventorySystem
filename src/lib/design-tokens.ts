export const designTokens = {
  colors: {
    background: "#F5F7FB",
    surface: "#FFFFFF",
    sidebar: "#0F172A",
    sidebarActive: "#1E293B",
    primary: "#2563EB",
    primaryLight: "#DBEAFE",
    success: "#16A34A",
    successBg: "#DCFCE7",
    warning: "#D97706",
    warningBg: "#FEF3C7",
    danger: "#DC2626",
    dangerBg: "#FEE2E2",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    border: "#E2E8F0",
  },
  typography: {
    pageTitle: "text-xl font-semibold",
    sectionTitle: "text-sm font-semibold text-slate-700",
    body: "text-sm text-slate-600",
    numbers: "text-2xl font-bold text-slate-900",
  },
  layout: {
    contentPadding: "p-6",
    contentSpacing: "space-y-6",
  },
  radius: {
    card: "0.75rem",
    control: "0.5rem",
  },
} as const;

export type DesignTokenGroup = keyof typeof designTokens;
