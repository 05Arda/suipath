"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";
import HomeSwiper from "@/components/homeSwiper";
import { EVENTS } from "@/utils/data";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col w-full min-h-full bg-deep-bg px-4 py-8 pt-20">
      {/* --- SEARCH BAR --- */}
      <div className="self-end w-full max-w-md m-3 px-2">
        {" "}
        {/* w-2xl yerine max-w-md daha kontrollü olur */}
        <div className="relative group">
          {/* İKON DÜZELTMELERİ:
              1. z-10: Inputun üstüne çıkması için (bulanıklığı engeller).
              2. pointer-events-none: İkona tıklayınca inputun focuslanması için.
              3. text-primary-cyan: Varsayılan renk (focus olunca beyaz oluyor).
              4. size={20}: İkon boyutu.
          */}
          <Search
            size={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-primary-cyan group-focus-within:text-white pointer-events-none transition-colors"
          />

          {/* Input */}
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-card-bg/50 border border-white/10 rounded-2xl 
                       text-white placeholder-text-muted focus:outline-none focus:bg-card-bg 
                       focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan 
                       transition-all shadow-lg backdrop-blur-md relative z-0"
            placeholder="Etkinlik, konum veya kategori ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Hafif Glow Efekti */}
          <div className="absolute inset-0 rounded-2xl bg-primary-cyan/20 blur-lg -z-10 opacity-0 group-focus-within:opacity-50 transition-opacity duration-500" />
        </div>
      </div>

      {/* --- SWIPERS --- */}
      <HomeSwiper
        Title={"Tüm Etkinlikler"}
        swiperFilter={null}
        searchQuery={searchQuery}
      />
      <HomeSwiper
        Title={"Sizin İçin Önerilenler"}
        swiperFilter={"reccomended"}
        searchQuery={searchQuery}
      />
    </div>
  );
}
