"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";

import EventSwiper from "@/components/eventSwiper";
import NftSwiper from "@/components/nftSwiper";

// --- SABİT DEĞERLER ---
// Varsayılan gri avatar (Unsplash'ten veya public klasöründen)
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60";

export default function ProfilePage({
  userId = null,
  activeTab,
  setActiveTab,
  userProfile = null, // MainContent'ten gelen DB verisi
  events = [], // MainContent'ten gelen Tüm Etkinlikler
  nfts = [], // MainContent'ten gelen Tüm NFT'ler
}) {
  const router = useRouter();
  const params = useParams();
  const account = useCurrentAccount();

  // Hedef adresi belirle: Prop -> URL Param -> Cüzdan
  const targetAddress = userId || params?.id;
  const isMyProfile = account?.address === targetAddress;

  let displayUser = null;

  // 1. KULLANICI VERİSİNİ BELİRLEME MANTIĞI
  if (userProfile) {
    // A) Veritabanından veri geldiyse onu kullan
    displayUser = userProfile;
  } else if (isMyProfile && targetAddress) {
    // B) Veritabanında yok ama cüzdan bağlı (Yeni Üye)
    // Sayfa patlamasın diye varsayılan bir profil oluşturuyoruz
    displayUser = {
      name: "New User",
      username: `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`,
      role: "Explorer",
      // Dinamik varsayılan avatar
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${targetAddress}`,
      followers: 0,
      following: 0,
      joinedEventIds: [],
      favoriteEventIds: [],
      earnedNftIds: [],
      walletAddress: targetAddress,
    };
  }

  // --- AVATAR YÖNETİMİ (Kırık Link Koruması) ---
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);

  // displayUser değiştiğinde avatar state'ini güncelle
  useEffect(() => {
    if (displayUser?.avatar) {
      setAvatarSrc(displayUser.avatar);
    } else if (targetAddress) {
      setAvatarSrc(
        `https://api.dicebear.com/9.x/avataaars/svg?seed=${targetAddress}`
      );
    }
  }, [displayUser, targetAddress]);

  // --- KULLANICI YOKSA HATA EKRANI ---
  if (!displayUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-500/10 p-6 rounded-full mb-4 animate-pulse">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-text-muted mb-6">
          The profile you are looking for ({targetAddress?.slice(0, 6)}...) does
          not exist or has no data.
        </p>
        <button
          onClick={() => {
            if (setActiveTab) setActiveTab("home");
            else router.push("/");
          }}
          className="px-6 py-3 bg-primary-cyan text-white rounded-xl font-bold hover:bg-white hover:text-black transition-all"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  // 2. VERİLERİ GÜVENLİ FİLTRELEME
  const safeJoinedIds = displayUser.joinedEventIds || [];
  const safeFavoriteIds = displayUser.favoriteEventIds || [];
  const safeNftIds = displayUser.earnedNftIds || [];

  // ID'si eşleşen etkinlikleri bul
  const joinedEvents = events.filter((event) =>
    safeJoinedIds.includes(event.id)
  );
  const favoriteEvents = events.filter((event) =>
    safeFavoriteIds.includes(event.id)
  );

  return (
    <div className="min-h-screen bg-deep-bg/50 p-4 sm:p-12 pb-32">
      {/* --- PROFILE INFO --- */}
      <div className="flex flex-col items-center mt-6 px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-cyan blur-2xl opacity-40 rounded-full transform scale-110" />
          <div className="relative w-28 h-28 rounded-full border-4 border-card-bg overflow-hidden shadow-2xl bg-gray-800">
            <Image
              src={avatarSrc}
              alt={displayUser.name}
              fill
              className="object-cover"
              // Eğer resim yüklenemezse (404), varsayılan avatarı göster
              onError={() => setAvatarSrc(DEFAULT_AVATAR)}
            />
          </div>
          <div className="absolute bottom-1 right-1 bg-primary-cyan p-1.5 rounded-full border-2 border-deep-bg text-white">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-white">
          {displayUser.name}
        </h1>
        <p className="text-primary-cyan text-sm font-medium">
          {displayUser.username}
        </p>
        <p className="text-text-muted text-xs mt-1 bg-card-bg px-3 py-1 rounded-full border border-white/5">
          {displayUser.role}
        </p>

        {/* Statistics */}
        <div className="flex items-center gap-8 mt-6 w-full max-w-xs justify-center bg-card-bg p-4 rounded-2xl border border-white/5 shadow-lg">
          <div className="text-center">
            <span className="block text-xl font-bold text-white">
              {displayUser.followers}
            </span>
            <span className="text-xs text-text-muted">Takipçi</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <span className="block text-xl font-bold text-white">
              {displayUser.following}
            </span>
            <span className="text-xs text-text-muted">Takip</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <span className="block text-xl font-bold text-white">
              {safeJoinedIds.length}
            </span>
            <span className="text-xs text-text-muted">Etkinlik</span>
          </div>
        </div>
      </div>

      {/* --- EVENT & NFT LISTS --- */}
      <div className="mt-8 px-2 w-full lg:w-[90%] mx-auto space-y-8">
        {/* Joined Events Section */}
        <div>
          <div className="flex flex-row justify-between items-end mb-4">
            <h1 className="text-white text-2xl font-bold pl-2">
              Joined Events
            </h1>
            <button
              className="italic underline text-white text-sm hover:text-primary-cyan transition-colors"
              onClick={() => setActiveTab && setActiveTab("joinedEvents")}
            >
              Show more
            </button>
          </div>
          {joinedEvents.length === 0 ? (
            <div className="text-center py-10 opacity-50 bg-card-bg/50 rounded-2xl mx-2 border border-white/5 border-dashed">
              <p className="text-text-muted">Not joined any events yet.</p>
            </div>
          ) : (
            <EventSwiper events={joinedEvents} fromPage="profile" />
          )}
        </div>

        {/* Favorite Events Section */}
        <div>
          <div className="flex flex-row justify-between items-end mb-4">
            <h1 className="text-white text-2xl font-bold pl-2">
              Favorite Events
            </h1>
            <button
              className="italic underline text-white text-sm hover:text-primary-cyan transition-colors"
              onClick={() => setActiveTab && setActiveTab("favoriteEvents")}
            >
              Show more
            </button>
          </div>
          {favoriteEvents.length === 0 ? (
            <div className="text-center py-10 opacity-50 bg-card-bg/50 rounded-2xl mx-2 border border-white/5 border-dashed">
              <p className="text-text-muted">No favorites yet.</p>
            </div>
          ) : (
            <EventSwiper events={favoriteEvents} fromPage="profile" />
          )}
        </div>

        {/* NFT List Section */}
        <div>
          <div className="flex flex-row justify-between items-end mb-4">
            <h1 className="text-white text-2xl font-bold pl-2">NFTs Earned</h1>
            <span
              className="text-white text-sm cursor-pointer italic underline "
              onClick={() => setActiveTab("nftGallery")}
            >
              Show more
            </span>
          </div>

          {safeNftIds.length === 0 ? (
            <div className="text-center py-10 opacity-50 bg-card-bg/50 rounded-2xl mx-2 border border-white/5 border-dashed">
              <p className="text-text-muted">No NFTs earned yet.</p>
            </div>
          ) : (
            <NftSwiper
              filteredNftIds={safeNftIds}
              nfts={nfts} // <--- KRİTİK DÜZELTME: Tüm NFT verisini buraya iletiyoruz
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}
        </div>
      </div>
    </div>
  );
}
