/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#C2410C", // Saffron
                secondary: "#EAB308", // Turmeric
                accent: "#7F1D1D", // Maroon
                background: "#FFF8ED", // Cream
                text: "#1F2937", // Charcoal
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
        },
    },
    plugins: [],
}
