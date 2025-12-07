"use client";
import React, { useState } from "react";

// --- Sui & Walrus Importları ---
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import { Transaction } from "@mysten/sui/transactions";

// 1. ÖNEMLİ: CSS Stil Dosyası (Cüzdan butonu için şart)
import "@mysten/dapp-kit/dist/index.css";

// 2. Güvenlik Modülü (utils/security.js)
//import { sealData, unsealData } from "@/utils/security";

// --- Mevcut Bileşen Importlarınız ---
import Footer from "@/components/footer";
import Header from "@/components/header";
import HomePage from "@/components/main";
import MapPage from "@/components/map";
import ProfilePage from "@/app/profile/[id]/page";
import CalendarPage from "@/components/calendar";

import WalrusPage from "@/components/walrus";

import AdminPanel from "@/components/adminPanel";

// --- SUI CONFIG (Provider Ayarları) ---
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});
const queryClient = new QueryClient();

export default function Page() {
  const [activeTab, setActiveTab] = useState("home");
  const account = useCurrentAccount();

  const renderContent = () => {
    const userComponent = account ? (
      <div className="relative w-full h-full">
        <ProfilePage
          userId={account.address}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-full text-white space-y-4">
        <p className="text-lg font-medium">
          Profilinizi görmek için cüzdan bağlayın.
        </p>
        {/* Buraya ConnectButton da koyabilirsin */}
      </div>
    );

    const pages = {
      home: <HomePage />,
      calendar: <CalendarPage />,
      user: userComponent,
      map: <MapPage />,
      walrus: <WalrusPage />,
      admin: <AdminPanel />,
    };
    return pages[activeTab] || <HomePage />;
  };

  return (
    // 1. TÜM SAYFAYI SUI PROVIDER'LARI İLE SARMALIYORUZ
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <div className="min-h-screen flex w-full flex-col bg-gradient-to-tr from-deep-bg from-[20%] to-primary-blue font-sans">
            <Header onTabChange={setActiveTab} activeTab={activeTab} />

            {/* Geçici Test Navigasyonu */}
            <div className="flex flex-row justify-center gap-4 mt-2 bg-white/10 p-2 backdrop-blur-sm">
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

            <main className="flex-1 w-full h-full flex flex-col items-center sm:items-start">
              {renderContent()}
            </main>

            <Footer activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
