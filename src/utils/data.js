// src/utils/data.js

export const MOCK_USER = {
  "0x504ed9d70e1330ca1e6d274e46d885be6fb2b1bbab298d2d9a7f537eaa0d9d3f": {
    name: "Arda Guler",
    username: "@ardaguler",
    role: "Community Manager",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    followers: 1240,
    following: 45,
    favoriteEventIds: [1, 3],
    joinedEventIds: [2, 4],
    earnedNftIds: [1, 3, 4],
  },
};

// utils/data.js

// ... (Mevcut EVENTS ve CATEGORIES kodları yukarıda)

export const NFTS = [
  {
    id: 1,
    title: "Cyber Ocean #001",
    creator: "@sui_artist",
    price: "150 SUI",
    image: "/nfts/bronze.jpeg",
    tier_name: "BRONZE",
  },
  {
    id: 2,
    title: "Neon Jellyfish",
    creator: "@deep_sea",
    price: "450 SUI",
    image: "/nfts/silver.jpeg",
    tier_name: "SILVER",
  },
  {
    id: 3,
    title: "Abstract Wave",
    creator: "@wave_maker",
    price: "80 SUI",
    image: "/nfts/gold.jpeg",
    tier_name: "GOLD",
  },
  {
    id: 4,
    title: "Glitch Coral",
    creator: "@digital_reef",
    price: "1200 SUI",
    image: "/nfts/platinium.jpeg",
    tier_name: "PLATINUM",
  },
];

export const CATEGORIES = [
  "Bootcamp",
  "Workshop",
  "Meetup",
  "Hackathon",
  "Exhibition",
];

export const EVENTS = [
  {
    id: 1,
    title: "Sui Blockchain Summit",
    category: "Meetup",
    date: "24 Nov, 2025",
    time: "14:00 - 18:00", // Yeni
    organizer: "Sui Foundation TR", // Yeni
    location: "Grand Pera, Istanbul",
    description:
      "Blokzincir dünyasının geleceğini şekillendiren Sui ekosistemi İstanbul'da buluşuyor. Geliştiriciler, yatırımcılar ve teknoloji meraklıları için kaçırılmayacak bir networking fırsatı. Etkinlik boyunca Move dili üzerine teknik atölyeler ve panel tartışmaları gerçekleşecek.", // Yeni
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
    attendees: 342,
    capacity: 400,
    price: "Free",
    tags: ["blockchain", "sui", "networking", "recommended"],
  },
  {
    id: 2,
    title: "Geophysics & AI Workshop",
    category: "Workshop",
    date: "02 Dec, 2025",
    time: "09:00 - 17:00",
    organizer: "Jeofizik Mühendisleri Odası",
    location: "ODTÜ KKM, Ankara",
    description:
      "Yapay zeka teknolojilerinin sismik veri işleme ve yorumlama süreçlerinde nasıl devrim yarattığını keşfedin. Python ve makine öğrenmesi algoritmalarının jeofizik verilerine uygulanması üzerine uygulamalı eğitimler verilecektir.",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000",
    attendees: 48,
    capacity: 50,
    price: "Free",
    tags: ["geophysics", "AI", "workshop"],
  },
  // ... diğer eventleri de benzer formatta güncelle
  {
    id: 3,
    title: "Neon Nights Music Fest",
    category: "Exhibition",
    date: "15 Dec, 2025",
    time: "20:00 - 02:00",
    organizer: "NightOwl Events",
    location: "KüçükÇiftlik Park",
    description:
      "Şehrin en iyi alternatif rock grupları ve elektronik müzik prodüktörleri aynı sahnede. Işık şovları, sanat enstalasyonları ve unutulmaz bir müzik deneyimi sizi bekliyor.",
    image:
      "https://images.unsplash.com/photo-1761839259484-4741afbbdcbf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    attendees: 120,
    capacity: 500,
    price: "₺450",
    tags: ["music", "festival", "neon", "recommended"],
  },
  {
    id: 4,
    title: "Global Hackathon 2025",
    category: "Hackathon",
    date: "20 Dec, 2025",
    time: "48 Saat",
    organizer: "Global Tech Hub",
    location: "Online",
    description:
      "Dünyanın dört bir yanından geliştiricilerle rekabet edin. 48 saat sürecek bu maratonda 'Sürdürülebilir Şehirler' teması üzerine çözümler geliştirilecek. Büyük ödül 50.000$.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c54be3852f33?auto=format&fit=crop&q=80&w=1000",
    attendees: 15,
    capacity: 100,
    price: "Free",
    tags: ["hackathon", "global", "sustainability", "recommended"],
  },
  {
    id: 5,
    title: "Full-Stack Bootcamp",
    category: "Bootcamp",
    date: "05 Jan, 2026 - 30 Jan, 2026",
    time: "Hafta İçi 18:00 - 21:00",
    organizer: "CodeMasters Academy",
    location: "Koç Üniversitesi, Istanbul",
    description:
      "Web geliştirme dünyasına hızlı bir giriş yapın. HTML, CSS, JavaScript, React ve Node.js gibi teknolojilerle tam donanımlı projeler geliştirin. Sınırlı kontenjan, erken kayıt avantajlarıyla yerinizi ayırtın.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000",
    attendees: 25,
    capacity: 30,
    price: "₺3000",
    tags: ["web development", "bootcamp", "full-stack"],
  },
  {
    id: 6,
    title: "Digital Art Expo",
    category: "Exhibition",
    date: "12 Jan, 2026 - 15 Jan, 2026",
    time: "10:00 - 20:00",
    organizer: "ArtVision Gallery",
    location: "Istanbul Modern",
    description:
      "Dijital sanatın en yeni ve en heyecan verici örneklerini keşfedin. NFT sanat eserlerinden interaktif enstalasyonlara kadar geniş bir yelpazede çalışmalar sergilenecek. Sanatçılarla tanışma ve atölye çalışmaları da etkinlik kapsamında.",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=1000",
    attendees: 200,
    capacity: 300,
    price: "₺100",
    tags: ["digital art", "exhibition", "NFT", "recommended"],
  },
];
