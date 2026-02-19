/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#C2410C", // Deep Saffron
                secondary: "#EAB308", // Turmeric Gold
                accent: "#7F1D1D", // Maroon
                background: "#FFF8ED", // Cream Background
                text: "#1F2937", // Charcoal Text
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
        },
    },
    plugins: [],
}
