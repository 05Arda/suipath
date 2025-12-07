"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode, Autoplay } from "swiper/modules";

// Veri importu
import { NFTS } from "@/utils/data";

import NFTDetailPage from "@/app/nft/[id]/page";

// Varsayılan değer [] atandı (Hata önleyici)
export default function NftSwiper({ filteredNftIds = [] }) {
  // Eğer filtreleme yapılacak ID listesi boşsa veya undefined ise
  // Tüm NFT'leri mi gösterelim yoksa hiç göstermeyelim mi?
  // Aşağıdaki mantık: ID listesi varsa filtrele, yoksa hepsini göster.
  const displayNfts =
    filteredNftIds.length > 0
      ? NFTS.filter((nft) => filteredNftIds.includes(nft.id))
      : NFTS;

  if (displayNfts.length === 0) return null; // Gösterilecek NFT yoksa bileşeni render etme

  const [showNftDetail, setShowNftDetail] = useState(false);
  const [selectedNftId, setSelectedNftId] = useState(1);

  return (
    <div className="w-full py-6">
      {showNftDetail && (
        <div className="absolute inset-0 flex justify-center items-center bg-deep-bg/90 z-60">
          {
            <NFTDetailPage
              nftId={selectedNftId}
              showNftDetail={showNftDetail}
              setShowNftDetail={setShowNftDetail}
            />
          }
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
            <div className="group relative block w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/5 hover:border-primary-cyan transition-all duration-300 shadow-lg">
              {/* --- RESİM --- */}
              <Image
                src={nft.image}
                alt={nft.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* --- OVERLAY --- */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
              {/* --- İÇERİK --- */}
              <div className="absolute bottom-0 left-0 w-full p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {/* Sanatçı ve Başlık */}
                <div className="mb-2">
                  <p className="text-[10px] text-primary-cyan font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mb-1">
                    {nft.creator}
                  </p>
                  <h3 className="text-white font-bold text-sm leading-tight shadow-black drop-shadow-md">
                    {nft.title}
                  </h3>
                </div>

                {/* Fiyat ve Buton */}
                <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-300 uppercase tracking-wide">
                      Fiyat
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {nft.price}
                    </span>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-primary-cyan flex items-center justify-center text-white text-[10px]">
                    ➜
                  </div>
                </div>
              </div>
              {/* Üstteki "Hot" Rozeti */}
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
