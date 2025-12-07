"use client";
export const dynamic = "force-dynamic";
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
  Check,
  Loader2,
} from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";

// Server Actions Import
// DÜZELTME: getUserEventStatus fonksiyonunu import ettik
import {
  getEventById,
  toggleEventFavorite,
  toggleEventJoin,
  getUserEventStatus,
} from "@/app/actions";

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
  const account = useCurrentAccount();

  // --- STATE ---
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // --- 1. ETKİNLİK VERİSİNİ ÇEK ---
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
        const data = await getEventById(eventId);
        if (data) {
          setEvent(data);
          setAttendeeCount(data.attendees || 0);
        }
      } catch (error) {
        console.error("Etkinlik yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // --- 2. KULLANICI DURUMUNU KONTROL ET (DB) ---
  // Cüzdan bağlandığında veya eventId değiştiğinde çalışır
  useEffect(() => {
    const checkUserStatus = async () => {
      // Eğer cüzdan yoksa favori/katılım bilgisini false yap
      if (!account?.address || !eventId) {
        setIsJoined(false);
        setIsFavorite(false);
        return;
      }

      try {
        // DB'den kullanıcının bu eventle ilişkisini sorgula
        const status = await getUserEventStatus(account.address, eventId);

        // State'leri güncelle
        setIsJoined(status.hasJoined);
        setIsFavorite(status.isFavorite);
      } catch (error) {
        console.error("Kullanıcı durumu alınamadı:", error);
      }
    };

    checkUserStatus();
  }, [account, eventId]); // account değişince (login olunca) tekrar çalışır

  // --- ACTIONS (Aynı) ---
  const handleToggleFavorite = async () => {
    if (!account) return alert("Lütfen önce cüzdanınızı bağlayın!");
    if (actionLoading) return;

    const previousState = isFavorite;
    setIsFavorite(!isFavorite); // Optimistic Update
    setActionLoading(true);

    const result = await toggleEventFavorite(account.address, eventId);

    if (!result.success) {
      setIsFavorite(previousState); // Hata olursa geri al
      alert("Hata: " + result.error);
    }
    setActionLoading(false);
  };

  const handleJoinToggle = async () => {
    if (!account) return alert("Lütfen önce cüzdanınızı bağlayın!");
    if (actionLoading) return;

    setActionLoading(true);
    const result = await toggleEventJoin(account.address, eventId);

    if (result.success) {
      setIsJoined(result.isJoined);
      setAttendeeCount(result.newCount);
    } else {
      alert("Hata: " + result.error);
    }
    setActionLoading(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-deep-bg flex items-center justify-center">
        <Loader2 className="text-primary-cyan animate-spin" size={48} />
      </div>
    );
  if (!event)
    return (
      <div className="min-h-screen bg-deep-bg text-white flex items-center justify-center">
        Etkinlik bulunamadı.
      </div>
    );

  const occupancy = Math.round((attendeeCount / (event.capacity || 100)) * 100);
  const remainingAttendees = Math.max(
    0,
    attendeeCount - ATTENDEE_AVATARS.length
  );

  return (
    <div className="min-h-screen bg-deep-bg pb-20 relative">
      {/* Toast Bildirimi */}
      <div
        className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 transition-all duration-300 ${
          isCopied ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
        }`}
      >
        <Check size={18} />
        <span className="font-medium text-sm">Link panoya kopyalandı!</span>
      </div>

      <div className="relative w-full h-[40vh] lg:h-[50vh]">
        <Image
          src={event.image || "/placeholder-event.jpg"}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-bg/60 to-deep-bg" />

        <div className="absolute top-6 left-0 w-full px-6 flex justify-between items-center z-10">
          <button
            onClick={() => router.back()}
            className="bg-black/30 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex gap-3">
            {/* FAVORİ BUTONU (Doluysa kırmızı, boşsa şeffaf) */}
            <button
              onClick={handleToggleFavorite}
              disabled={actionLoading}
              className={`p-3 rounded-full backdrop-blur-md transition-all border ${
                isFavorite
                  ? "bg-red-500/20 text-red-500 border-red-500"
                  : "bg-black/30 text-white border-white/10"
              }`}
            >
              <Heart
                size={24}
                className={`transition-transform duration-300 ${
                  isFavorite ? "fill-current scale-110" : "scale-100"
                }`}
              />
            </button>

            <button
              onClick={handleShare}
              className="bg-black/30 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/10 active:scale-95"
            >
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-[90%] max-w-6xl mx-auto -mt-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
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
                  <p className="text-text-muted text-sm mt-1">Türkiye</p>
                </div>
              </div>
            </div>
          </div>

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
                      {event.time}
                    </p>
                  </div>
                </div>

                <div className="w-full">
                  <p className="text-text-muted text-xs mb-1">Doluluk</p>
                  <div className="w-full h-1.5 bg-deep-bg rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-primary-cyan rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(occupancy, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-text-light">
                      {attendeeCount} Kişi katılıyor
                    </span>
                    <span className="text-xs text-primary-cyan font-bold">
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
                          {remainingAttendees > 99 ? "99+" : remainingAttendees}
                        </span>
                      </div>
                    )}
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

                {/* KATIL BUTONU (Duruma göre değişen) */}
                <button
                  onClick={handleJoinToggle}
                  // DÜZELTME: isJoined true ise butonu devre dışı bırak
                  disabled={actionLoading || isJoined}
                  className={`
    w-full py-4 rounded-xl font-bold text-base transition-all duration-300 transform active:scale-95
    ${
      isJoined // Katıldıysa stilini koru, ancak hover etkileşimini azalt
        ? "bg-transparent border-2 border-emerald-500 text-emerald-500 opacity-80 cursor-default"
        : "bg-primary-cyan text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(39,130,133,0.4)]"
    }
    ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}
  `}
                >
                  {/* Buton Metni */}
                  {actionLoading
                    ? "İşleniyor..."
                    : isJoined
                    ? "Katıldınız" // DÜZELTİLDİ: Açıklayıcı metin
                    : "Hemen Katıl"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
