/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0e7490",
          dark: "#155e75",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#14b8a6",
          foreground: "#ffffff",
        },
        neural: "#ec4899",
        accent: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
        danger: "#ef4444",
        success: "#10b981",
        warning: "#f59e0b",
        "bg-light": "#f0f9ff",
        "bg-dark": "#083344",
        "surface-light": "#ffffff",
        "surface-dark": "#164e63",
        "text-light": "#164e63",
        "text-dark": "#ecfeff",
        "text-muted-light": "#64748b",
        "text-muted-dark": "#a5f3fc",
        "border-light": "#cffafe",
        "border-dark": "#155e75",
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        modalIn: {
          from: { opacity: "0", transform: "scale(0.95) translateY(20px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        heartBeat: {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.3)" },
          "60%": { transform: "scale(1)" },
          "100%": { transform: "scale(1)" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.1)", opacity: "0.8" },
        },
        toastIn: {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        toastOut: {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(100%)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        modalIn: "modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        fadeIn: "fadeIn 0.3s ease-out forwards",
        slideIn: "slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        heartBeat: "heartBeat 0.3s ease-in-out",
        spin: "spin 1s linear infinite",
        shimmer: "shimmer 1.5s infinite",
        pulse: "pulse 4s ease-in-out infinite",
        "pulse-slow": "pulse 6s ease-in-out infinite reverse",
        toastIn: "toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        toastOut: "toastOut 0.3s ease-in forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
