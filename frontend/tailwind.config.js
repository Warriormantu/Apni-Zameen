export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#002045',
          dark: '#1A365D',
          light: '#2D476F',
        },
        amber: {
          DEFAULT: '#FEA619',
          dark: '#855300',
          light: '#FFDDB8',
        },
        rera: {
          DEFAULT: '#1DD38F',
          light: '#D1FAF0',
        },
        surface: {
          DEFAULT: '#F2F3F8',
          low: '#F8F9FE',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        navy: {
          footer: '#001529',
        },
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        xs: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        card: '0 4px 15px 0 rgba(0,0,0,0.05)',
        'card-hover': '0 8px 25px 0 rgba(0,0,0,0.08)',
        'sticky': '0 2px 12px 0 rgba(0,32,69,0.08)',
      },
      borderRadius: {
        card: '1rem',
        'card-lg': '1.5rem',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};

