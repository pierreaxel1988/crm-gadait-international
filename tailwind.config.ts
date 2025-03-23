
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))"
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))"
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))"
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))"
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))"
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))"
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))"
				},
				// Ajout des couleurs de la charte Gadait
				gadait: {
					background: "#f0f0f0",
					text: "#333333",
					primary: "#007bff",
					secondary: "#6c757d",
					border: "#dcdcdc",
					error: "#dc3545",
					success: "#28a745"
				},
				// Garder les couleurs existantes pour la rétrocompatibilité
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				loro: {
					'white': '#F5F5F0',
					'pearl': '#E0E0E0',
					'sand': '#D3C5B4',
					'hazel': '#8B6F4E',
					'navy': '#2C3E50',
					'terracotta': 'rgb(157, 82, 72)',
					'text': 'rgb(33, 33, 33)',
					50: '#F5F5F0',
					100: '#E0E0E0',
					200: '#D3C5B4',
					300: '#BFB1A0',
					400: '#A99A89',
					500: '#8B6F4E',
					600: '#7A6045',
					700: '#5F4B36',
					800: '#433528',
					900: '#2C2419',
				},
				chocolate: {
					'dark': '#403E43',
					'light': '#8E9196',
				},
				times: {
					'text': 'rgb(33, 33, 33)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Ajout du radius de la charte Gadait
				gadait: '8px'
			},
			fontFamily: {
				// Ajout des polices de la charte Gadait
				roboto: ['Roboto', 'sans-serif'],
				opensans: ['Open Sans', 'sans-serif'],
				// Garder les polices existantes pour la rétrocompatibilité
				sans: ['Inter', 'sans-serif'],
				serif: ['Playfair Display', 'serif'],
				optima: ['OptimaLTStd', 'Inter', 'sans-serif'],
				times: ['TimesNow-SemiLight', 'Georgia', 'serif'],
				timesItalic: ['TimesNow-LightItalic', 'Georgia', 'serif'],
				timesNowSemi: ['TimesNow-Semi-Light', 'Georgia', 'serif'],
				futura: ['Futura Medium', 'Futura', 'sans-serif'],
				futuraLight: ['Futura Light', 'Futura', 'sans-serif'],
				futuraMd: ['"Futura Md BT"', 'Futura Medium', 'sans-serif'],
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'slide-in': {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'slide-in': 'slide-in 0.4s ease-out forwards',
				'scale-in': 'scale-in 0.3s ease-out forwards',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
			},
			boxShadow: {
				'luxury': '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
				'luxury-hover': '0 6px 18px 0 rgba(0, 0, 0, 0.08)',
				// Ajout des ombres de la charte Gadait
				'gadait': '0 2px 8px rgba(0, 0, 0, 0.1)',
				'gadait-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
