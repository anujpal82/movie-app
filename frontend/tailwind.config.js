// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: '#3EE588', // green from the image
        error: '#E5544F',   // red from the image
        background: '#0D192B', // dark blue bg
        input: '#224957', // input color (updated)
        card: '#073746',  // card color
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      gridTemplateColumns: {
        '12-cols': 'repeat(12, minmax(0, 1fr))',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        // extend as needed
      },
      container: {
        center: true,
        padding: '1rem',
      },
      maxWidth: {
        'screen-xl': '1440px',
      },
    },
  },
  plugins: [],
};
