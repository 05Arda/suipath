"use client"; // Bu satır en üstte olmalı
import React, { useState } from "react";
import { uploadImageToWalrus, getWalrusUrl } from "@/utils/walrus";

export default function WalrusTest() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  // Dosya seçildiğinde state'e at
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]); // DİKKAT: .files[0] bir 'File' objesidir
    }
  };

  // Yükleme butonu tıklandığında
  const handleUpload = async () => {
    if (!file) return alert("Dosya seçmediniz!");

    setUploading(true);
    try {
      // Utility fonksiyonunu çağır
      const res = await uploadImageToWalrus(file);
      setResult(res);
      alert("Yükleme Başarılı!");
    } catch (error) {
      alert("Hata: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-10 text-white z-10">
      <h1 className="text-2xl font-bold mb-4">Walrus Uploader</h1>

      {/* 1. INPUT */}
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-primary-cyan file:text-white
          hover:file:bg-cyan-600"
      />

      {/* 2. BUTTON */}
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="bg-primary-cyan px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Yükleniyor..." : "Walrus'a Yükle"}
      </button>

      {/* 3. SONUÇ */}
      {result && (
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <p>
            <strong>Blob ID:</strong> {result.blobId}
          </p>
          <p>
            <strong>URL:</strong>{" "}
            <a
              href={result.url}
              target="_blank"
              className="underline text-blue-400"
            >
              {result.url}
            </a>
          </p>
          <img
            src={result.url}
            alt="Uploaded"
            className="mt-2 w-48 h-48 object-cover rounded"
          />
        </div>
      )}
    </div>
  );
}
