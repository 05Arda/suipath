"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Settings, Ticket, Heart } from "lucide-react";

// Veri importu
import { EVENTS, MOCK_USER } from "@/utils/data";

// YENİ SWIPER BİLEŞENİNİ IMPORT EDİYORUZ
import EventSwiper from "@/components/eventSwiper";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState("tickets");

  const user = MOCK_USER;

  // Veri filtreleme
  const joinedEvents = EVENTS.filter((event) =>
    user.joinedEventIds.includes(event.id)
  );
  const favoriteEvents = EVENTS.filter((event) =>
    user.favoriteEventIds.includes(event.id)
  );

  const currentList = activeTab === "tickets" ? joinedEvents : favoriteEvents;

  return (
    <div className="min-h-screen w-[80%] mx-auto bg-deep-bg pb-24">
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-40 bg-deep-bg/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="p-2 bg-card-bg rounded-full text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-white text-lg">Profil</span>
        <button className="p-2 bg-card-bg rounded-full text-white hover:bg-white/10 transition-colors">
          <Settings size={20} />
        </button>
      </div>

      {/* --- PROFİL BİLGİLERİ --- */}
      <div className="flex flex-col items-center mt-6 px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-cyan blur-2xl opacity-40 rounded-full transform scale-110" />
          <div className="relative w-28 h-28 rounded-full border-4 border-card-bg overflow-hidden shadow-2xl">
            <Image
              src={user.avatar}
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-1 right-1 bg-primary-cyan p-1.5 rounded-full border-2 border-deep-bg text-white">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-white">{user.name}</h1>
        <p className="text-primary-cyan text-sm font-medium">{user.username}</p>
        <p className="text-text-muted text-xs mt-1 bg-card-bg px-3 py-1 rounded-full border border-white/5">
          {user.role}
        </p>

        {/* İstatistikler */}
        <div className="flex items-center gap-8 mt-6 w-full max-w-xs justify-center bg-card-bg p-4 rounded-2xl border border-white/5 shadow-lg">
          <div className="text-center">
            <span className="block text-xl font-bold text-white">
              {user.followers}
            </span>
            <span className="text-xs text-text-muted">Takipçi</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <span className="block text-xl font-bold text-white">
              {user.following}
            </span>
            <span className="text-xs text-text-muted">Takip</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <span className="block text-xl font-bold text-white">
              {user.joinedEventIds.length}
            </span>
            <span className="text-xs text-text-muted">Etkinlik</span>
          </div>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="mt-8 px-4">
        <div className="flex p-1 bg-card-bg rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2
              ${
                activeTab === "tickets"
                  ? "bg-primary-cyan text-white shadow-lg"
                  : "text-text-muted hover:text-white"
              }`}
          >
            <Ticket size={16} />
            <h1 className="text-white text-xl font-bold">Past Events</h1>
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2
              ${
                activeTab === "favorites"
                  ? "bg-red-500 text-white shadow-lg"
                  : "text-text-muted hover:text-white"
              }`}
          >
            <Heart size={16} />
            <h1 className="text-white text-xl font-bold">Favorites</h1>
          </button>
        </div>
      </div>

      {/* --- ETKİNLİK LİSTESİ (ARTIK SWIPER KULLANIYOR) --- */}
      <div className="mt-4 px-2">
        {currentList.length === 0 ? (
          <div className="text-center py-10 opacity-50 bg-card-bg/50 rounded-2xl mx-2 border border-white/5 border-dashed">
            <p className="text-text-muted">Henüz burada bir şey yok.</p>
          </div>
        ) : (
          // Burada reusable EventSwiper bileşenini kullanıyoruz
          <EventSwiper events={currentList} />
        )}
      </div>
      <div className="mt-4 px-2">
        <h1 className="text-white text-3xl font-bold">NFTs Earned</h1>
        <EventSwiper events={currentList} />
      </div>
    </div>
  );
}
