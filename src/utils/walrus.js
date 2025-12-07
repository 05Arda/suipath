import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient, RetryableWalrusClientError } from "@mysten/walrus";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

// --- KONFIGURASYON ---
const WALRUS_NETWORK = "testnet";
const WALRUS_AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";

// Sui Client Başlatma
const suiClient = new SuiClient({
  url: getFullnodeUrl(WALRUS_NETWORK),
});

// Walrus Client Başlatma
const walrusClient = new WalrusClient({
  network: WALRUS_NETWORK,
  suiClient,
});

// Keypair Oluşturma
// Not: Tarayıcıda çalışması için env değişkeninin NEXT_PUBLIC_ ile başlaması gerekebilir.
const keypair = Ed25519Keypair.deriveKeypair(
  process.env.NEXT_PUBLIC_MNEMONIC || process.env.MNEMONIC
);

/**
 * Walrus SDK kullanarak dosya yükler.
 * @param {File} file - Input'tan gelen dosya objesi
 * @param {number} epochs - Saklama süresi
 */
export async function uploadImageToWalrus(file, epochs = 5) {
  console.log(`📤 Uploading ${file.name} to Walrus (SDK)...`);

  if (!file) {
    throw new Error("Lütfen bir dosya seçin.");
  }

  try {
    // Tarayıcıdaki File objesini Buffer/Uint8Array formatına çeviriyoruz
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log(`   File size: ${(file.size / 1024).toFixed(2)} KB`);

    // SDK ile yükleme işlemi (İmzalama dahil)
    const { blobId, blobObject } = await walrusClient.writeBlob({
      blob: uint8Array,
      deletable: true,
      epochs: epochs,
      signer: keypair, // Mnemonic tabanlı imzalayıcı
    });

    console.log("✅ Upload successful!");
    console.log("   Blob ID:", blobId);

    return {
      blobId: blobId,
      url: `${WALRUS_AGGREGATOR_URL}/v1/${blobId}`,
      blobObjectId: blobObject.id.id,
    };
  } catch (error) {
    // Hata yönetimi ve Retry mekanizması
    if (error instanceof RetryableWalrusClientError) {
      console.warn("⚠️ Retryable error. Resetting client...");
      walrusClient.reset();
      return uploadImageToWalrus(file, epochs);
    }
    console.error("❌ Walrus upload error:", error);
    throw error;
  }
}

/**
 * Blob ID'den Public URL oluşturur
 */
export function getWalrusUrl(blobId) {
  return `${WALRUS_AGGREGATOR_URL}/v1/${blobId}`;
}

/**
 * SDK kullanarak Blob verisini indirir
 */
export async function downloadBlob(blobId) {
  try {
    console.log(`📥 Downloading blob ${blobId}...`);

    const uint8ArrayData = await walrusClient.readBlob({ blobId });

    // Veriyi Blob URL'e çevir (Görüntülemek için)
    const blob = new Blob([uint8ArrayData]);
    const url = URL.createObjectURL(blob);

    console.log(`✅ Ready: ${url}`);
    return url;
  } catch (error) {
    if (error instanceof RetryableWalrusClientError) {
      walrusClient.reset();
      return downloadBlob(blobId);
    }
    throw error;
  }
}
