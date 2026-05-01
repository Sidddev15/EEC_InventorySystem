import { designTokens } from "@/lib/design-tokens";

export const EEC_THEME = {
  background: designTokens.colors.background,
  surface: designTokens.colors.surface,
  sidebar: designTokens.colors.sidebar,
  sidebarActive: designTokens.colors.sidebarActive,
  border: designTokens.colors.border,
  textPrimary: designTokens.colors.textPrimary,
  textSecondary: designTokens.colors.textSecondary,
  accent: designTokens.colors.primary,
  success: designTokens.colors.success,
  warning: designTokens.colors.warning,
  danger: designTokens.colors.danger,
  stockStatus: {
    low: designTokens.colors.danger,
    reorderSoon: designTokens.colors.warning,
    normal: designTokens.colors.success,
  },
} as const;

export type EecThemeToken = keyof typeof EEC_THEME;
