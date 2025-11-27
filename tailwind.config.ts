// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        fyte: {
          900: "#282828",
          800: "#1e3a5f",
        }
      },
      borderRadius: {
        "3xl": "1.5rem",
      },
      boxShadow: {
        "card": "0 20px 60px rgba(0,0,0,0.2)",
      },
      backgroundImage: {
        "fyte-gradient": "linear-gradient(135deg,#282828_0%,#1e3a5f_100%)",
      }
    }
  },
  plugins: []
};

export default config;
