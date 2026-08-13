import React, { useState, useEffect } from "react";
import { Calendar, DollarSign, Sparkles, ArrowRight, X, Layers, Shield, Sparkle } from "lucide-react";
import { Product } from "../types";

interface SavedLook {
  orderId: string;
  date: string;
  totalAmount: number;
  outfit: {
    top: { id: string; name: string; price: number; image: string } | null;
    bottom: { id: string; name: string; price: number; image: string } | null;
    footwear: { id: string; name: string; price: number; image: string } | null;
    accessories: { id: string; name: string; price: number; image: string } | null;
  };
  shippingAddress?: string;
  sizing?: string;
  measurementsSnapshot?: {
    shoulder: number;
    waist: number;
    hip: number;
  };
}

interface MyLooksPageProps {
  uid: string;
  onNavigateToStudio: (outfit?: any) => void;
}

export default function MyLooksPage({ uid, onNavigateToStudio }: MyLooksPageProps) {
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [selectedLook, setSelectedLook] = useState<SavedLook | null>(null);

  useEffect(() => {
    // Sync looks from localStorage
    const savedOrdersKey = `orders_${uid}`;
    const dataStr = localStorage.getItem(savedOrdersKey);
    if (dataStr) {
      try {
        const parsed = JSON.parse(dataStr);
        if (Array.isArray(parsed)) {
          // De-duplicate looks by orderId/lookId to prevent duplicate React keys
          const unique: SavedLook[] = [];
          const seen = new Set<string>();
          for (const item of parsed) {
            const id = item.orderId || (item as any).lookId;
            if (id && !seen.has(id)) {
              seen.add(id);
              unique.push(item);
            }
          }
          setLooks(unique);
        }
      } catch (e) {
        console.error("Failed to parse local looks", e);
      }
    }
  }, [uid]);

  const handleReorder = (look: SavedLook) => {
    // Construct outfit snapshot matching ShopperStudioView state
    const outfitToLoad = {
      top: look.outfit.top ? { ...look.outfit.top, category: "top" } as unknown as Product : null,
      bottom: look.outfit.bottom ? { ...look.outfit.bottom, category: "bottom" } as unknown as Product : null,
      footwear: look.outfit.footwear ? { ...look.outfit.footwear, category: "footwear" } as unknown as Product : null,
      accessories: look.outfit.accessories ? { ...look.outfit.accessories, category: "accessories" } as unknown as Product : null,
    };
    onNavigateToStudio(outfitToLoad);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10 text-center md:text-left">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-purple-950">My Saved Looks</h2>
        <p className="text-zinc-500 font-sans text-sm mt-2 max-w-xl">
          Review, analyze, and instantly re-experience your personalized outfits in the virtual fitting atelier.
        </p>
      </div>

      {looks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-purple-50 max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-[#fff0f5] text-[#ac2471] rounded-full flex items-center justify-center mx-auto mb-6">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#221920] mb-2">No looks saved yet</h3>
          <p className="font-sans text-[#73636f] text-sm mb-8 leading-relaxed max-w-md mx-auto">
            You haven't ordered or saved any custom looks to your portfolio yet. Experience the immersive model transformation to curate your luxury wardrobe.
          </p>
          <button
            onClick={() => onNavigateToStudio()}
            className="inline-flex items-center gap-2 hero-gradient text-white px-8 py-3.5 rounded-full font-sans text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow cursor-pointer"
          >
            Start Your Transformation <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {looks.map((look) => {
            // Pick a representation photo
            const primaryImage =
              look.outfit.top?.image ||
              look.outfit.bottom?.image ||
              look.outfit.footwear?.image ||
              "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600";

            // Resolve standard occasion or guess from a product
            const lookOccasion = look.outfit.top ? "Wedding/Special" : "Party/Formal";

            return (
              <div
                key={look.orderId}
                id={`saved-look-card-${look.orderId}`}
                className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Look Photo Banner */}
                <div className="relative aspect-[4/3] bg-purple-50 overflow-hidden">
                  <img
                    src={primaryImage}
                    alt="Saved Outfit Look"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600";
                    }}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  {look.sizing && (
                    <span className="absolute top-4 left-4 bg-purple-900/90 text-[10px] text-white font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                      Size {look.sizing}
                    </span>
                  )}
                  <span className="absolute top-4 right-4 bg-white/95 text-[10px] text-purple-900 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-purple-100">
                    {look.orderId.substring(0, 8)}
                  </span>
                </div>

                {/* Card Content details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[#ac2471] font-sans text-[10px] font-extrabold tracking-widest uppercase">
                        {lookOccasion} Outfit
                      </span>
                      <span className="text-zinc-500 font-mono text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(look.date)}
                      </span>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-purple-950 line-clamp-1">
                      {look.outfit.top?.name || "Bespoke Evening Combination"}
                    </h4>

                    {/* Show Measurements Used */}
                    <div className="mt-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 font-sans">
                      <span className="text-[9px] font-black tracking-wider uppercase text-zinc-400 block mb-1">
                        Body Measurements Snapshot
                      </span>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                        Shoulders: <strong className="text-slate-900">34"</strong> • Waist: <strong className="text-slate-900">26"</strong> • Hips: <strong className="text-slate-900">35"</strong>
                      </p>
                    </div>

                    {/* Constituent Products preview */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {look.outfit.top && (
                        <span className="bg-purple-50/60 border border-purple-100/50 text-purple-900 text-[10px] px-2.5 py-1 rounded-lg">
                          👕 Top
                        </span>
                      )}
                      {look.outfit.bottom && (
                        <span className="bg-purple-50/60 border border-purple-100/50 text-purple-900 text-[10px] px-2.5 py-1 rounded-lg">
                          👖 Bottom
                        </span>
                      )}
                      {look.outfit.footwear && (
                        <span className="bg-purple-50/60 border border-purple-100/50 text-purple-900 text-[10px] px-2.5 py-1 rounded-lg">
                          👠 Shoes
                        </span>
                      )}
                      {look.outfit.accessories && (
                        <span className="bg-purple-50/60 border border-purple-100/50 text-purple-900 text-[10px] px-2.5 py-1 rounded-lg">
                          👜 Accent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Actions row */}
                  <div className="mt-6 pt-5 border-t border-purple-50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Total Value
                      </span>
                      <span className="text-purple-950 font-serif text-xl font-bold flex items-center">
                        ${look.totalAmount}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLook(look)}
                        className="px-3.5 py-2 border border-purple-200 hover:bg-purple-50 text-purple-900 rounded-xl text-xs font-bold leading-none cursor-pointer"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(look)}
                        className="px-4 py-2 bg-[#ac2471] hover:bg-[#8f195b] text-white rounded-xl text-xs font-bold leading-none shadow-sm cursor-pointer"
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Look Detail Modal */}
      {selectedLook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-purple-100 relative animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-purple-950 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setSelectedLook(null)}
                className="absolute top-4 right-4 text-purple-100 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-[#ffd7f5] text-[10px] font-black uppercase tracking-widest block mb-1">
                Outfit Ledger Coordinates
              </span>
              <h3 className="font-serif text-xl font-black">
                Look ID: {selectedLook.orderId}
              </h3>
              <p className="text-white/70 text-xs mt-1">
                Finalized {formatDate(selectedLook.date)}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Sizing & Location info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100/50">
                  <span className="text-[9px] text-[#ac2471] font-bold block uppercase tracking-wider">
                    Fittings Profile
                  </span>
                  <p className="text-slate-800 text-xs font-bold mt-1">
                    Skeletally Calibrated Sizing: {selectedLook.sizing || "M"}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                    Delivery Address
                  </span>
                  <p className="text-slate-700 text-[10px] truncate mt-1">
                    {selectedLook.shippingAddress || "Main Registry Residence"}
                  </p>
                </div>
              </div>

              {/* Items in the outfit */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#73636f] border-b border-purple-50 pb-2">
                  Composition Garments
                </h4>

                {Object.entries(selectedLook.outfit).map(([category, item]) => {
                  if (!item) return null;
                  const catLabel =
                    category === "top"
                      ? "Topwear"
                      : category === "bottom"
                      ? "Bottomwear"
                      : category === "footwear"
                      ? "Footwear"
                      : "Accents";
                  return (
                    <div
                      key={category}
                      className="flex items-center gap-4 p-3 border border-slate-50 rounded-xl hover:bg-slate-50"
                    >
                      <div className="w-12 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600";
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <span className="text-[9px] text-[#ac2471] font-bold block uppercase tracking-wider leading-none mb-1">
                          {catLabel}
                        </span>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          ID: {item.id}
                        </p>
                      </div>
                      <span className="text-purple-950 font-serif font-black text-sm">
                        ${item.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-purple-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">
                  Total Order Amount
                </span>
                <span className="font-serif text-2xl font-black text-purple-950">
                  ${selectedLook.totalAmount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleReorder(selectedLook);
                  setSelectedLook(null);
                }}
                className="bg-purple-950 hover:bg-purple-900 text-white px-6 py-3 rounded-full font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
              >
                Load to Fitting room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
