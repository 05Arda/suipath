"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { X, Gem, Award, Wallet, Clock, Shield, Zap } from "lucide-react";

// Veri importu
import { NFTS } from "@/utils/data";

// Tier Renkleri (Move kontratı ile uyumlu olmalı)
const TIER_COLORS = {
  PLATINUM: "bg-indigo-600 text-white border-indigo-400",
  GOLD: "bg-yellow-500 text-black border-yellow-300",
  SILVER: "bg-gray-400 text-black border-gray-300",
  BRONZE: "bg-orange-600 text-white border-orange-400",
};

// Düzeltildi: Prop ismini 'propNftId' olarak değiştirdik.
export default function NFTDetailPage({
  nftId: propNftId = null,
  showNftDetail = null,
  setShowNftDetail = null,
}) {
  const params = useParams();
  const router = useRouter();

  // Düzeltildi: ID'yi tek bir yerden alıyoruz. Props (modal) önceliklidir.
  const targetNftId = Number(propNftId || params.id);

  // NFT'yi veriden bul
  const nft = NFTS.find((n) => n.id === targetNftId);

  // Eğer NFT bulunamazsa veya ID geçersizse (NaN, 0 vb.)
  if (!nft) {
    return (
      <div className="min-h-screen bg-deep-bg py-24 px-10 flex flex-col items-center justify-center text-center ">
        <h1 className="text-3xl font-bold text-white mb-4">NFT Bulunamadı</h1>
        <p className="text-text-muted">
          Geçersiz kimlik (ID) veya NFT mevcut değil.
        </p>
        <button
          onClick={() => setShowNftDetail(false)}
          className="mt-6 px-6 py-3 bg-primary-cyan text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          <X size={16} className="inline mr-2" />
        </button>
      </div>
    );
  }

  // Yükseltme kontrolü
  const currentTier = nft.tier_name.toUpperCase();
  const isMaxTier = currentTier === "PLATINUM";

  const tierOrder = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
  const nextTierIndex = tierOrder.indexOf(currentTier) + 1;
  const nextTierName = tierOrder[nextTierIndex] || "PLATINUM"; // Hata önleme

  return (
    <div className="sticky top-0 max-h-screen bg-deep-bg py-24 px-10 rounded-4xl">
      {/* --- HEADER / BACK BUTTON --- */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <button
          onClick={() => setShowNftDetail(false)}
          className="p-2 bg-card-bg rounded-full text-white hover:bg-white/10 transition-colors border border-white/10"
        >
          <X size={24} />
        </button>
        <h1 className="text-xl font-bold text-white hidden sm:block">
          {nft.title}
        </h1>
        <div className="w-10 h-10"></div> {/* Hizalama için boşluk */}
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- SOL KOLON: GÖRSEL VE AKSİYON --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* NFT GÖRSELİ */}
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border border-border-color">
            <Image
              src={nft.image}
              alt={nft.title}
              fill
              className="object-cover"
              priority
            />
            {/* Tier Badge Büyük Görünüm */}
            <div
              className={`absolute top-4 right-4 text-sm font-extrabold px-3 py-1 rounded-full border-2 ${TIER_COLORS[currentTier]}`}
            >
              <Award size={18} className="inline mr-1" /> {currentTier}
            </div>
          </div>

          {/* YÜKSELTME ALANI (ACTION) */}
          <div className="bg-card-bg p-6 rounded-2xl border border-white/10 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={20} className="text-red-400" /> NFT Yükseltme İşlemi
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Bu NFT'yi{" "}
              {isMaxTier
                ? "daha fazla yükseltilemez."
                : `bir sonraki seviye olan ${nextTierName}'a yükseltmek için admin onayı gereklidir.`}
            </p>

            <button
              // Bu butona basıldığında upgrade_nft fonksiyonu çağrılır
              disabled={isMaxTier}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                isMaxTier
                  ? "bg-gray-600/50 text-text-muted cursor-not-allowed"
                  : "bg-primary-cyan hover:bg-emerald-500 text-white shadow-md"
              }`}
            >
              {isMaxTier ? "Maksimum Seviye" : `Yükseltme Talebi Gönder`}
            </button>
          </div>
        </div>

        {/* --- SAĞ KOLON: METADATA --- */}
        <div className="lg:col-span-1 space-y-6">
          {/* BAŞLIK VE FİYAT */}
          <div className="bg-card-bg p-6 rounded-2xl border border-white/10 shadow-lg">
            <h2 className="text-2xl font-extrabold text-white mb-2">
              {nft.title}
            </h2>
            <p className="text-primary-cyan text-sm mb-4">
              Oluşturan: {nft.creator}
            </p>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-xs text-text-muted uppercase">
                  Güncel Fiyat
                </span>
                <span className="text-xl font-bold text-emerald-400 flex items-center gap-1">
                  <Wallet size={20} /> {nft.price}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-muted uppercase">
                  Seri No
                </span>
                <p className="text-white font-mono font-bold">
                  {nft.serial_number}
                </p>
              </div>
            </div>
          </div>

          {/* AÇIKLAMA */}
          <div className="bg-card-bg p-6 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Shield size={18} className="text-primary-cyan" /> Açıklama
            </h3>
            <p className="text-text-muted text-sm">{nft.description}</p>
          </div>

          {/* ÖZELLİKLER (Attributes) */}
          <div className="bg-card-bg p-6 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Clock size={18} className="text-primary-cyan" /> Özellikler
            </h3>
            <div className="text-xs font-mono text-text-light bg-black/20 p-3 rounded">
              {nft.attributes || "{ type: 'Initial', power: 'Low' }"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
