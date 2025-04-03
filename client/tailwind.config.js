/** @type {import('tailwindcss').Config} */

import PrimeUI from 'tailwindcss-primeui'

export default {
  darkMode: ['selector', '[class="p-dark"]'],
  plugins: [PrimeUI],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      body: ['"Inter var"', '"Inter"', '"Open Sans"', 'Helvetica', 'Arial', 'sans-serif'],
      mono: ['"Fira Code"', 'monospace']
    }
  }
}
