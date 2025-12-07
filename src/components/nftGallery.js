import Link from "next/link";
import Image from "next/image";

export default function NFTGallery({ nfts, filterTag = null }) {
  const nftList = nfts || [];

  return (
    <div className="w-full grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-4 py-24 bg-deep-bg/90">
      {nftList
        .filter((nft) => (filterTag ? nft.tags?.includes(filterTag) : true))
        .map((nft) => {
          return (
            <div key={nft.id} className="w-full">
              <Link
                href={`/nft/${nft.id}`}
                className="group block h-full bg-card-bg border border-border-color rounded-2xl overflow-hidden hover:border-primary-cyan transition-all duration-300 relative shadow-lg"
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
              </Link>
            </div>
          );
        })}
    </div>
  );
}
