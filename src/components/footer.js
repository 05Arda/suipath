// components/footer.js
"use client";
import React from "react";
import { House, Map, User, Calendar, Settings } from "lucide-react";
import { motion } from "framer-motion"; // Kütüphaneyi import ediyoruz

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: House },
  { id: "map", label: "Map", icon: Map },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "user", label: "User", icon: User },
];

export default function Footer({ activeTab, onTabChange }) {
  return (
    <footer
      className={`${
        activeTab == "map" ? "absolute" : "sticky"
      } bottom-10 z-50 flex justify-center w-full ${
        activeTab == "map" ? "" : "mt-auto mb-6"
      }`}
    >
      {/* layout: Flex kutusunun boyut değişimlerinde animasyonu pürüzsüzleştirir
       */}
      <motion.nav
        layout
        className="flex flex-row items-center gap-2 p-3 bg-ocean-dark/90 backdrop-blur-md rounded-full shadow-2xl border border-white/10"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (item.id === "user") {
                  window.location.href = "/profile/101/"; // Kullanıcıyı profile sayfasına yönlendir
                }
              }}
              className="relative flex items-center justify-center px-4 py-3 rounded-full transition-colors duration-300"
              style={{
                WebkitTapHighlightColor: "transparent", // Mobilde tıklama mavisini kaldırır
              }}
            >
              {/* --- KAYAN ARKA PLAN (THE MAGIC) --- */}
              {/* Sadece aktif olan butonun içinde render olur ama layoutId sayesinde Framer Motion bunu eski yerinden yeni yerine kaydırır. */}
              {isActive && (
                <motion.div
                  layoutId="active-pill" // BU ID ÇOK ÖNEMLİ: Hepsi aynı ID'yi paylaştığı için React bunu "aynı obje" sanıp yerini değiştirir.
                  className="absolute inset-0 bg-gray-100/20 rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}

              {/* --- İÇERİK (İKON VE YAZI) --- */}
              {/* Z-index 10 veriyoruz ki arka planın üstünde kalsınlar */}
              <div className="relative z-10 flex items-center">
                {/* İKON */}
                <Icon
                  size={isActive ? 28 : 24}
                  strokeWidth={isActive ? 2.5 : 2}
                  // Renk değişimi: Aktifse beyaz, değilse cyan
                  className={`transition-colors duration-300 ${
                    isActive ? "text-white" : "text-primary-cyan"
                  }`}
                />

                {/* YAZI: SAĞA DOĞRU KAYARAK AÇILMA */}
                <span
                  className={`
                                    whitespace-nowrap overflow-hidden font-medium
                                    transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                                    ${
                                      isActive
                                        ? "text-white text-xl opacity-100 translate-x-0 ml-2" // AÇIK
                                        : "max-w-0 opacity-0 -translate-x-4 ml-0" // KAPALI
                                    }
                                `}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </motion.nav>
    </footer>
  );
}
