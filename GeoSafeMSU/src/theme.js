import { theme } from 'antd'

// The one place the app's colors are defined. CSS files mirror these as
// --gs-* variables (see MainLayout.css); keep the two in sync.
export const PALETTE = {
  bg: '#1A202C',        // Primary background — Deep Slate Blue / Charcoal
  surface: '#2D3748',   // Secondary background — sidebar, cards, headers
  text: '#EDF2F7',      // Primary text — Off-White / Crisp Silver
  brand: '#AE2448',     // MSU maroon — buttons, selected menu item
}

// Light theme for public pages (landing, login, guest).
export const lightTheme = {
  token: { colorPrimary: PALETTE.brand },
}

// Dark theme for the logged-in system (everything inside MainLayout).
// darkAlgorithm derives hover/border/secondary-text shades from these bases.
export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: PALETTE.brand,
    colorBgBase: PALETTE.bg,
    colorBgLayout: PALETTE.bg,
    colorBgContainer: PALETTE.surface,
    colorBgElevated: PALETTE.surface,
    colorTextBase: PALETTE.text,
  },
}
