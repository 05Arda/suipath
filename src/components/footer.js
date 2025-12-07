// components/footer.js
"use client";
import React, { useState } from "react";
import { House, Map, User, Calendar, Wallet } from "lucide-react"; // Wallet ikonu eklendi
import { motion, AnimatePresence } from "framer-motion"; // AnimatePresence eklendi
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: House },
  { id: "map", label: "Map", icon: Map },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "user", label: "Profile", icon: User },
];

export default function Footer({ activeTab, onTabChange }) {
  const router = useRouter();
  const account = useCurrentAccount();

  // Uyarı mesajını göstermek için state
  const [showLoginWarning, setShowLoginWarning] = useState(false);

  const handleTabClick = (itemId) => {
    onTabChange(itemId);
    /*
    if (itemId === "user") {
      if (account) {
        // Cüzdan bağlıysa profile git
        router.push(`/profile/${account.address}`);
        onTabChange(itemId);
      } else {
        // --- CÜZDAN BAĞLI DEĞİLSE UYARIYI GÖSTER ---
        setShowLoginWarning(true);

        // 3 saniye sonra uyarıyı otomatik kapat
        setTimeout(() => {
          setShowLoginWarning(false);
        }, 3000);
      }
    } else {
    }*/
  };

  return (
    <footer
      className={`${
        activeTab === "map" ? "absolute" : "sticky"
      } bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center justify-center w-auto max-w-fit`}
    >
      {/* --- GİRİŞ YAPILMADI UYARISI (ANIMASYONLU) --- */}
      <AnimatePresence>
        {showLoginWarning && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-12 bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl border border-red-400/30 whitespace-nowrap"
          >
            <Wallet size={16} className="text-white" />
            <span>Lütfen önce cüzdanınızı bağlayın!</span>
            {/* Küçük bir ok işareti (Triangle) */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500/90 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- NAV BAR --- */}
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
              onClick={() => handleTabClick(item.id)}
              className="relative flex items-center justify-center px-4 py-3 rounded-full transition-colors duration-300"
              style={{
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-gray-100/20 rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}

              <div className="relative z-10 flex items-center">
                <Icon
                  size={isActive ? 28 : 24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${
                    isActive ? "text-white" : "text-primary-cyan"
                  }`}
                />

                <span
                  className={`
                    whitespace-nowrap overflow-hidden font-medium
                    transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                    ${
                      isActive
                        ? "text-white text-xl opacity-100 translate-x-0 ml-2"
                        : "max-w-0 opacity-0 -translate-x-4 ml-0"
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
