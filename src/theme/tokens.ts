export const tokens = {
  light: {
    colors: {
      background: '#F9FAFB',
      surface: '#FFFFFF',
      primary: '#0F172A',
      secondary: '#334155',
      border: '#E5E7EB',
      cardBorder: '#E5E7EB',
      card: '#FFFFFF',
      accent: '#2563EB',
      error: '#B00020',
    },
    radius: { sm: 8, md: 12, lg: 16 },
    spacing: { sm: 8, md: 12, lg: 16, xl: 24 },
  },
  dark: {
    colors: {
      background: '#0B1220',
      surface: '#0F172A',
      primary: '#E5E7EB',
      secondary: '#94A3B8',
      border: '#1F2937',
      cardBorder: '#30363D',
      card: '#111827',
      accent: '#60A5FA',
      error: '#F87171',
    },
    radius: { sm: 8, md: 12, lg: 16 },
    spacing: { sm: 8, md: 12, lg: 16, xl: 24 },
  },
} as const;
