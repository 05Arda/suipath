"use client";
import React, { useState } from "react";

// --- Sui & Walrus Importları ---
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
  useCurrentAccount,
  ConnectButton,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";

// --- Bileşen Importları ---
import Footer from "@/components/footer";
import Header from "@/components/header";
import GloomyBackground from "@/components/background";

import HomePage from "@/components/main";
import MapPage from "@/components/map";
import ProfilePage from "@/app/profile/[id]/page";
import CalendarPage from "@/components/calendar";

import Events from "@/components/events";
import NFTGallery from "@/components/nftGallery";

import WalrusPage from "@/components/walrus";
import AdminPanel from "@/components/adminPanel";

import { EVENTS, NFTS, MOCK_USER } from "@/utils/data";

// --- SUI CONFIG ---
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});
const queryClient = new QueryClient();

// 1. İÇ BİLEŞEN (Mantık ve Hook'lar burada çalışır)
function MainContent() {
  const [activeTab, setActiveTab] = useState("home");
  // Provider bu bileşeni sarmaladığı için artık hook çalışır
  const account = useCurrentAccount();

  const renderContent = () => {
    // --- BURASI İSTEDİĞİNİZ DÜZELTME ---
    const userComponent = account ? (
      <div className="relative w-full h-full">
        <ProfilePage
          // ÖNEMLİ: key prop'u değiştiğinde React bu bileşeni tamamen yok edip yeniden oluşturur.
          // Cüzdan adresi değiştiğinde veya bağlandığında ProfilePage sıfırdan render olur.
          key={account.address}
          userId={account.address}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center w-screen h-[80vh] text-white space-y-4">
        <p className="text-lg font-medium text-center">
          Please connect your wallet to view your profile.
        </p>
        <ConnectButton
          className="!bg-primary-cyan !text-white !rounded-full !font-bold hover:!bg-white hover:!text-primary-cyan transition-all"
          connectText="Connect Wallet"
        />
      </div>
    );

    const pages = {
      home: <HomePage activeTab={activeTab} setActiveTab={setActiveTab} />,
      calendar: <CalendarPage />,
      user: userComponent,
      map: <MapPage />,
      admin: <AdminPanel />,

      recommendedEvents: <Events events={EVENTS} filterTag={"recommended"} />,
      allEvents: <Events events={EVENTS} />,

      joinedEvents: (
        <Events
          events={EVENTS.filter((event) => {
            if (!account?.address) return false;
            const userRecord = MOCK_USER[account.address];
            return userRecord?.joinedEventIds?.includes(event.id);
          })}
        />
      ),

      favoriteEvents: (
        <Events
          events={EVENTS.filter((event) => {
            if (!account?.address) return false;
            const userRecord = MOCK_USER[account.address];
            return userRecord?.favoriteEventIds?.includes(event.id);
          })}
        />
      ),

      nftGallery: (
        <NFTGallery
          nfts={NFTS.filter((nft) => {
            if (!account?.address) return false;
            const userRecord = MOCK_USER[account.address];
            return userRecord?.earnedNftIds?.includes(nft.id);
          })}
        />
      ),
    };

    return pages[activeTab] || <HomePage />;
  };

  return (
    <div className="min-h-screen flex w-full flex-col to-primary-blue font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Geçici Test Navigasyonu */}
      <div className="absolute transform -translate-x-1/2 left-1/2 top-20 z-40 flex flex-row justify-center gap-4 mt-2 bg-white/10 p-2 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab("walrus")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
            activeTab === "walrus"
              ? "bg-blue-500 text-white shadow-lg"
              : "text-gray-200 hover:bg-white/10"
          }`}
        >
          Test: Walrus DB
        </button>

        <button
          onClick={() => setActiveTab("admin")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
            activeTab === "admin"
              ? "bg-blue-500 text-white shadow-lg"
              : "text-gray-200 hover:bg-white/10"
          }`}
        >
          Admin Panel
        </button>
      </div>

      <main className="flex-1 w-full h-full flex flex-col items-center sm:items-start bg-transparent relative z-0">
        <div className="fixed top-0 left-0 w-full h-full bg-deep-bg/60 backdrop-blur-xs" />

        {renderContent()}
        <GloomyBackground />
      </main>

      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

// 2. ANA SAYFA (Sadece Provider'ları tutar)
export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {/* İçeriği ayrı bileşene aldık */}
          <MainContent />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
