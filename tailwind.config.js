/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        primary: '#1E3A5F',
        accent: '#1A56A4',
        highlight: '#0EA5E9',
        fall: '#F43F5E',
        ink: '#0F172A',
        muted: '#475569',
        faint: '#94A3B8',
        line: '#E2E8F0',
        surface: '#F8F9FF',
        'surface-low': '#EFF4FF',
        'surface-container': '#E5EEFF',
      },
      fontFamily: {
        headline: ['"Plus Jakarta Sans"', 'Pretendard', 'sans-serif'],
        body: ['Inter', 'Pretendard', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04)',
        lift: '0 4px 12px -2px rgba(30, 58, 95, 0.08)',
      },
      maxWidth: {
        board: '720px',
      },
    },
  },
  plugins: [],
};
