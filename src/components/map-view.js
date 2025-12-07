// components/map-view.js
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  GeoJSON, // Sınırları çizmek için
  useMap, // Haritayı kontrol etmek için
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { ChevronRight, Calendar, MapPin, Filter } from "lucide-react";
import { EVENTS } from "@/utils/data";

// --- İKON AYARLARI ---
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

// Server-side rendering hatasını önlemek için kontrol
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
  });
}

// --- YARDIMCI BİLEŞEN: Haritayı Seçilen Ülkeye Odaklar ---
function MapController({ selectedFeature }) {
  const map = useMap();

  useEffect(() => {
    if (selectedFeature) {
      // GeoJSON verisinden sınırları (bounds) al
      const layer = L.geoJSON(selectedFeature);
      const bounds = layer.getBounds();

      // Haritayı o sınırlara sığdır (biraz padding ile)
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [selectedFeature, map]);

  return null;
}

export default function MapView() {
  const defaultCenter = [41.0082, 28.9784];
  const zoomLevel = 6;

  // --- STATES ---
  const [geoData, setGeoData] = useState(null); // Tüm dünya verisi
  const [selectedCountryCode, setSelectedCountryCode] = useState(""); // Seçilen ülke kodu
  const [filteredEvents, setFilteredEvents] = useState(EVENTS); // Filtrelenmiş etkinlikler

  // --- DATA FETCHING (Dünya Haritası) ---
  useEffect(() => {
    // Düşük çözünürlüklü dünya haritası (performans için)
    fetch(
      "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
    )
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Harita verisi yüklenemedi:", err));
  }, []);

  // --- SEÇİLEN ÜLKENİN GEOJSON VERİSİNİ BUL ---
  const selectedFeature = useMemo(() => {
    if (!geoData || !selectedCountryCode) return null;
    return geoData.features.find((f) => f.id === selectedCountryCode);
  }, [geoData, selectedCountryCode]);

  // --- FİLTRELEME FONKSİYONU ---
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountryCode(countryCode);

    if (countryCode === "") {
      setFilteredEvents(EVENTS); // Hepsini göster
    } else {
      // NOT: Gerçek projede 'event.countryCode' gibi bir alan olmalı.
      // Burada simülasyon yapıyoruz: Eğer Türkiye (TUR) seçilirse hepsini göster,
      // yoksa boş göster (çünkü mock datanız sadece İstanbul koordinatlarında).
      if (countryCode === "TUR") {
        setFilteredEvents(EVENTS);
      } else {
        setFilteredEvents([]); // Diğer ülkelerde etkinlik yok varsayıyoruz
      }
    }
  };

  return (
    <div className="relative w-full h-full group">
      <MapContainer
        center={defaultCenter}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ background: "#011820" }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* --- 1. HARİTA KONTROLCÜSÜ (Zoom için) --- */}
        <MapController selectedFeature={selectedFeature} />

        {/* --- 2. KIRMIZI SINIR ÇİZİMİ --- */}
        {selectedFeature && (
          <GeoJSON
            key={selectedCountryCode} // Key değişince yeniden render eder
            data={selectedFeature}
            style={{
              color: "#ef4444", // Tailwind red-500
              weight: 2,
              fillColor: "#ef4444",
              fillOpacity: 0.1,
            }}
          />
        )}

        {/* --- 3. MARKERLAR --- */}
        {filteredEvents.map((event) => {
          // Mock koordinat (Sabit kalması için useMemo kullanılabilir ama şimdilik bırakıyoruz)
          const mockLat = 41.0082 + (Math.random() - 0.5) * 5;
          const mockLng = 28.9784 + (Math.random() - 0.5) * 5;

          return (
            <Marker key={event.id} position={[mockLat, mockLng]}>
              <Popup className="custom-popup">
                <div className="min-w-[200px]">
                  <div className="relative h-24 w-full mb-2 rounded-lg overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-700 mb-1">
                    <Calendar size={12} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-700 mb-3">
                    <MapPin size={12} />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <Link
                    href={`/event/${event.id}`}
                    className="flex items-center justify-center gap-1 w-full bg-primary-cyan rounded hover:bg-ocean-dark transition-colors"
                  >
                    <p className="text-white text-xs font-bold">
                      Detayları Gör
                    </p>
                    <ChevronRight className="text-white" size={20} />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* --- 4. SOL ALT FİLTRE ARAYÜZÜ --- */}
      <div className="absolute bottom-8 left-8 z-[1000] bg-card-bg/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl w-64 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 mb-2 text-white/80">
          <Filter size={16} className="text-primary-cyan" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Ülke Filtrele
          </span>
        </div>

        <select
          value={selectedCountryCode}
          onChange={handleCountryChange}
          className="w-full bg-black/40 border border-white/20 text-white text-sm rounded-lg p-2.5 outline-none focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan transition-all appearance-none cursor-pointer"
        >
          <option value="" className="bg-slate-800">
            Tüm Dünya
          </option>
          {/* GeoJSON yüklendiyse listeyi doldur */}
          {geoData &&
            geoData.features
              .sort((a, b) =>
                a.properties.name.localeCompare(b.properties.name)
              )
              .map((feature) => (
                <option
                  key={feature.id}
                  value={feature.id}
                  className="bg-slate-800"
                >
                  {feature.properties.name}
                </option>
              ))}
        </select>

        {/* Select ikonu için hack */}
        <div className="absolute right-6 bottom-6 pointer-events-none text-white/50">
          <ChevronRight className="rotate-90" size={16} />
        </div>
      </div>
    </div>
  );
}
