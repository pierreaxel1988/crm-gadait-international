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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
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
					'white': '#F5F5F0',       // Blanc Cassé (Loro Piana background)
					'pearl': '#E0E0E0',       // Gris Perle (light borders, subtle backgrounds)
					'sand': '#D3C5B4',        // Beige Sable (main accent color)
					'hazel': '#8B6F4E',       // Marron Noisette (primary brand color)
					'navy': '#2C3E50',        // Bleu Nuit (text color)
					'terracotta': 'rgb(157, 82, 72)', // Terracotta color for accents
					'text': 'rgb(33, 33, 33)', // Nearly black text color from image
					// Color scale for design system
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
					'dark': '#403E43',        // Dark Chocolate
					'light': '#8E9196',       // Light Chocolate
				},
				times: {
					'text': 'rgb(33, 33, 33)', // Exact RGB value from the image
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				serif: ['Playfair Display', 'serif'],
				luxury: ['Inter', 'sans-serif'],
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
				'pulse-soft': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
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
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
			},
			boxShadow: {
				'luxury': '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
				'luxury-hover': '0 6px 18px 0 rgba(0, 0, 0, 0.08)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
