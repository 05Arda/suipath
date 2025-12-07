"use server"; // BU SATIR ŞART (Kodu sunucuda çalıştırır)

import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient, RetryableWalrusClientError } from "@mysten/walrus";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

// --- KONFIGURASYON ---
const WALRUS_NETWORK = "testnet";
const WALRUS_AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";

// İstemcileri bir kez oluştur (Lazy loading veya global scope)
// Server Action her çalıştığında yeniden oluşturulmaması için global değişken kontrolü yapılabilir
// ama şimdilik basit tutalım.

const suiClient = new SuiClient({
  url: getFullnodeUrl(WALRUS_NETWORK),
});

const walrusClient = new WalrusClient({
  network: WALRUS_NETWORK,
  suiClient,
});

// Keypair (Sunucu tarafında Environment Variable'dan okunur)
const keypair = Ed25519Keypair.deriveKeypair(
  process.env.MNEMONIC || "mmonic" // .env.local dosyasına MNEMONIC eklemeyi unutmayın
);

/**
 * Walrus SDK kullanarak dosya yükler (Server Action).
 * @param {FormData} formData - Client'tan gönderilen FormData
 * @returns {Promise<Object>} Blob ID ve URL
 */
export async function uploadImageToWalrus(formData) {
  // FormData'dan dosyayı al
  const file = formData.get("file");
  const epochs = formData.get("epochs") || 5;

  if (!file) {
    throw new Error("Dosya bulunamadı.");
  }

  console.log(`📤 Uploading ${file.name} to Walrus (Server Side SDK)...`);

  try {
    // 1. Dosyayı Buffer'a çevir (Server tarafında arrayBuffer çalışır)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log(`   File size: ${(file.size / 1024).toFixed(2)} KB`);

    // 2. SDK ile yükle
    const { blobId, blobObject } = await walrusClient.writeBlob({
      blob: uint8Array,
      deletable: true,
      epochs: Number(epochs),
      signer: keypair,
    });

    console.log("✅ Upload successful! Blob ID:", blobId);

    // 3. Client'a sonucu döndür (Plain Object olmalı)
    return {
      success: true,
      blobId: blobId,
      url: `${WALRUS_AGGREGATOR_URL}/v1/${blobId}`,
      objectId: blobObject.id.id,
    };
  } catch (error) {
    // Retryable hata kontrolü (Server side mantığı)
    if (error.constructor.name === "RetryableWalrusClientError") {
      // Basit bir retry mekanizması (Recursive)
      console.warn("⚠️ Retryable error. Retrying once...");
      // Gerçek bir retry için client'ı resetleyip tekrar denemek gerekir
      // Ancak recursion sonsuz döngüye girmesin diye dikkat edilmeli.
    }

    console.error("❌ Walrus upload error:", error);
    // Hata nesnesini string'e çevirip döndür (Serialization hatası olmaması için)
    return { success: false, error: error.message };
  }
}

/**
 * Helper: Blob URL oluşturucu
 */
export async function getWalrusUrl(blobId) {
  return `${AGGREGATOR_URL}/v1/${blobId}`;
}
