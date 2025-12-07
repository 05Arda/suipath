"use client";
import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import HomeSwiper from "@/components/homeSwiper";

export default function HomePage({ activeTab, setActiveTab, events = [] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // --- ARAMA FİLTRELEME MANTIĞI ---
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;

    const query = searchQuery.toLowerCase();

    return events.filter((event) => {
      const matchTitle = event.title?.toLowerCase().includes(query);
      const matchLocation = event.location?.toLowerCase().includes(query);
      const matchCategory = event.category?.toLowerCase().includes(query);
      return matchTitle || matchLocation || matchCategory;
    });
  }, [events, searchQuery]);

  return (
    <div className="flex flex-col w-full min-h-full px-4 py-4">
      {/* --- ARAMA ÇUBUĞU --- */}
      <div className="self-end w-full max-w-md m-3 px-2">
        <div className="relative group">
          <Search
            size={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-primary-cyan group-focus-within:text-white pointer-events-none transition-colors"
          />

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

          <div className="absolute inset-0 rounded-2xl bg-primary-cyan/20 blur-lg -z-10 opacity-0 group-focus-within:opacity-50 transition-opacity duration-500" />
        </div>
      </div>

      {/* --- 1. ANA LİSTE (Arama Sonuçları veya Tümü) --- */}
      <HomeSwiper
        Title={searchQuery ? "Arama Sonuçları" : "Tüm Etkinlikler"}
        swiperFilter={null}
        searchQuery={searchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        events={filteredEvents} // Filtrelenmiş listeyi gönderiyoruz
      />

      {/* --- 2. ÖNERİLENLER (Sadece arama yapılmıyorsa göster) --- */}
      {!searchQuery && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
          <HomeSwiper
            Title={"Sizin İçin Önerilenler"}
            swiperFilter={"recommended"}
            searchQuery={searchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            events={events} // Buraya ham veriyi gönderiyoruz (filtreleme içinde yapılıyor)
          />
        </div>
      )}

      {/* --- SONUÇ BULUNAMADI MESAJI --- */}
      {searchQuery && filteredEvents.length === 0 && (
        <div className="text-center text-text-muted mt-10 p-8 bg-card-bg/30 rounded-2xl border border-white/5">
          <p className="text-lg text-white font-bold mb-2">Sonuç Bulunamadı</p>
          <p className="text-sm">
            "{searchQuery}" aramasıyla eşleşen etkinlik yok.
          </p>
        </div>
      )}
    </div>
  );
}
