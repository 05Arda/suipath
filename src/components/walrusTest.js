"use client";
import { useState } from "react";
// Server Action dosyanızın yolu neyse onu import edin
import { uploadImageToWalrus } from "@/utils/walrus";

export default function WalrusUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Lütfen bir dosya seçin!");

    setUploading(true);

    try {
      // --- DÜZELTME BURADA ---
      // 1. Yeni bir FormData oluşturuyoruz
      const formData = new FormData();

      // 2. Dosyayı içine 'file' anahtarıyla ekliyoruz (Server bu isimle bekliyor)
      formData.append("file", file);

      // 3. Ekstra parametre varsa ekleyebilirsiniz
      formData.append("epochs", 5);

      // 4. Server Action'a bu formData'yı gönderiyoruz
      const result = await uploadImageToWalrus(formData);

      if (result.success) {
        console.log("Yüklendi:", result);
        alert(`Başarılı! Blob ID: ${result.blobId}`);
      } else {
        alert("Hata: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Beklenmedik bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto mt-[12.5%] p-4 bg-gray-900 rounded-lg border border-gray-700 z-10">
      <h3 className="text-white mb-4">Walrus'a Yükle (Server Action)</h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        className="block w-full text-sm text-gray-400 mb-4
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-cyan-600 file:text-white
          hover:file:bg-cyan-700"
      />

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className={`px-4 py-2 rounded text-white font-bold transition-colors ${
          uploading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-cyan-600 hover:bg-cyan-500"
        }`}
      >
        {uploading ? "Yükleniyor..." : "Yükle"}
      </button>
    </div>
  );
}
