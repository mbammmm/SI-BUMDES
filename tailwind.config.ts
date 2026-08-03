import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0D7C66",
          50: "#E6F5F1",
          100: "#CCEBE3",
          200: "#99D7C7",
          300: "#66C3AB",
          400: "#33AF8F",
          500: "#0D7C66",
          600: "#0A634F",
          700: "#074A3A",
          800: "#043125",
          900: "#02190F",
        },
        secondary: {
          DEFAULT: "#F2B705",
          50: "#FFF9E6",
          100: "#FFF3CC",
          200: "#FFE799",
          300: "#FFDB66",
          400: "#FFCF33",
          500: "#F2B705",
          600: "#C28F04",
          700: "#926703",
          800: "#614002",
          900: "#311801",
        },
        accent: {
          DEFAULT: "#F28C28",
          50: "#FEF3E8",
          100: "#FDE7D1",
          200: "#FBCFA3",
          300: "#F9B775",
          400: "#F79F47",
          500: "#F28C28",
          600: "#C26E20",
          700: "#925418",
          800: "#623A10",
          900: "#311E08",
        },
      },
    },
  },
  plugins: [],
};
export default config;
