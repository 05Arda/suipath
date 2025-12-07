"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Ticket, Heart, AlertCircle } from "lucide-react";

import { useCurrentAccount } from "@mysten/dapp-kit";

import { EVENTS, MOCK_USER } from "@/utils/data";

import EventSwiper from "@/components/eventSwiper";
import NftSwiper from "@/components/nftSwiper";
import { setStyle } from "framer-motion";

// Footer import edilmemişse veya kullanılmıyorsa bu sayfada kaldırılabilir,
// ama main layout'ta varsa burada tekrar çağırmak yerine children olarak gelebilir.
// import Footer from "@/components/footer";

export default function ProfilePage({
  userId = null,
  activeTab,
  setActiveTab,
}) {
  const router = useRouter();
  const params = useParams();
  const account = useCurrentAccount();

  // Hedef adresi belirle: Prop olarak geldiyse onu, yoksa URL'den, yoksa cüzdandan
  const targetAddress = userId || params?.id;
  const isMyProfile = account?.address === targetAddress;

  let user = null;

  if (targetAddress) {
    // 1. DÜZELTME: Veriyi direkt adresi key olarak kullanarak çekiyoruz
    const foundUser = MOCK_USER[targetAddress];

    if (foundUser) {
      // Eğer mock datada bu kullanıcı kayıtlıysa veriyi al
      user = { ...foundUser, walletAddress: targetAddress };
    } else if (isMyProfile) {
      // 2. DÜZELTME: Kullanıcı veritabanında yoksa ama cüzdan bağlıysa (Yeni Üye)
      // Sayfa patlamasın diye varsayılan boş bir profil oluşturuyoruz.
      user = {
        name: "New User",
        username: `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`,
        role: "Explorer",
        // Varsayılan bir avatar (DiceBear API örneği veya static resim)
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${targetAddress}`,
        followers: 0,
        following: 0,
        joinedEventIds: [],
        favoriteEventIds: [],
        earnedNftIds: [],
        walletAddress: targetAddress,
      };
    }
    // Not: Eğer başkasının profiline bakılıyorsa ve veri yoksa user null kalır.
  }

  // --- KULLANICI YOKSA HATA EKRANI ---
  if (!user) {
    return (
      <div className="min-h-screen bg-deep-bg flex flex-col items-center justify-center p-4 text-center">
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
            // Router varsa anasayfaya dön, yoksa tab değiştir
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

  // --- KULLANICI VARSA DEVAM ET ---

  // 3. DÜZELTME: Güvenli veri erişimi (Optional Chaining ve Default Array)
  // user.joinedEventIds undefined olsa bile [] olarak kabul et ki filter patlamasın.
  const safeJoinedIds = user.joinedEventIds || [];
  const safeFavoriteIds = user.favoriteEventIds || [];
  const safeNftIds = user.earnedNftIds || [];

  const joinedEvents = EVENTS.filter((event) =>
    safeJoinedIds.includes(event.id)
  );

  const favoriteEvents = EVENTS.filter((event) =>
    safeFavoriteIds.includes(event.id)
  );

  return (
    <div className="min-h-screen bg-deep-bg p-4 sm:p-12 pb-32">
      {/* --- PROFILE INFO --- */}
      <div className="flex flex-col items-center mt-6 px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-cyan blur-2xl opacity-40 rounded-full transform scale-110" />
          <div className="relative w-28 h-28 rounded-full border-4 border-card-bg overflow-hidden shadow-2xl bg-gray-800">
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

        {/* Statistics */}
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
              {safeJoinedIds.length}
            </span>
            <span className="text-xs text-text-muted">Etkinlik</span>
          </div>
        </div>
      </div>

      {/* --- EVENT LIST --- */}
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
            <EventSwiper events={joinedEvents} />
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
            <EventSwiper events={favoriteEvents} />
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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}
        </div>
      </div>
    </div>
  );
}
