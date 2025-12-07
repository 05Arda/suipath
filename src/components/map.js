// app/map/page.js
"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// MapView bileşenini dinamik import ediyoruz
const MapView = dynamic(() => import("@/components/map-view"), {
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-deep-bg text-primary-cyan">
      <Loader2 size={48} className="animate-spin mb-4" />
      <p className="text-sm font-medium animate-pulse">Harita Yükleniyor...</p>
    </div>
  ),
  ssr: false,
});

export default function MapPage({ events }) {
  return (
    // DEĞİŞİKLİK BURADA:
    // 1. h-full: Yüksekliği kapsayıcıya (main) göre doldurur.
    // 2. overflow-hidden: Kaydırma çubuğunu kesin olarak engeller.
    // 3. relative: İçindeki absolute elemanlar buna göre konumlanır.
    <div className="w-full h-screen max-h-screen relative bg-white overflow-hidden">
      <MapView events={events} />
    </div>
  );
}
