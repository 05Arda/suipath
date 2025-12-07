"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
// Swiper React bileşenleri
import { Swiper, SwiperSlide } from "swiper/react";

// Swiper stilleri
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/autoplay";

// Gerekli modüller
import { FreeMode, Autoplay } from "swiper/modules";

// Veri importu
import { EVENTS } from "@/utils/data";

export default function HomeSwiper({
  Title,
  swiperFilter,
  activeTab,
  setActiveTab,
}) {
  return (
    <div className="w-full py-8">
      <div className="flex justify-between items-end mb-4 px-2">
        <h2 className="text-xl font-bold text-text-primary">{Title}</h2>
        <span
          className="text-sm text-white font-medium cursor-pointer italic underline"
          onClick={() =>
            setActiveTab(
              swiperFilter == "recommended" ? "recommendedEvents" : "allEvents"
            )
          }
        >
          Show All
        </span>
      </div>

      <Swiper
        modules={[FreeMode, Autoplay]}
        spaceBetween={15}
        slidesPerView={1.2}
        loop={false}
        freeMode={true}
        grabCursor={true}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
          1280: { slidesPerView: 5, spaceBetween: 20 },
        }}
        className="w-full !pb-4"
      >
        {EVENTS.filter((event) =>
          swiperFilter ? event.tags.includes(swiperFilter) : true
        ).map((event) => {
          // --- HESAPLAMALAR BURADA YAPILMALI ---
          // Her bir event için doluluk oranı ve rengi ayrı ayrı hesaplanır.
          const occupancy = Math.round(
            (event.attendees / event.capacity) * 100
          );

          let statusColor = "text-emerald-400";
          let barColor = "bg-emerald-400";
          if (occupancy >= 90) {
            statusColor = "text-red-400";
            barColor = "bg-red-400";
          } else if (occupancy >= 60) {
            statusColor = "text-amber-400";
            barColor = "bg-amber-400";
          }
          // -------------------------------------

          return (
            <SwiperSlide key={event.id} className="h-auto">
              <Link
                href={`/event/${event.id}`}
                className="group block h-full bg-card-bg border border-border-color rounded-2xl overflow-hidden hover:border-primary-cyan transition-all duration-300 relative"
              >
                {/* Resim Alanı */}
                <div className="relative h-32 w-full">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card-bg to-transparent opacity-80" />
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-ocean-dark/80 text-primary-cyan px-2 py-0.5 rounded backdrop-blur-md">
                    {event.category}
                  </span>
                </div>

                {/* İçerik */}
                <div className="p-3">
                  <h3 className="text-text-primary font-bold text-sm line-clamp-1 group-hover:text-primary-cyan transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-text-muted text-xs mt-1 mb-3 line-clamp-1">
                    {event.location}
                  </p>

                  {/* --- OCCUPANCY BAR (DOLULUK ÇUBUĞU) --- */}
                  <div className="mb-3">
                    {/* Yüzde ve Metin */}
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-text-muted">
                        Doluluk
                      </span>
                      <span className={`text-[10px] font-bold ${statusColor}`}>
                        %{occupancy}
                      </span>
                    </div>
                    {/* Çubuk */}
                    <div className="w-full h-1.5 bg-ocean-dark rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border-color/50">
                    <span className="text-[10px] text-text-light bg-white/5 px-2 py-1 rounded">
                      {event.date.split(",")[0]}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {event.price}
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
