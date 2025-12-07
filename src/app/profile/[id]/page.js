"use client";
import React, { useState, useEffect } from "react"; // useEffect eklendi
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Ticket, Heart, AlertCircle } from "lucide-react"; // AlertCircle ikonu eklendi

import { useCurrentAccount } from "@mysten/dapp-kit"; // Cüzdan kontrolü için

// Veri importu
import { EVENTS, MOCK_USER } from "@/utils/data";

// YENİ SWIPER BİLEŞENİNİ IMPORT EDİYORUZ
import EventSwiper from "@/components/eventSwiper";
import NftSwiper from "@/components/nftSwiper";

import Footer from "@/components/footer";

export default function ProfilePage({
  userId = null,
  activeTab,
  setActiveTab,
}) {
  const router = useRouter();
  const params = useParams();
  const account = useCurrentAccount();

  const targetAddress = userId || params?.id;
  const isMyProfile = account?.address === targetAddress;

  let user = null;
  if (targetAddress) {
    // Mock veriyi kopyala ve adresini güncelle (Simülasyon)
    user = { ...MOCK_USER, walletAddress: targetAddress };

    // Eğer bu benim profilimse ismi "Siz" yapabiliriz veya cüzdandan gelen veriyi kullanabiliriz.
    if (isMyProfile) {
      user.name = "My Account"; // veya account.label
      user.username = `${targetAddress.slice(0, 6)}...${targetAddress.slice(
        -4
      )}`;
    }
  }
  // Eğer kullanıcı yoksa, Loading veya Hata ekranı gösterip işlemi durduruyoruz.
  // Bu kontrol return'den önce yapılmalı.
  if (!targetAddress) {
    return (
      <div className="min-h-screen bg-deep-bg flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-500/10 p-6 rounded-full mb-4 animate-pulse">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          No Such User Found
        </h2>
        <p className="text-text-muted mb-6">
          The profile you are looking for does not exist or may have been
          deleted.
        </p>
        <button
          onClick={() => {
            router.push("/");
            setActiveTab("home");
          }}
          className="px-6 py-3 bg-primary-cyan text-white rounded-xl font-bold hover:bg-white hover:text-black transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- KULLANICI VARSA DEVAM ET ---

  // Veri filtreleme
  const joinedEvents = EVENTS.filter((event) =>
    user.joinedEventIds.includes(event.id)
  );
  const favoriteEvents = EVENTS.filter((event) =>
    user.favoriteEventIds.includes(event.id)
  );
  // Hata önleme: user.earnedNftIds undefined ise boş dizi ata
  const earnedNfts = user.earnedNftIds || [];

  return (
    <div className="min-h-screen bg-deep-bg p-12">
      {/* --- PROFILE INFO --- */}
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
              {user.joinedEventIds.length}
            </span>
            <span className="text-xs text-text-muted">Etkinlik</span>
          </div>
        </div>
      </div>

      {/* --- EVENT LIST (NOW USING SWIPER) --- */}
      <div className="mt-4 px-2 w-[90%] mx-auto">
        <div className="flex flex-row justify-between">
          <h1 className="text-white text-2xl font-bold pl-2 mb-2">
            Joined Events
          </h1>
          <p className="italic underline text-white self-end select-none cursor-pointer text-sm hover:text-gray-300 transition-colors">
            Show more
          </p>
        </div>
        {joinedEvents.length === 0 ? (
          <div className="text-center py-10 opacity-50 bg-card-bg/50 rounded-2xl mx-2 border border-white/5 border-dashed">
            <p className="text-text-muted">Henüz burada bir şey yok.</p>
          </div>
        ) : (
          <EventSwiper events={joinedEvents} />
        )}

        <div className="flex flex-row justify-between">
          <h1 className="text-white text-2xl font-bold pl-2 mb-2">
            Favorite Events
          </h1>
          <p className="italic underline text-white self-end select-none cursor-pointer text-sm hover:text-gray-300 transition-colors">
            Show more
          </p>
        </div>
        {favoriteEvents.length === 0 ? (
          <div className="text-center py-10 opacity-50 bg-card-bg/50 rounded-2xl mx-2 border border-white/5 border-dashed">
            <p className="text-text-muted">Henüz burada bir şey yok.</p>
          </div>
        ) : (
          <EventSwiper events={favoriteEvents} />
        )}
      </div>

      {/* --- NFT LIST --- */}
      <div className="mt-4 px-2 w-[90%] mx-auto">
        <div className="flex flex-row justify-between">
          <h1 className="text-white text-2xl font-bold pl-2 mb-2">
            NFTs Earned
          </h1>
          <p className="italic underline text-white self-end select-none cursor-pointer text-sm hover:text-gray-300 transition-colors">
            Show more
          </p>
        </div>

        {earnedNfts.length === 0 ? (
          <div className="text-center py-10 opacity-50 bg-card-bg/50 rounded-2xl mx-2 border border-white/5 border-dashed">
            <p className="text-text-muted">No NFTs earned yet.</p>
          </div>
        ) : (
          <NftSwiper filteredNftIds={earnedNfts} />
        )}
      </div>
    </div>
  );
}
