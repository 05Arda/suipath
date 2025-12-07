// utils/walrus.js
import axios from "axios";

// Walrus Testnet Endpointleri
const PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space";
const AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";

/**
 * 1. Veriyi Walrus'a Yükle
 * @param {File} file - Yüklenecek dosya objesi
 * @returns {Promise<string>} - Blob ID döner
 */
export const uploadToWalrus = async (file) => {
  try {
    // Walrus'a binary data olarak gönderiyoruz
    const response = await axios.put(`${PUBLISHER_URL}/v1/store`, file, {
      headers: {
        "Content-Type": file.type, // Örn: image/png
      },
    });

    // Walrus yeni versiyonunda blobId'yi response.data.newlyCreated.blobObject.blobId içinde veya direkt dönebilir.
    // Şimdilik standart response yapısını kontrol ediyoruz:
    if (response.data && response.data.newlyCreated) {
      return response.data.newlyCreated.blobObject.blobId;
    } else if (response.data && response.data.blobId) {
      return response.data.blobId;
    }

    throw new Error("Blob ID alınamadı.");
  } catch (error) {
    console.error("Walrus Upload Hatası:", error);
    throw error;
  }
};

/**
 * 2. Walrus'tan Veri Çek
 * @param {string} blobId
 * @returns {Promise<Blob>}
 */
export const fetchFromWalrus = async (blobId) => {
  try {
    const response = await axios.get(`${AGGREGATOR_URL}/v1/${blobId}`, {
      responseType: "blob", // Resim/Dosya olarak döneceği için
    });
    return response.data;
  } catch (error) {
    console.error("Walrus Fetch Hatası:", error);
    return null;
  }
};
