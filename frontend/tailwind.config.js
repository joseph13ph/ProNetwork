/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8B5CF6",
        secondary: "#EC4899",
        lightPurple: "#D9B3FF",
        white: "#FFFFFF",
        lightGray: "#F8FAFC",
        mediumGray: "#64748B",
        darkGray: "#1E293B",
        danger: "#F4212E",
        success: "#10B981"
      },
      borderRadius: {
        xl2: "12px"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(30, 41, 59, 0.08)"
      }
    }
  },
  plugins: []
};
