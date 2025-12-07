"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { X, Award, Wallet, Clock, Shield, Loader2 } from "lucide-react";

// Server Action Import
import { getNFTById } from "@/app/actions";

// Tier Renkleri
const TIER_COLORS = {
  PLATINUM: "bg-indigo-600 text-white border-indigo-400",
  GOLD: "bg-yellow-500 text-black border-yellow-300",
  SILVER: "bg-gray-400 text-black border-gray-300",
  BRONZE: "bg-orange-600 text-white border-orange-400",
};

export default function NFTDetailPage({
  nftId: propNftId = null,
  showNftDetail = null,
  setShowNftDetail = null,
  initialData = null, // Eğer parent bileşen veriyi zaten elinde tutuyorsa buraya atabilir
}) {
  const params = useParams();
  const router = useRouter();

  // Hedef ID'yi belirle
  const targetNftId = Number(propNftId || params?.id);

  // State Yönetimi
  const [nft, setNft] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);

  // Veri Çekme (useEffect)
  useEffect(() => {
    // Eğer veri prop olarak geldiyse (initialData) tekrar çekme
    if (initialData) {
      setNft(initialData);
      setLoading(false);
      return;
    }

    // ID yoksa veya geçersizse hata
    if (!targetNftId) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchNFT = async () => {
      try {
        setLoading(true);
        // Server Action'ı çağır
        const data = await getNFTById(targetNftId);

        if (data) {
          setNft(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("NFT yüklenemedi:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNFT();
  }, [targetNftId, initialData]);

  // --- LOADING DURUMU ---
  if (loading) {
    return (
      <div className="min-h-screen bg-deep-bg/90 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-primary-cyan animate-spin" />
          <p className="text-white text-sm font-medium">
            NFT Verisi Çekiliyor...
          </p>
        </div>
      </div>
    );
  }

  // --- HATA DURUMU ---
  if (error || !nft) {
    return (
      <div className="min-h-screen bg-deep-bg py-24 px-10 flex flex-col items-center justify-center text-center fixed inset-0 z-50">
        <h1 className="text-3xl font-bold text-white mb-4">NFT Bulunamadı</h1>
        <p className="text-text-muted">
          Aradığınız NFT veritabanında mevcut değil veya ID hatalı.
        </p>
        <button
          onClick={() => {
            if (setShowNftDetail) setShowNftDetail(false);
            else router.back();
          }}
          className="mt-6 px-6 py-3 bg-primary-cyan text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          <X size={16} className="inline mr-2" /> Kapat
        </button>
      </div>
    );
  }

  // Yükseltme kontrolü
  const currentTier = nft.tier_name ? nft.tier_name.toUpperCase() : "UNKNOWN";

  // Modal kapatma fonksiyonu
  const handleClose = () => {
    if (setShowNftDetail) {
      setShowNftDetail(false);
    } else {
      router.push("/"); // Veya router.back()
    }
  };

  return (
    // Z-Index ve Fixed ekleyerek Modal gibi davranmasını garantiliyoruz
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-deep-bg/95 backdrop-blur-xl">
      <div className="min-h-screen py-12 px-4 sm:px-10 flex items-center justify-center">
        <div className="w-full max-w-6xl relative">
          {/* --- HEADER / CLOSE BUTTON --- */}
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={handleClose}
              className="p-3 bg-card-bg rounded-full text-white hover:bg-red-500 hover:text-white transition-all border border-white/10 group"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">
              {nft.title}
            </h1>
            <div className="w-10 h-10"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* --- SOL KOLON: GÖRSEL --- */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative w-full aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-border-color bg-black/40">
                <Image
                  src={nft.image}
                  alt={nft.title}
                  fill
                  className="object-contain p-4 hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div
                  className={`absolute top-4 right-4 text-sm font-extrabold px-3 py-1 rounded-full border-2 shadow-lg ${
                    TIER_COLORS[currentTier] || "bg-gray-500"
                  }`}
                >
                  <Award size={18} className="inline mr-1" /> {currentTier}
                </div>
              </div>
            </div>

            {/* --- SAĞ KOLON: METADATA --- */}
            <div className="lg:col-span-1 space-y-6">
              {/* BAŞLIK VE FİYAT */}
              <div className="bg-card-bg p-6 rounded-2xl border border-white/10 shadow-lg animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl font-extrabold text-white mb-2">
                  {nft.title}
                </h2>
                <p className="text-primary-cyan text-sm mb-4 font-mono">
                  Creator: {nft.creator}
                </p>

                <div className="flex justify-between items-center text-white">
                  <div className="flex flex-col"></div>
                  <div className="text-right">
                    ID
                    <p className="text-white font-mono font-bold bg-white/5 px-2 py-1 rounded">
                      #{nft.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* AÇIKLAMA */}
              <div className="bg-card-bg p-6 rounded-2xl border border-white/10 shadow-lg animate-in slide-in-from-right-8 duration-700 delay-100">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Shield size={18} className="text-primary-cyan" /> Description
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {nft.description}
                </p>
              </div>

              {/* ÖZELLİKLER */}
              <div className="bg-card-bg p-6 rounded-2xl border border-white/10 shadow-lg animate-in slide-in-from-right-8 duration-700 delay-200">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Clock size={18} className="text-primary-cyan" /> Properties
                </h3>
                <div className="text-xs font-mono text-emerald-300 bg-black/40 p-4 rounded-xl border border-emerald-500/20">
                  {/* JSON verisi gelebilir veya düz text */}
                  {nft.attributes}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
