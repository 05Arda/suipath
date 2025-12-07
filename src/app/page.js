"use client";
import React, { useState } from "react";

// --- Sui & Walrus Importları ---
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  ConnectButton,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";

// 1. ÖNEMLİ: CSS Stil Dosyası (Cüzdan butonu için şart)
import "@mysten/dapp-kit/dist/index.css";

// 2. Güvenlik Modülü (utils/security.js)
import { sealData, unsealData } from "@/utils/security";

// --- Mevcut Bileşen Importlarınız ---
import Footer from "@/components/footer";
import Header from "@/components/header";
import HomePage from "@/components/main";
import MapPage from "@/components/map";

import TestCalculator from "@/components/test";

// --- SUI CONFIG (Provider Ayarları) ---
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});
const queryClient = new QueryClient();

// --- WALRUS + SUI ENTEGRASYON SAYFASI (ŞİFRELİ & HATA KORUMALI) ---
const WalrusPage = () => {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // State'ler
  const [dataToUpload, setDataToUpload] = useState("");
  const [password, setPassword] = useState(""); // Şifreleme parolası
  const [status, setStatus] = useState("");
  const [storedBlobId, setStoredBlobId] = useState(null);
  const [decryptedView, setDecryptedView] = useState(""); // Çözülmüş veri

  // SABİTLER (Kendi Package ID'nizi buraya yazın)
  const PACKAGE_ID = "0x...SENİN_PACKAGE_ID_BURAYA...";

  // Walrus Endpointleri (Bazen biri çalışmazsa diğerini deneyebilirsiniz)
  const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
  const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

  // 1. ŞİFRELE VE YÜKLE
  const handleEncryptedUpload = async () => {
    if (!dataToUpload || !password)
      return alert("Lütfen veri ve parola giriniz!");
    setStatus("Veri şifreleniyor (Sealing)...");

    try {
      // A. Tarayıcıda Şifrele
      const sealedPayload = await sealData(dataToUpload, password);

      setStatus("Şifreli veri Walrus'a yükleniyor...");

      // B. Walrus'a Yükle (Gelişmiş Hata Yönetimi Ekli)
      const response = await fetch(`${WALRUS_PUBLISHER}/v1/store`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream", // Veri tipi belirtmek önemlidir
        },
        body: sealedPayload,
      });

      // Cevabı önce metin olarak alıp kontrol edelim
      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Walrus Sunucu Hatası (${response.status}): ${rawText}`
        );
      }

      // JSON parse işlemini güvenli yapalım
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (e) {
        throw new Error("Sunucudan gelen cevap JSON değil: " + rawText);
      }

      // Blob ID'yi yakala
      let blobId =
        result.newlyCreated?.blobObject?.blobId ||
        result.alreadyCertified?.blobId;

      if (!blobId) throw new Error("Blob ID JSON içinde bulunamadı.");

      setStoredBlobId(blobId);
      setStatus(`Walrus OK! (ID: ${blobId}) Sui'ye kaydediliyor...`);

      // C. Sui'ye Referansı Kaydet
      saveToSui(blobId);
    } catch (error) {
      console.error("Yükleme Hatası Detayı:", error);
      setStatus("Hata: " + error.message);
    }
  };

  // 2. İNDİR VE ŞİFREYİ ÇÖZ
  const handleDecryptRead = async () => {
    if (!storedBlobId || !password) return alert("Blob ID ve Parola gerekli!");
    setStatus("Veri Walrus'tan çekiliyor...");

    try {
      // A. İndir
      const response = await fetch(`${WALRUS_AGGREGATOR}/v1/${storedBlobId}`);

      if (!response.ok) throw new Error("Veri bulunamadı (404)");

      const encryptedJson = await response.text();

      // B. Şifreyi Çöz
      setStatus("Şifre çözülüyor...");
      const clearText = await unsealData(encryptedJson, password);

      setDecryptedView(clearText);
      setStatus("Veri başarıyla çözüldü ve görüntülendi.");
    } catch (error) {
      console.error("Çözme Hatası:", error);
      setStatus("Şifre çözme hatası: " + error.message);
      setDecryptedView("--- ŞİFRE ÇÖZÜLEMEDİ ---");
    }
  };

  // 3. SUI TRANSACTİON
  const saveToSui = (blobId) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::storage::save_blob_ref`,
      arguments: [
        tx.pure.string(blobId),
        tx.pure.string("Sifreli Walrus Verisi"), // Açıklama
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (res) => setStatus("Başarılı! Veri güvenle saklandı."),
        onError: (err) => setStatus("Sui işlemi başarısız: " + err.message),
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto text-black">
      <h2 className="text-3xl font-bold mb-6 text-primary-blue">
        Güvenli Walrus Deposu
      </h2>

      <div className="mb-6">
        {/* CSS import edildiği için bu buton artık düzgün çalışacaktır */}
        <ConnectButton />
      </div>

      <TestCalculator />

      {!account ? (
        <div className="text-red-500 font-bold">
          İşlem yapmak için lütfen cüzdan bağlayın.
        </div>
      ) : (
        <div className="w-full bg-white p-6 rounded-lg shadow-xl space-y-4">
          {/* GİRDİ ALANLARI */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Gizli Veri:
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Blok zincirine saklamak istediğin gizli veriyi yaz..."
              value={dataToUpload}
              onChange={(e) => setDataToUpload(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Şifreleme Parolası:
            </label>
            <input
              type="password"
              className="w-full p-3 border border-red-300 bg-red-50 rounded focus:ring-2 focus:ring-red-500"
              placeholder="Bu veriyi açmak için kullanılacak anahtar..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* BUTONLAR */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleEncryptedUpload}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded font-bold hover:shadow-lg transition-all"
            >
              🔒 Şifrele & Kaydet
            </button>

            <button
              onClick={handleDecryptRead}
              disabled={!storedBlobId}
              className="flex-1 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:bg-gray-300 transition-all"
            >
              🔓 İndir & Çöz
            </button>
          </div>

          {/* BİLGİ VE SONUÇ EKRANI */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-center border border-gray-200">
            {status && (
              <p className="text-sm font-semibold text-gray-800">{status}</p>
            )}

            {storedBlobId && (
              <div className="mt-2 text-xs text-gray-500 break-all bg-white p-1 rounded border">
                ID: {storedBlobId}
              </div>
            )}

            {decryptedView && (
              <div className="mt-4 p-3 border-l-4 border-green-500 bg-green-50 text-left">
                <h4 className="font-bold text-green-800 text-sm">
                  Çözülen Veri:
                </h4>
                <p className="text-gray-900 mt-1">{decryptedView}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Diğer Sayfa Bileşenleri ---
const CalendarPage = () => (
  <div className="p-10 text-black text-2xl">Takvim ve Etkinlikler</div>
);


export default function Page() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    const pages = {
      home: <HomePage />,
      calendar: <CalendarPage />,
      map: <MapPage />,
      walrus: <WalrusPage />,
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
            <div className="flex justify-center gap-4 mt-2 bg-white/10 p-2 backdrop-blur-sm">
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
