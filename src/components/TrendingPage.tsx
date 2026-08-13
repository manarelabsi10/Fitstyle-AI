import React, { useState, useMemo } from "react";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
import { Product } from "../types";

interface TrendingPageProps {
  products: Product[];
  currentUser: any;
  onSignInRequired: (message: string, redirectTarget: string) => void;
  onTryOutfit: (outfit: any) => void;
}

interface CuratedLook {
  id: string;
  name: string;
  occasion: string;
  image: string;
  likes: number;
  tags: string[];
  topId: string;
  bottomId: string;
  footwearId: string;
  accessoriesId: string;
}

const normalizeString = (value: string) => value?.toLowerCase().trim();

// Generate dynamic looks from products based on occasion
const generateDynamicLooks = (products: Product[]): CuratedLook[] => {
  const looks: CuratedLook[] = [];
  const occasionMap: Record<string, Product[]> = {};

  // Group products by occasion
  products.forEach((product) => {
    const occasion = product.occasion || "Casual";
    if (!occasionMap[occasion]) {
      occasionMap[occasion] = [];
    }
    occasionMap[occasion].push(product);
  });

  // Generate looks for each occasion
  Object.entries(occasionMap).forEach(([occasion, items]) => {
    // Create individual product looks (especially for tops/dresses)
    items.forEach((item, idx) => {
      if (item.category === "top" || item.category === "bottom") {
        looks.push({
          id: `look-${occasion.toLowerCase()}-${item.id}`,
          name: item.name,
          occasion,
          image: item.image || "",
          likes: Math.floor(Math.random() * 500) + 100,
          tags: [item.colour, item.category, item.size],
          topId: item.category === "top" ? item.id : "",
          bottomId: item.category === "bottom" ? item.id : "",
          footwearId: "",
          accessoriesId: ""
        });
      }
    });

    // Create coordinated looks (top + bottom + accessories)
    const tops = items.filter(p => p.category === "top");
    const bottoms = items.filter(p => p.category === "bottom");
    const footwear = items.filter(p => p.category === "footwear");
    const accessories = items.filter(p => p.category === "accessories");

    if (tops.length > 0 && bottoms.length > 0) {
      const top = tops[Math.floor(Math.random() * tops.length)];
      const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      const fw = footwear.length > 0 ? footwear[Math.floor(Math.random() * footwear.length)] : null;
      const acc = accessories.length > 0 ? accessories[Math.floor(Math.random() * accessories.length)] : null;

      looks.push({
        id: `look-coord-${occasion.toLowerCase()}-${Math.random()}`,
        name: `${top.name} + ${bottom.name}`,
        occasion,
        image: top.image || "",
        likes: Math.floor(Math.random() * 600) + 150,
        tags: [top.colour, bottom.colour, "Coordinated"],
        topId: top.id,
        bottomId: bottom.id,
        footwearId: fw?.id || "",
        accessoriesId: acc?.id || ""
      });
    }
  });

  return looks;
};

