"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode, Autoplay } from "swiper/modules";

// DÜZELTME 1: Statik veri importunu kaldırdık
// import { NFTS } from "@/utils/data";

import NFTDetailPage from "@/app/nft/[id]/page"; // veya ilgili path

export default function NftSwiper({
  filteredNftIds = [], // Filtrelenecek ID listesi (Örn: User'ın sahip oldukları)
  nfts = [], // DÜZELTME 2: Tüm NFT verisi prop olarak geliyor
}) {
  // DÜZELTME 3: Veriyi prop'tan gelen 'nfts' listesinden filtreliyoruz
  const displayNfts = useMemo(() => {
    // Eğer 'nfts' prop'u boşsa (veri gelmediyse) boş dizi dön
    if (!nfts || nfts.length === 0) return [];

    // Eğer ID listesi boşsa, tüm NFT'leri göster (veya boş dönebilirsiniz, tercihe bağlı)
    // Önceki kodunuzda "yoksa hepsini göster" mantığı vardı, aynen koruyoruz:
    if (!filteredNftIds || filteredNftIds.length === 0) return nfts;

    // Filtreleme: ID'si listede olanları bul
    return nfts.filter((nft) => filteredNftIds.includes(nft.id));
  }, [filteredNftIds, nfts]);

  // Gösterilecek NFT yoksa bileşeni render etme
  if (displayNfts.length === 0) return null;

  const [showNftDetail, setShowNftDetail] = useState(false);
  const [selectedNftId, setSelectedNftId] = useState(null);

  // Modal için seçili NFT verisini bul
  // (Veritabanından tekrar çekmeye gerek yok, elimizdeki listeden buluyoruz)
  const selectedNftData = useMemo(() => {
    return displayNfts.find((n) => n.id === selectedNftId);
  }, [selectedNftId, displayNfts]);

  return (
    <div className="w-full py-6">
      {showNftDetail && (
        <div className="fixed inset-0 flex justify-center items-center bg-deep-bg/90 z-[60] backdrop-blur-sm">
          {/* Modal İçeriği */}
          <div className="relative z-10 w-full max-w-4xl max-h-screen overflow-y-auto">
            <NFTDetailPage
              nftId={selectedNftId}
              // Veriyi prop olarak geçiyoruz ki modal tekrar fetch yapmasın (Hibrit Yapı)
              initialData={selectedNftData}
              showNftDetail={showNftDetail}
              setShowNftDetail={setShowNftDetail}
            />
          </div>

          {/* Arka plan tıklama alanı (Kapatmak için) */}
          <div
            className="absolute inset-0 z-0"
            onClick={() => setShowNftDetail(false)}
          />
        </div>
      )}

      <Swiper
        modules={[FreeMode, Autoplay]}
        spaceBetween={15}
        slidesPerView={2.2} // Mobilde 2 tam, 1 yarım
        freeMode={true}
        grabCursor={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: { slidesPerView: 3.2, spaceBetween: 15 },
          768: { slidesPerView: 4.2, spaceBetween: 20 },
          1024: { slidesPerView: 5.2, spaceBetween: 20 },
        }}
        className="w-full"
      >
        {displayNfts.map((nft) => (
          <SwiperSlide
            key={nft.id}
            className="h-auto"
            onClick={() => {
              setSelectedNftId(nft.id);
              setShowNftDetail(true);
            }}
          >
            <div className="group relative block w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/5 hover:border-primary-cyan transition-all duration-300 shadow-lg cursor-pointer">
              {/* --- RESİM --- */}
              <div className="relative w-full h-full">
                <Image
                  src={
                    nft.image || "https://via.placeholder.com/400x500?text=NFT"
                  } // Fallback image
                  alt={nft.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* --- OVERLAY --- */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

              {/* --- İÇERİK --- */}
              <div className="absolute bottom-0 left-0 w-full p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {/* Sanatçı ve Başlık */}
                <div className="mb-2">
                  <p className="text-[10px] text-primary-cyan font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mb-1">
                    {nft.creator}
                  </p>
                </div>

                {/* Fiyat ve Buton */}
                <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/10">
                  <h3 className="text-white font-bold text-sm leading-tight shadow-black drop-shadow-md">
                    {nft.title}
                  </h3>
                  <div className="w-6 h-6 rounded-full bg-primary-cyan flex items-center justify-center text-white text-[10px]">
                    ➜
                  </div>
                </div>
              </div>

              {/* Üstteki "Hot" Rozeti (Opsiyonel) */}
              {/* Eğer NFT verisinde 'is_hot' gibi bir alan varsa kullanılabilir */}
              <div className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-400/30">
                HOT
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
