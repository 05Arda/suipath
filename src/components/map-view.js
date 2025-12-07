// components/map-view.js
"use client";
// 1. ZoomControl'ü import etmeyi unutmayın
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { ChevronRight, Calendar, MapPin } from "lucide-react";
import { EVENTS } from "@/utils/data";

const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

export default function MapView() {
  const defaultCenter = [41.0082, 28.9784];
  const zoomLevel = 6;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={zoomLevel}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
      style={{ background: "#011820" }}
      // 2. Varsayılan zoom kontrolünü KAPATIN
      zoomControl={false}
    >
      {/* 3. Zoom kontrolünü İSTEDİĞİNİZ YERE manuel olarak ekleyin */}
      {/* Seçenekler: 'topleft', 'topright', 'bottomleft', 'bottomright' */}
      <ZoomControl position="bottomright" />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {EVENTS.map((event) => {
        // Mock koordinat
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

                <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                  <Calendar size={12} />
                  <span>{event.date}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                  <MapPin size={12} />
                  <span className="truncate">{event.location}</span>
                </div>

                <Link
                  href={`/event/${event.id}`}
                  className="flex items-center justify-center gap-1 w-full bg-primary-cyan text-white text-xs py-1.5 rounded hover:bg-ocean-dark transition-colors"
                >
                  Detayları Gör <ChevronRight size={12} />
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
