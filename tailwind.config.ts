import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./Providers.tsx",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F1EA",
        ivory: "#FCFBF8",
        sand: "#EAE3D7",
        sage: "#E7F0EC",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};

export default config;