export default function TrendingPage({ products, currentUser, onSignInRequired, onTryOutfit }: TrendingPageProps) {
  const [selectedOccasion, setSelectedOccasion] = useState<string>("All");
  const [likedLooks, setLikedLooks] = useState<Record<string, boolean>>({});

  const occasions = ["All", "Wedding", "Formal", "Casual", "Party", "Interview"];

  // Generate looks dynamically from products
  const dynamicLooks = useMemo(() => generateDynamicLooks(products), [products]);

  const filteredLooks = useMemo(() => {
    return selectedOccasion === "All"
      ? dynamicLooks
      : dynamicLooks.filter((look) => {
          const lookOccasion = normalizeString(look.occasion || "");
          const selected = normalizeString(selectedOccasion);
          return lookOccasion === selected || lookOccasion.includes(selected) || selected.includes(lookOccasion);
        });
  }, [selectedOccasion, dynamicLooks]);

  const handleLike = (lookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedLooks(prev => ({
      ...prev,
      [lookId]: !prev[lookId]
    }));
  };

  const handleTryOn = (look: CuratedLook) => {
    if (!currentUser) {
      onSignInRequired(
        "Sign in to try on trending looks in our Virtual Studio", 
        "trending"
      );
      return;
    }

    // Resolve real items from database
    const topItem = look.topId ? products.find(p => p.id === look.topId) : null;
    const bottomItem = look.bottomId ? products.find(p => p.id === look.bottomId) : null;
    const footwearItem = look.footwearId ? products.find(p => p.id === look.footwearId) : null;
    const accessoriesItem = look.accessoriesId ? products.find(p => p.id === look.accessoriesId) : null;

    const outfitToLoad = {
      top: topItem || null,
      bottom: bottomItem || null,
      footwear: footwearItem || null,
      accessories: accessoriesItem || null
    };

    onTryOutfit(outfitToLoad);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page Title */}
      <div className="text-center md:text-left mb-10">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-purple-950 flex items-center justify-center md:justify-start gap-2">
          Trending Combinations
        </h2>
        <p className="text-zinc-500 font-sans text-sm mt-2 max-w-xl">
          Discover the internet's most admired haute couture pairings, designed by our in-house algorithms using raw products from our collections.
        </p>
      </div>

      {/* Occasion Filter bar */}
      <div className="flex flex-wrap gap-2.5 justify-center md:justify-start mb-8 pb-4 border-b border-purple-50">
        {occasions.map((o) => (
          <button
            key={o}
            onClick={() => setSelectedOccasion(o)}
            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedOccasion === o
                ? "bg-purple-950 text-white shadow-md shadow-purple-900/10"
                : "bg-white text-zinc-500 hover:text-purple-900 border border-purple-100"
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      {/* Trending Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredLooks.map((look) => {
          // Resolve cost dynamically based on associated real product prices
          const lookProducts = [look.topId, look.bottomId, look.footwearId, look.accessoriesId]
            .map(id => products.find(p => p.id === id))
            .filter(Boolean);

          const rawTotal = lookProducts.reduce((acc, p) => acc + (p?.price || 0), 0);
          // Fallback if elements not fully stored in DB
          const estimatedCost = rawTotal > 0 ? rawTotal : 450;

          const isLiked = !!likedLooks[look.id];

          return (
            <div 
              key={look.id}
              className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative aspect-[3/5] bg-purple-50 overflow-hidden">
                <img 
                  src={look.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"} 
                  alt={look.name} 
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600";
                  }}
                  className="w-full h-full object-contain bg-white group-hover:scale-102 transition-transform duration-500"
                />
                
                {/* Save design to favorite tag toggle */}
                <button
                  type="button"
                  onClick={(e) => handleLike(look.id, e)}
                  className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full text-[#ac2471] hover:scale-110 shadow-sm border border-purple-50 transition-all cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-[#ac2471]" : ""}`} />
                </button>

                {/* Tags in the image left bottom */}
                <span className="absolute bottom-4 left-4 bg-purple-950/90 text-[10px] text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                  {look.occasion}
                </span>
                
                {/* Likes count */}
                <span className="absolute bottom-4 right-4 bg-black/50 text-[10px] text-zinc-100 font-mono px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1">
                  🔥 {look.likes + (isLiked ? 1 : 0)} Likes
                </span>
              </div>

              {/* Contents & products breakdown */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-lg font-bold text-purple-950">
                    {look.name}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {look.tags.map(tag => (
                      <span key={tag} className="text-[#ac2471] font-sans text-[9px] font-bold uppercase tracking-wider bg-pink-50 px-2.5 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Real product IDs mapped row */}
                  <div className="mt-4 pt-3 border-t border-purple-50/50">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-2">Included items</span>
                    <div className="space-y-1.5">
                      {[
                        { label: "👕 Top", id: look.topId },
                        { label: "👖 Bottom", id: look.bottomId },
                        { label: "👠 Footwear", id: look.footwearId },
                        { label: "👜 Accent", id: look.accessoriesId }
                      ].filter(item => item.id).map(item => {
                        const resolvedProduct = products.find(p => p.id === item.id);
                        return (
                          <div key={item.label} className="flex justify-between items-center text-[11px] text-slate-600 font-medium">
                            <span className="truncate max-w-[190px]">{resolvedProduct ? resolvedProduct.name : item.label + " Item"}</span>
                            <span className="font-mono text-[10.5px] text-[#ac2471]">${resolvedProduct ? resolvedProduct.price : "120"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Price and try-on CTA */}
                <div className="mt-6 pt-5 border-t border-purple-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Combined Value</span>
                    <span className="text-purple-950 font-serif text-xl font-bold">${estimatedCost}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTryOn(look)}
                    className="inline-flex items-center gap-1.5 bg-[#ac2471] hover:bg-[#8f195b] text-white px-5 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                  >
                    Try This Look <ArrowRight className="w-4 h-4 animate-pulse" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
