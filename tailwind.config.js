/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
    // Eğer src kullanmıyorsanız:
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- ANA RENKLER ---
        "primary-blue": "#00272C", // Butonlar, highlight
        "primary-cyan": "#278285", // Accent, hover / glow
        "aqua-light": "#278285", // Hafif arka planlar, chip/badge
        "ocean-dark": "#023338", // Uygulama ana arka planı
        "deep-bg": "#011820", // En koyu layer, body background

        // --- SEVİYE ROZETLERİ ---
        bronze: "#B96A2C",
        silver: "#C0C0C0",
        gold: "#FFD700",
        platinum: "#E5E4E2",

        // --- METİN RENKLERİ ---
        "text-primary": "#E5F6FF", // Başlık, ana metin
        "text-light": "#CFEAF5", // İkincil metin
        "text-muted": "#8BA6C1", // Placeholder / açıklama

        // --- KART & SINIRLAR ---
        "border-color": "#175152", // Kart kenarı, input border
        "card-color": "#CB883A", // Kart / navbar arka planı (Hex kodu)

        // (Not: Önceki kodlarda şeffaf kart kullanmıştık, uyumluluk için bu da kalabilir)
        "card-bg": "rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [],
};
