import Link from "next/link";
import Image from "next/image";

export default function Events({ events, filterTag = null }) {
  // Eğer events verisi null veya undefined gelirse hata vermemesi için önlem
  const eventList = events || [];

  return (
    <div className="w-full grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-4 py-24">
      {eventList
        .filter((event) => (filterTag ? event.tags?.includes(filterTag) : true))
        .map((event) => {
          // --- DOLULUK HESAPLAMASI ---
          // Veri güvenliği için varsayılan değerler
          const capacity = event.capacity || 100;
          const attendees = event.attendees || 0;
          const occupancy = Math.round((attendees / capacity) * 100);

          let statusColor = "text-emerald-500";
          let barColor = "bg-emerald-500";

          if (occupancy > 90) {
            statusColor = "text-red-500";
            barColor = "bg-red-500";
          } else if (occupancy > 70) {
            statusColor = "text-amber-500";
            barColor = "bg-amber-500";
          }

          return (
            <div key={event.id} className="w-full">
              <Link
                href={`/event/${event.id}`}
                className="group block h-full bg-card-bg border border-border-color rounded-2xl overflow-hidden hover:border-primary-cyan transition-all duration-300 relative shadow-lg"
              >
                {/* Resim Alanı */}
                <div className="relative h-40 w-full">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    // ÖNEMLİ: Grid yapısında performans için sizes eklenmeli
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card-bg to-transparent opacity-80" />

                  {/* Kategori Etiketi */}
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-ocean-dark/80 text-primary-cyan px-2 py-0.5 rounded backdrop-blur-md">
                    {event.category}
                  </span>

                  {/* Tag Etiketi */}
                  {event.tags && event.tags.length > 0 && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-primary-cyan/80 text-white px-2 py-0.5 rounded backdrop-blur-md">
                      #{event.tags[0]}
                    </span>
                  )}
                </div>

                {/* İçerik */}
                <div className="p-3">
                  <h3 className="text-white font-bold text-base line-clamp-2 group-hover:text-primary-cyan transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-text-muted text-xs mt-1 mb-3 line-clamp-1">
                    {event.location}
                  </p>

                  {/* --- OCCUPANCY BAR --- */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-text-muted">
                        Doluluk
                      </span>
                      <span className={`text-[10px] font-bold ${statusColor}`}>
                        %{occupancy}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-ocean-dark rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(occupancy, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border-color/50">
                    <span className="text-[10px] text-text-light bg-white/5 px-2 py-1 rounded">
                      {event.date?.split(",")[0]}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {event.price}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
    </div>
  );
}
