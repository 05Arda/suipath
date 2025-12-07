// walrus.js (WalrusPage bileşeninizin yeni, temizlenmiş hali)

"use client";
import React, { useState } from "react";

// --- Sui & Walrus Importları ---
// ARTIK BUNLARA GEREK YOK, PROVIDERS.JS SAĞLIYOR:
// import { createNetworkConfig, SuiClientProvider, WalletProvider, ... } from "@mysten/dapp-kit";
// import { getFullnodeUrl } from "@mysten/sui/client";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import "@mysten/dapp-kit/dist/index.css"; <-- Bu, layout'a veya providers.js'e taşınacak.

// SADECE GEREKLİ OLANLARI İMPORT EDİYORUZ:
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  ConnectButton,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

// 2. Güvenlik Modülü
import { sealData, unsealData } from "@/utils/security";

// TestCalculator bileşeni varsa açın
// import TestCalculator from "@/components/test";

// --- DİKKAT: WalrusPage artık providers.js'in içindeki context'leri kullanacak ---

export default function WalrusPage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // State'ler
  const [dataToUpload, setDataToUpload] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [storedBlobId, setStoredBlobId] = useState(null);
  const [decryptedView, setDecryptedView] = useState("");

  // SABİTLER (Hata 404'ü çözmek için Nodes.Guru adresleri)
  const PACKAGE_ID = "0x...SENİN_PACKAGE_ID_BURAYA...";
  const WALRUS_PUBLISHER = "https://walrus-testnet-publisher.nodes.guru";
  const WALRUS_AGGREGATOR = "https://walrus-testnet-aggregator.nodes.guru";

  // ... handleEncryptedUpload, handleDecryptRead, saveToSui fonksiyonlarının içeriği aynı kalacak ...
  // Fonksiyon içerikleri, hata yönetimi ve mantık olarak doğru.

  const handleEncryptedUpload = async () => {
    if (!dataToUpload || !password)
      return alert("Lütfen veri ve parola giriniz!");
    setStatus("Veri şifreleniyor (Sealing)...");

    try {
      // A. Tarayıcıda Şifrele
      const sealedPayload = await sealData(dataToUpload, password);

      setStatus("Şifreli veri Walrus'a yükleniyor...");

      // B. Walrus'a Yükle
      const response = await fetch(`${WALRUS_PUBLISHER}/v1/store`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: sealedPayload,
      });

      // Cevabı kontrol et
      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Walrus Sunucu Hatası (${response.status}): ${rawText}`
        );
      }

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

  const saveToSui = (blobId) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::storage::save_blob_ref`,
      arguments: [
        tx.pure.string(blobId),
        tx.pure.string("Sifreli Walrus Verisi"),
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
        <ConnectButton />
      </div>

      {/* ... Diğer UI elemanları (inputlar, butonlar) aynı kalacak ... */}

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
}

// ARTIK BURADA AĞ VE PROVIDER TANIMLAMALARI OLMAYACAK!
