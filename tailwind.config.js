/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sara: {
          cream: '#FBEFD5',
          creamSoft: '#FCF5E6',
          red: '#A51E22',
          redDark: '#7E1518',
          redBright: '#B8242A',
          ink: '#2A1712',
          brown: '#40241A',
          orange: '#F5A623',
          green: '#1F5C3D',
          muted: '#7C6F64',
        },
      },
      fontFamily: {
        display: ['Anton', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
