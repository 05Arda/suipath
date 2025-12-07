"use client";
import React, { useState, useEffect, useCallback } from "react";

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
import AdminPanel from "@/components/adminPanel";
import WalrusPage from "@/components/walrusTest";

// --- SERVER ACTIONS ---
// DÜZELTME: createUser fonksiyonunu import ettik
import { getEvents, getNFTs, getUserProfile, createUser } from "@/app/actions";

// --- SUI CONFIG ---
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});
const queryClient = new QueryClient();

function MainContent() {
  const [activeTab, setActiveTab] = useState("home");
  const account = useCurrentAccount();

  // --- STATE ---
  const [eventsData, setEventsData] = useState([]);
  const [nftsData, setNftsData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. KULLANICI VERİSİNİ ÇEKME & OLUŞTURMA ---
  const fetchUserData = useCallback(async () => {
    if (account?.address) {
      try {
        // 1. Kullanıcıyı veritabanında ara
        let profile = await getUserProfile(account.address);

        // 2. Eğer kullanıcı YOKSA -> Oluştur (Otomatik Kayıt)
        if (!profile) {
          console.log("Yeni kullanıcı tespit edildi, oluşturuluyor...");
          const result = await createUser(account.address);

          if (result.success) {
            // Oluşturulduktan sonra tekrar çek
            profile = await getUserProfile(account.address);
          }
        }

        // 3. Profili state'e at
        setUserProfile(profile);
      } catch (error) {
        console.error("Profil işlemi hatası:", error);
      }
    } else {
      setUserProfile(null);
    }
  }, [account]); // account değişince (login olunca) çalışır

  // --- 2. GENEL VERİLERİ ÇEK ---
  const fetchGeneralData = async () => {
    try {
      const events = await getEvents();
      const nfts = await getNFTs();
      setEventsData(events);
      setNftsData(nfts);
    } catch (error) {
      console.error("Genel veri hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneralData();
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData, activeTab]);

  const renderContent = () => {
    if (loading)
      return <div className="text-white text-center mt-20">Yükleniyor...</div>;

    const userComponent = account ? (
      <div className="relative w-full h-full">
        <ProfilePage
          key={account.address}
          userId={account.address}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userProfile={userProfile}
          events={eventsData}
          nfts={nftsData}
        />
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center w-screen h-[80vh] text-white space-y-4">
        <p className="text-lg font-medium text-center">
          Profilinizi görmek için lütfen cüzdanınızı bağlayın.
        </p>
        <ConnectButton
          className="!bg-primary-cyan !text-white !rounded-full !font-bold hover:!bg-white hover:!text-primary-cyan transition-all"
          connectText="Cüzdan Bağla"
        />
      </div>
    );

    const pages = {
      home: (
        <HomePage
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          events={eventsData}
        />
      ),
      calendar: <CalendarPage events={eventsData} />,
      user: userComponent,
      map: <MapPage events={eventsData} />,
      admin: <AdminPanel />,
      walrus: <WalrusPage />,
      recommendedEvents: (
        <Events events={eventsData} filterTag={"recommended"} />
      ),
      allEvents: <Events events={eventsData} />,

      joinedEvents: (
        <Events
          events={eventsData.filter((event) => {
            if (!userProfile?.joinedEventIds) return false;
            return userProfile.joinedEventIds.some(
              (id) => String(id) === String(event.id)
            );
          })}
        />
      ),

      favoriteEvents: (
        <Events
          events={eventsData.filter((event) => {
            if (!userProfile?.favoriteEventIds) return false;
            return userProfile.favoriteEventIds.some(
              (id) => String(id) === String(event.id)
            );
          })}
        />
      ),

      nftGallery: (
        <NFTGallery
          nfts={nftsData.filter((nft) => {
            if (!userProfile?.earnedNftIds) return false;
            return userProfile.earnedNftIds.some(
              (id) => String(id) === String(nft.id)
            );
          })}
        />
      ),
    };

    return (
      pages[activeTab] || (
        <HomePage
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          events={eventsData}
        />
      )
    );
  };

  return (
    <div className="min-h-screen flex w-full flex-col to-primary-blue font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      {/*
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
      </div>*/}

      <main className="flex-1 w-full h-full flex flex-col bg-deep-bg items-center sm:items-start bg-transparent relative z-0">
        {renderContent()}
      </main>

      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <MainContent />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
