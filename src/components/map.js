"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// MapView bileşenini dinamik import ediyoruz
const MapView = dynamic(() => import("@/components/map-view"), {
  loading: () => (
    // Yükleme ekranının arka planını da istediğiniz renk yaptık
    <div
      className="w-full h-full flex flex-col items-center justify-center text-primary-cyan"
      style={{ backgroundColor: "#023338" }}
    >
      <Loader2 size={48} className="animate-spin mb-4" />
      <p className="text-sm font-medium animate-pulse">Harita Yükleniyor...</p>
    </div>
  ),
  ssr: false,
});

export default function MapPage({ events }) {
  return (
    // DÜZELTME BURADA:
    // 1. bg-white SİLİNDİ.
    // 2. style={{ backgroundColor: "#023338" }} EKLENDİ.
    <div
      className="w-full h-screen max-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#023338" }}
    >
      <MapView events={events} />
    </div>
  );
}
