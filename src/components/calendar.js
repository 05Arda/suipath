"use client";
import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Veri importu
import { EVENTS } from "@/utils/data";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);

  // --- YENİ: GÖRÜNÜM MODU (grid | month | year) ---
  const [viewMode, setViewMode] = useState("grid");

  // --- TOOLTIP STATE ---
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    events: [],
    dateLabel: "",
  });

  const changeMonth = (dir) => {
    setDirection(dir);
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + dir);
    setCurrentDate(newDate);
  };

  // Yıl değiştirme (Yıl görünümündeyken oklar yılı değiştirsin diye)
  const changeYear = (dir) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + dir);
    setCurrentDate(newDate);
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getEventsForDay = (dateObj) => {
    return EVENTS.filter((event) => {
      const eDate = new Date(event.date);
      return (
        eDate.getDate() === dateObj.getDate() &&
        eDate.getMonth() === dateObj.getMonth() &&
        eDate.getFullYear() === dateObj.getFullYear()
      );
    });
  };

  // --- MOUSE HOVER MANTIĞI ---
  const handleMouseEnter = (e, dateObj, dayEvents) => {
    if (dayEvents.length === 0) return;
    const label = `${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      events: dayEvents,
      dateLabel: label,
    });
  };

  const handleMouseMove = (e) => {
    if (tooltip.visible) {
      setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  // --- AY SEÇİMİ İŞLEVİ ---
  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setViewMode("grid"); // Seçimden sonra takvime dön
  };

  // --- YIL SEÇİMİ İŞLEVİ ---
  const handleYearSelect = (yearValue) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(yearValue);
    setCurrentDate(newDate);
    setViewMode("grid"); // Seçimden sonra takvime dön
  };

  // --- AY OLUŞTURUCU (GRID) ---
  const renderMonthGrid = (dateReference, isCurrent = false) => {
    const year = dateReference.getFullYear();
    const month = dateReference.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: startDayIndex });

    return (
      <div
        className={`p-4 h-full flex flex-col ${
          isCurrent
            ? ""
            : "opacity-50 scale-90 pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity"
        }`}
      >
        {/* --- BAŞLIK (AY/YIL SEÇİMİ İÇİN GÜNCELLENDİ) --- */}
        <div className="text-center mb-4 flex justify-center items-center gap-2">
          {/* Sadece ortadaki (aktif) takvimde tıklama özelliği olsun */}
          {isCurrent ? (
            <>
              <button
                onClick={() => setViewMode("month")}
                className="font-bold text-xl text-white hover:text-primary-cyan transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                {months[month]}
              </button>
              <button
                onClick={() => setViewMode("year")}
                className="font-bold text-xl text-primary-cyan hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                {year}
              </button>
            </>
          ) : (
            // Yanlardaki pasif takvimler için düz metin
            <h3 className="font-bold text-lg text-text-muted pointer-events-none">
              {months[month]} <span>{year}</span>
            </h3>
          )}
        </div>

        {/* --- İÇERİK DEĞİŞTİRİCİ --- */}
        {/* Eğer viewMode 'grid' değilse ve bu aktif aysa, seçim ekranlarını göster */}
        {isCurrent && viewMode === "month" ? (
          // AY SEÇİM EKRANI
          <div className="grid grid-cols-3 gap-4 h-full place-content-center animate-in fade-in zoom-in duration-300">
            {months.map((m, index) => (
              <button
                key={m}
                onClick={() => handleMonthSelect(index)}
                className={`p-3 rounded-xl font-bold transition-all ${
                  index === month
                    ? "bg-primary-cyan text-white"
                    : "bg-white/5 text-text-muted hover:bg-white/20 hover:text-white"
                }`}
              >
                {m.substring(0, 3)}
              </button>
            ))}
          </div>
        ) : isCurrent && viewMode === "year" ? (
          // YIL SEÇİM EKRANI
          <div className="grid grid-cols-4 gap-3 h-full place-content-center animate-in fade-in zoom-in duration-300">
            {/* 12 Yıllık bir aralık gösterelim */}
            {Array.from({ length: 12 }, (_, i) => year - 6 + i).map((y) => (
              <button
                key={y}
                onClick={() => handleYearSelect(y)}
                className={`p-2 rounded-xl font-bold transition-all ${
                  y === year
                    ? "bg-primary-cyan text-white"
                    : "bg-white/5 text-text-muted hover:bg-white/20 hover:text-white"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        ) : (
          // NORMAL TAKVİM GRİDİ
          <div className="grid grid-cols-7 gap-1 sm:gap-2 animate-in fade-in duration-300">
            {isCurrent &&
              ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] text-text-muted font-bold mb-2"
                >
                  {d}
                </div>
              ))}
            {!isCurrent && <div className="col-span-7 h-6"></div>}

            {emptyDays.map((_, i) => (
              <div key={`e-${i}`} />
            ))}

            {days.map((day) => {
              const thisDate = new Date(year, month, day);
              const dayEvents = getEventsForDay(thisDate);
              const hasEvent = dayEvents.length > 0;
              const isToday =
                new Date().toDateString() === thisDate.toDateString();

              return (
                <div
                  key={day}
                  onMouseEnter={(e) =>
                    isCurrent && handleMouseEnter(e, thisDate, dayEvents)
                  }
                  onMouseMove={isCurrent ? handleMouseMove : undefined}
                  onMouseLeave={isCurrent ? handleMouseLeave : undefined}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all
                    ${
                      isCurrent
                        ? hasEvent
                          ? "bg-card-bg border border-white/10 text-white shadow-md z-10"
                          : "text-text-muted hover:bg-white/5"
                        : "text-text-muted/50"
                    }
                    ${
                      isToday && isCurrent
                        ? "border border-primary-cyan bg-primary-cyan/10"
                        : ""
                    }
                    `}
                >
                  {day}

                  {/* --- NOKTALAR --- */}
                  {hasEvent && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((event, i) => {
                        const isPast = new Date(event.date) < new Date();
                        return (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPast ? "bg-red-500" : "bg-emerald-500"
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const prevDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );
  const nextDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );

  return (
    <div className="w-full h-full bg-deep-bg overflow-hidden relative flex flex-col items-center justify-center">
      {/* --- TOOLTIP --- */}
      <AnimatePresence>
        {tooltip.visible &&
          viewMode === "grid" && ( // Sadece grid modunda tooltip göster
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                top: tooltip.y + 15,
                left: tooltip.x + 15,
                position: "fixed",
                zIndex: 60,
              }}
              className="w-64 bg-ocean-dark/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 pointer-events-none"
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                <CalendarIcon size={14} className="text-primary-cyan" />
                <span className="text-white font-bold text-sm">
                  {tooltip.dateLabel}
                </span>
              </div>

              <div className="space-y-3">
                {tooltip.events.map((ev) => {
                  const isPast = new Date(ev.date) < new Date();
                  const dotColor = isPast ? "bg-red-500" : "bg-emerald-500";

                  return (
                    <div key={ev.id} className="flex gap-3">
                      <div className={`w-1 rounded-full ${dotColor}`} />
                      <div>
                        <p
                          className={`text-xs font-bold line-clamp-1 ${
                            isPast
                              ? "text-text-muted line-through"
                              : "text-white"
                          }`}
                        >
                          {ev.title}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-text-muted mt-0.5">
                          <Clock size={10} />
                          <span>{ev.time || "Tüm Gün"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* --- ANA KONTEYNER --- */}
      <div className="flex items-center justify-center w-full max-w-7xl px-4 gap-4 h-[80vh]">
        {/* SOL: ÖNCEKİ AY (Sadece grid modunda göster) */}
        {viewMode === "grid" && (
          <div
            onClick={() => changeMonth(-1)}
            className="hidden lg:block w-1/4 h-full relative group cursor-pointer"
          >
            <div className="absolute inset-0 flex items-center justify-center scale-90 opacity-60 group-hover:opacity-100 group-hover:scale-95 transition-all duration-500 bg-card-bg/20 rounded-3xl border border-white/5">
              {renderMonthGrid(prevDate, false)}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                <ChevronLeft size={48} className="text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
        )}

        {/* ORTA: ŞU ANKİ AY */}
        <motion.div
          key={currentDate.toString() + viewMode}
          initial={{ x: viewMode === "grid" ? direction * 50 : 0, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full lg:w-1/2 bg-card-bg/80 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-2 sm:p-6 z-10 h-full max-h-[600px] flex flex-col"
        >
          {/* Mobil Oklar (Sadece grid modunda göster) */}
          {viewMode === "grid" && (
            <div className="lg:hidden flex justify-between mb-2 px-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 bg-white/10 rounded-full text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 bg-white/10 rounded-full text-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Ay Seçim modundaysa Geri butonu koyabiliriz veya başlığa tıklanınca kapanır */}
          {renderMonthGrid(currentDate, true)}
        </motion.div>

        {/* SAĞ: SONRAKİ AY (Sadece grid modunda göster) */}
        {viewMode === "grid" && (
          <div
            onClick={() => changeMonth(1)}
            className="hidden lg:block w-1/4 h-full relative group cursor-pointer"
          >
            <div className="absolute inset-0 flex items-center justify-center scale-90 opacity-60 group-hover:opacity-100 group-hover:scale-95 transition-all duration-500 bg-card-bg/20 rounded-3xl border border-white/5">
              {renderMonthGrid(nextDate, false)}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                <ChevronRight size={48} className="text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
