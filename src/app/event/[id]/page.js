"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  Share2,
  Heart,
  UserCircle,
  Check, // Kopyalandı ikonu için
} from "lucide-react";

// Veri importu
import { EVENTS, MOCK_USER } from "@/utils/data";

// --- MOCK KATILIMCI FOTOLARI ---
const ATTENDEE_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60",
];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const event = EVENTS.find((e) => e.id === eventId);

  // --- STATE ---
  const [isJoined, setIsJoined] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [animateCount, setAnimateCount] = useState(false);

  // Favori ve Paylaşım State'leri
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // Link kopyalandı mı?

  // Footer için activeTab state'i
  const [activeTab, setActiveTab] = useState("home");

  // --- INIT (Başlangıç Ayarları) ---
  useEffect(() => {
    if (event) {
      setAttendeeCount(event.attendees);

      // 1. LocalStorage'dan favorileri kontrol et
      // Eğer localStorage boşsa, MOCK_USER verisinden başlat
      const savedFavorites = JSON.parse(localStorage.getItem("favorites"));

      if (savedFavorites) {
        setIsFavorite(savedFavorites.includes(eventId));
      } else {
        // İlk kez açılıyorsa mock veriyi kullan ve kaydet
        localStorage.setItem(
          "favorites",
          JSON.stringify(MOCK_USER.favoriteEventIds)
        );
        setIsFavorite(MOCK_USER.favoriteEventIds.includes(eventId));
      }
    }
  }, [event, eventId]);

  if (!event) return null;

  // --- FAVORİ MANTIĞI ---
  const toggleFavorite = () => {
    // Mevcut favorileri al
    let currentFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (isFavorite) {
      // Çıkar
      currentFavorites = currentFavorites.filter((id) => id !== eventId);
      setIsFavorite(false);
    } else {
      // Ekle
      currentFavorites.push(eventId);
      setIsFavorite(true);
    }

    // Güncel listeyi kaydet
    localStorage.setItem("favorites", JSON.stringify(currentFavorites));
  };

  // --- PAYLAŞMA MANTIĞI (GÜNCELLENDİ) ---
  const handleShare = async () => {
    const url = window.location.href; // Şu anki sayfanın linki

    // YÖNTEM 1: Modern Tarayıcılar (HTTPS / Localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        showCopiedFeedback();
      } catch (err) {
        console.error("Modern kopyalama başarısız:", err);
        fallbackCopyTextToClipboard(url); // Hata verirse eski yöntemi dene
      }
    } else {
      // YÖNTEM 2: Eski Yöntem (HTTP ve Eski Tarayıcılar için Fallback)
      fallbackCopyTextToClipboard(url);
    }
  };

  // Eski usül kopyalama fonksiyonu (Görünmez bir textarea oluşturup kopyalar)
  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Ekranda görünmesin diye stiller
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        showCopiedFeedback();
      } else {
        alert("Link kopyalanamadı, lütfen manuel kopyalayın.");
      }
    } catch (err) {
      console.error("Fallback kopyalama başarısız:", err);
    }

    document.body.removeChild(textArea);
  };

  // Bildirimi gösteren yardımcı fonksiyon
  const showCopiedFeedback = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- KATILMA MANTIĞI ---
  const handleJoinToggle = () => {
    setAnimateCount(true);
    setTimeout(() => setAnimateCount(false), 300);

    if (isJoined) {
      setAttendeeCount((prev) => prev - 1);
      setIsJoined(false);
    } else {
      setAttendeeCount((prev) => prev + 1);
      setIsJoined(true);
    }
  };

  const occupancy = Math.round((attendeeCount / event.capacity) * 100);
  const remainingAttendees = Math.max(
    0,
    attendeeCount - ATTENDEE_AVATARS.length
  );

  return (
    <div className="min-h-screen bg-deep-bg pb-20 relative">
      {/* --- KOPYALANDI BİLDİRİMİ (TOAST) --- */}
      <div
        className={`
          fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 transition-all duration-300
          ${
            isCopied ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
          }
        `}
      >
        <Check size={18} />
        <span className="font-medium text-sm">Link panoya kopyalandı!</span>
      </div>

      {/* --- HERO IMAGE --- */}
      <div className="relative w-full h-[40vh] lg:h-[50vh]">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-bg/60 to-deep-bg" />

        {/* --- ÜST NAVİGASYON --- */}
        <div className="absolute top-6 left-0 w-full px-6 flex justify-between items-center z-10">
          <button
            onClick={() => router.back()}
            className="bg-black/30 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex gap-3">
            {/* FAVORİ BUTONU */}
            <button
              onClick={toggleFavorite}
              className={`
                p-3 rounded-full backdrop-blur-md transition-all border
                ${
                  isFavorite
                    ? "bg-red-500/20 text-red-500 border-red-500 hover:bg-red-500/30"
                    : "bg-black/30 text-white border-white/10 hover:bg-white/20"
                }
              `}
            >
              <Heart
                size={24}
                className={`transition-transform duration-300 ${
                  isFavorite ? "fill-current scale-110" : "scale-100"
                }`}
              />
            </button>

            {/* PAYLAŞ BUTONU */}
            <button
              onClick={handleShare}
              className="bg-black/30 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/10 active:scale-95"
            >
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* --- İÇERİK --- */}
      <div className="w-[90%] max-w-6xl mx-auto -mt-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* SOL KOLON */}
          <div className="flex-1">
            <div className="bg-card-bg/80 backdrop-blur-md border border-border-color rounded-3xl p-6 lg:p-8 shadow-2xl mb-6">
              <span className="bg-primary-cyan/20 text-primary-cyan px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                {event.category}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-2">
                {event.title}
              </h1>
              <div className="flex items-center gap-2 text-text-muted text-sm lg:text-base">
                <UserCircle size={18} />
                <span>
                  Organizatör:{" "}
                  <span className="text-text-light font-medium">
                    {event.organizer || "Bilinmiyor"}
                  </span>
                </span>
              </div>
            </div>

            <div className="bg-card-bg border border-border-color rounded-3xl p-6 lg:p-8 shadow-lg">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Etkinlik Hakkında
              </h3>
              <p className="text-text-light leading-relaxed mb-8">
                {event.description || "Açıklama yok."}
              </p>

              <div className="flex items-start gap-4 p-4 bg-deep-bg/50 rounded-2xl border border-border-color">
                <div className="bg-primary-cyan/20 p-3 rounded-full text-primary-cyan">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-text-primary font-medium">
                    {event.location}
                  </p>
                  <p className="text-text-muted text-sm mt-1">
                    İstanbul, Türkiye
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ KOLON */}
          <div className="lg:w-[350px] flex-shrink-0">
            <div className="sticky top-24 bg-card-bg border border-border-color rounded-3xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-text-primary mb-6 border-b border-border-color pb-4">
                Etkinlik Detayları
              </h3>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="bg-deep-bg p-2.5 rounded-xl text-primary-cyan border border-border-color">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Tarih</p>
                    <p className="text-text-primary font-medium">
                      {event.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-deep-bg p-2.5 rounded-xl text-primary-cyan border border-border-color">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Saat</p>
                    <p className="text-text-primary font-medium">
                      {event.time || "Belirtilmedi"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-deep-bg p-2.5 rounded-xl text-primary-cyan border border-border-color">
                    <Users size={20} />
                  </div>
                  <div className="w-full">
                    <p className="text-text-muted text-xs mb-1">
                      Katılımcı Durumu
                    </p>

                    <div className="w-full h-1.5 bg-deep-bg rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-primary-cyan rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span
                        className={`text-sm font-medium transition-all duration-300 transform ${
                          animateCount
                            ? "scale-125 text-emerald-400"
                            : "scale-100 text-text-light"
                        }`}
                      >
                        {attendeeCount} Kişi katılıyor
                      </span>
                      <span className="text-xs text-primary-cyan font-bold transition-all duration-300">
                        %{occupancy}
                      </span>
                    </div>

                    <div className="flex justify-end items-center w-full pl-2">
                      {ATTENDEE_AVATARS.map((avatarUrl, index) => (
                        <div
                          key={index}
                          className="relative w-8 h-8 rounded-full border-2 border-card-bg -ml-2 first:ml-0 overflow-hidden shadow-sm hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                          style={{ zIndex: 10 - index }}
                        >
                          <Image
                            src={avatarUrl}
                            alt="Attendee"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {remainingAttendees > 0 && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-card-bg bg-deep-bg -ml-2 z-0 relative">
                          <span className="text-[10px] text-text-muted font-bold">
                            +
                            {remainingAttendees > 99
                              ? "99+"
                              : remainingAttendees}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border-color">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-text-muted text-sm">Giriş Ücreti</span>
                  <span className="text-2xl font-bold text-white">
                    {event.price}
                  </span>
                </div>

                <button
                  onClick={handleJoinToggle}
                  className={`
                       w-full py-4 rounded-xl font-bold text-base transition-all duration-300 transform active:scale-95
                       ${
                         isJoined
                           ? "bg-transparent border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
                           : "bg-primary-cyan text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(39,130,133,0.4)]"
                       }
                    `}
                >
                  {isJoined ? "Katıldınız!" : "Hemen Katıl"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
