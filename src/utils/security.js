// utils/security.js

// Ortam kontrolü: Tarayıcıda mıyız ve Crypto API var mı?
function getCryptoSubtle() {
  if (
    typeof window === "undefined" ||
    !window.crypto ||
    !window.crypto.subtle
  ) {
    throw new Error(
      "Şifreleme API'si kullanılamıyor. Lütfen 'localhost' veya 'HTTPS' üzerinden bağlandığınızdan emin olun."
    );
  }
  return window.crypto.subtle;
}

// 1. Paroladan şifreleme anahtarı türetme (PBKDF2)
async function getKey(password) {
  const subtle = getCryptoSubtle(); // Güvenli kontrol
  const enc = new TextEncoder();

  const keyMaterial = await subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("sui-walrus-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// 2. Şifreleme Fonksiyonu (Seal)
export async function sealData(text, password) {
  const subtle = getCryptoSubtle(); // Güvenli kontrol
  const key = await getKey(password);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);

  const encrypted = await subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );

  const encryptedArray = Array.from(new Uint8Array(encrypted));
  const ivArray = Array.from(iv);

  return JSON.stringify({
    iv: ivArray,
    data: encryptedArray,
  });
}

// 3. Şifre Çözme Fonksiyonu (Unseal)
export async function unsealData(jsonString, password) {
  try {
    const subtle = getCryptoSubtle(); // Güvenli kontrol
    const payload = JSON.parse(jsonString);
    const key = await getKey(password);

    const iv = new Uint8Array(payload.iv);
    const encryptedData = new Uint8Array(payload.data);

    const decrypted = await subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encryptedData
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Şifre çözme detayı:", e);
    throw new Error(
      "Şifre çözülemedi! (HTTPS/Localhost kullandığınızdan emin misiniz?)"
    );
  }
}
