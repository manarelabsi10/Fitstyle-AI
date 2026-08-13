import React, { useState, useEffect } from "react";
import LoginView from "./components/LoginView";
import ShopperStudioView from "./components/ShopperStudioView";
import AdminDashboard from "./components/AdminDashboard";
import LandingPage from "./components/LandingPage";
import { Product, UserProfile } from "./types";
import { db, auth } from "./firebase";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { STATIC_FALLBACK_PRODUCTS } from "./data/fallbackProducts";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>(STATIC_FALLBACK_PRODUCTS);
  const [appReady, setAppReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Custom navigation views
  const [currentView, setCurrentView] = useState<"home" | "trending" | "my-looks" | "wardrobe" | "fitting-studio">("home");
  const [authRedirectTarget, setAuthRedirectTarget] = useState<"home" | "trending" | "my-looks" | "wardrobe" | "fitting-studio" | null>(null);
  const [authMessage, setAuthMessage] = useState<string>("");
  const [initialOutfit, setInitialOutfit] = useState<any>(null);

  // Initialize and load user profile + products
  useEffect(() => {
    // Check locally logged sessions as initial state
    const activeSession = localStorage.getItem("active_user_session_fitstyle");
    if (activeSession) {
      try {
        setCurrentUser(JSON.parse(activeSession));
      } catch (err) {
        console.error("Session decoding failed, starting clean", err);
      }
    }

    // Subscribe to Firebase Auth changes to sync reliably
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No active user or logged out
        setCurrentUser(null);
        localStorage.removeItem("active_user_session_fitstyle");
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const profile = userDocSnap.data() as UserProfile;
          setCurrentUser(profile);
          localStorage.setItem("active_user_session_fitstyle", JSON.stringify(profile));
        } else {
          const profile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            fullName: user.displayName || user.email?.split("@")[0] || "FitStyle User",
            role: "shopper"
          };
          await setDoc(userDocRef, profile);
          setCurrentUser(profile);
          localStorage.setItem("active_user_session_fitstyle", JSON.stringify(profile));
        }
      } catch (authProfileErr) {
        console.warn("Unable to sync Firebase auth user profile, retaining local session if present.", authProfileErr);
      }
    });

    // Load items from Firestore Products collection
    const fetchCatalog = async () => {
      try {
        const prodColRef = collection(db, "products");
        const snap = await getDocs(prodColRef);
        const list: Product[] = snap.docs.map((doc) => {
          const data = doc.data();
          const firstOccasion = data.occasions && data.occasions.length > 0 ? data.occasions[0] : (data.occasion || "Wedding");
          
          const rawCat = data.category || "top";
          let normalizedCategory: any = "top";
          if (rawCat === "Shoes" || rawCat === "footwear" || rawCat.toLowerCase() === "shoes" || rawCat.toLowerCase() === "footwear") {
            normalizedCategory = "footwear";
          } else if (rawCat === "Accessories" || rawCat === "accessories" || rawCat.toLowerCase() === "accessories") {
            normalizedCategory = "accessories";
          } else if (
            rawCat === "Wedding" || rawCat === "Party" || rawCat === "Casual" || rawCat === "Formal" ||
            rawCat.toLowerCase() === "wedding" || rawCat.toLowerCase() === "party" || rawCat.toLowerCase() === "casual" || rawCat.toLowerCase() === "formal"
          ) {
            const nameLower = (data.name || "").toLowerCase();
            if (
              nameLower.includes("skirt") || 
              nameLower.includes("jeans") || 
              nameLower.includes("pants") || 
              nameLower.includes("trousers") || 
              nameLower.includes("shorts") || 
              nameLower.includes("bottom")
            ) {
              normalizedCategory = "bottom";
            } else {
              normalizedCategory = "top";
            }
          } else {
            normalizedCategory = rawCat;
          }

          const parsedSize = data.size || (data.sizes && Array.isArray(data.sizes) ? data.sizes.join(", ") : "M");

          return {
            id: doc.id,
            name: data.name || "Bespoke Garment",
            category: normalizedCategory,
            colour: data.colour || data.color || "Bespoke",
            occasion: firstOccasion as any,
            size: parsedSize,
            price: typeof data.price === "number" ? data.price : Number(data.price) || 120,
            image: data.imageUrl || data.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
            shapes: data.shapes || ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
            occasions: data.occasions || [firstOccasion],
            inStock: data.inStock !== false
          };
        });

        if (list.length > 0) {
          // Merge any missing static fallback products into the live catalogue so new items
          // like the party jumpsuit are available even when Firestore is already populated.
          const missingFallbackProducts = STATIC_FALLBACK_PRODUCTS.filter((fallback) =>
            !list.some((item) => item.id === fallback.id)
          );
          if (missingFallbackProducts.length > 0) {
            list.push(...missingFallbackProducts);
          }

          const hasLegacyProducts = list.some(item => 
            !STATIC_FALLBACK_PRODUCTS.some(sp => sp.id === item.id)
          );

          if (hasLegacyProducts) {
            console.log("Legacy products detected in Firestore. Purging old items and seeding new women-only catalog...");
            // 1. Delete outdated products from Firestore
            for (const item of list) {
              try {
                await deleteDoc(doc(db, "products", item.id));
              } catch (delErr) {
                console.warn(`Failed to delete outdated product ${item.id}`, delErr);
              }
            }

            // 2. Seed clean new women-only catalog into Firestore
            const newlySeeded: Product[] = [];
            for (const sp of STATIC_FALLBACK_PRODUCTS) {
              try {
                const docRef = doc(db, "products", sp.id);
                await setDoc(docRef, {
                  name: sp.name,
                  category: sp.category,
                  imageUrl: sp.image,
                  price: sp.price,
                  occasions: sp.occasions || [sp.occasion],
                  shapes: sp.shapes || ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
                  colour: sp.colour || "Bespoke",
                  size: sp.size || "M",
                  inStock: sp.inStock !== false
                });
                newlySeeded.push(sp);
              } catch (seedErr) {
                console.warn(`Pre-seeding product ${sp.name} into Firestore failed`, seedErr);
              }
            }
            // Fallback set in case some Firestore requests throttled/failed in dev sandbox environment
            setProducts(newlySeeded.length > 0 ? newlySeeded : STATIC_FALLBACK_PRODUCTS);
          } else {
            // Sync any wrong or outdated images to Firestore automatically
            const syncedList: Product[] = [];
            for (const item of list) {
              // Find correct image by matching name (case-insensitive) or id from verified static products
              const staticMatch = STATIC_FALLBACK_PRODUCTS.find(
                (sp) => sp.id === item.id || sp.name.toLowerCase() === item.name.toLowerCase()
              );

              if (staticMatch && item.image !== staticMatch.image && !item.image.includes("placehold.co")) {
                const updatedItem = { ...item, image: staticMatch.image };
                syncedList.push(updatedItem);
                
                // Asynchronously update Firestore to propagate verified image
                try {
                  const docRef = doc(db, "products", item.id);
                  await setDoc(docRef, {
                    name: item.name,
                    category: item.category,
                    imageUrl: staticMatch.image,
                    price: item.price,
                    occasions: item.occasions || [item.occasion],
                    shapes: item.shapes || ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
                    colour: item.colour || "Bespoke",
                    size: item.size || "M",
                    inStock: item.inStock !== false,
                    badge: null // Remove any extra status/badge from Firestore if present
                  }, { merge: true });
                } catch (updateErr) {
                  console.warn(`Firestore background sync failed for product: ${item.name}`, updateErr);
                }
              } else {
                syncedList.push(item);
              }
            }
            setProducts(syncedList);
          }
        } else {
          // If Firestore is empty, seed verified list
          setProducts(STATIC_FALLBACK_PRODUCTS);
          for (const sp of STATIC_FALLBACK_PRODUCTS) {
            try {
              const docRef = doc(db, "products", sp.id);
              await setDoc(docRef, {
                name: sp.name,
                category: sp.category,
                imageUrl: sp.image,
                price: sp.price,
                occasions: sp.occasions || [sp.occasion],
                shapes: sp.shapes || ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
                colour: sp.colour || "Bespoke",
                size: sp.size || "M",
                inStock: sp.inStock !== false
              });
            } catch (seedErr) {
              console.warn("Pre-seeding products into Firestore failed", seedErr);
            }
          }
        }
      } catch (err) {
        console.warn("Firestore product collection offline or empty, falling back to local preseeded sandbox.", err);
        setProducts(STATIC_FALLBACK_PRODUCTS);
      } finally {
        setAppReady(true);
      }
    };

    fetchCatalog();
    return () => unsubscribe();
  }, []);

  // Sync state helpers
  const handleUserLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem("active_user_session_fitstyle", JSON.stringify(user));
    
    if (authRedirectTarget) {
      setCurrentView(authRedirectTarget);
      setAuthRedirectTarget(null);
      setAuthMessage("");
    } else if (user.role === "shopper") {
      setCurrentView("fitting-studio");
    }
    setShowAuth(false);
  };

  const handleInstantLogin = () => {
    const defaultUser: UserProfile = {
      uid: "usr-evelyn",
      email: "evelyn@fitstyle.ai",
      fullName: "Evelyn Harper",
      role: "shopper"
    };
    handleUserLogin(defaultUser);
  };

  const handleUserLogout = () => {
    signOut(auth).catch((err) => console.error("Signout error", err));
    setCurrentUser(null);
    setShowAuth(false);
    setCurrentView("home");
    setInitialOutfit(null);
    localStorage.removeItem("active_user_session_fitstyle");
  };

  // Add item
  const handleAddProduct = async (newProd: Omit<Product, "id"> & { id?: string }) => {
    try {
      const docId = newProd.id || `prod-${Date.now()}`;
      const docRef = doc(db, "products", docId);
      const isCustomArrayOccasions = (newProd as any).occasions && Array.isArray((newProd as any).occasions);
      const isCustomArrayShapes = (newProd as any).shapes && Array.isArray((newProd as any).shapes);

      const dataToSave = {
        name: newProd.name,
        category: newProd.category,
        imageUrl: newProd.image,
        price: Number(newProd.price) || 0,
        occasions: isCustomArrayOccasions ? (newProd as any).occasions : [newProd.occasion],
        shapes: isCustomArrayShapes ? (newProd as any).shapes : ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
        colour: newProd.colour || "Bespoke",
        size: newProd.size || "M",
        inStock: newProd.inStock !== false
      };

      await setDoc(docRef, dataToSave);
      const saved: Product = {
        id: docId,
        ...newProd,
        inStock: dataToSave.inStock,
        occasions: dataToSave.occasions,
        shapes: dataToSave.shapes
      };
      setProducts((prev) => [...prev, saved]);
    } catch (err) {
      console.warn("Firestore save failed - saving to client memory directly", err);
      const localSaved: Product = {
        id: newProd.id || `prod-${Date.now()}`,
        ...newProd,
        inStock: newProd.inStock !== false
      };
      setProducts((prev) => [...prev, localSaved]);
    }
  };

  // Update Item
  const handleUpdateProduct = async (p: Product) => {
    try {
      const docRef = doc(db, "products", p.id);
      const dataToSave = {
        name: p.name,
        category: p.category,
        imageUrl: p.image,
        price: Number(p.price) || 0,
        occasions: p.occasions || [p.occasion],
        shapes: p.shapes || ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
        colour: p.colour || "Bespoke",
        size: p.size || "M",
        inStock: p.inStock !== false
      };

      await setDoc(docRef, dataToSave, { merge: true });
      setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
    } catch (err) {
      console.warn("Firestore update failed - updating client memory directly", err);
      setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
    }
  };

  // Delete item
  const handleDeleteProduct = async (id: string) => {
    try {
      const docRef = doc(db, "products", id);
      await deleteDoc(docRef);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.warn("Firestore delete failed - deleting from client memory directly", err);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  if (!appReady) {
    return (
      <div className="min-h-screen bg-[#fffcfc] flex flex-col justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-outfit text-xs text-[#73636f] tracking-widest uppercase font-semibold">
          Activating FitStyle AI...
        </p>
      </div>
    );
  }

  // Auth Routing Gate: Show full-screen Login/Signup View if showAuth is true
  if (showAuth) {
    return (
      <div className="relative">
        {/* Back to Home Button on Top Left Overlying screen with premium styles */}
        <button
          type="button"
          onClick={() => {
            setShowAuth(false);
            setAuthRedirectTarget(null);
            setAuthMessage("");
          }}
          className="absolute top-6 left-6 z-50 flex items-center gap-1.5 bg-white text-[#5a005a] border border-[#5a005a]/20 py-2.5 px-4 rounded-xl font-outfit text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
        >
          ← Back to Home
        </button>
        <LoginView 
          onLogin={handleUserLogin} 
          initialMessage={authMessage}
        />
      </div>
    );
  }

  // Admin routing
  if (currentUser && currentUser.role === "owner") {
    return (
      <AdminDashboard
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        currentUser={currentUser}
        onLogout={handleUserLogout}
      />
    );
  }

  // Active Shopper Fitting Studio View
  if (currentUser && currentView === "fitting-studio") {
    return (
      <ShopperStudioView
        products={products.filter((p) => p.inStock !== false)}
        currentUser={currentUser}
        onLogout={handleUserLogout}
        onLogin={handleUserLogin}
        onBackToPortal={() => {
          setCurrentView("home");
          setInitialOutfit(null);
        }}
        initialOutfit={initialOutfit}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
      />
    );
  }

  // Default / All sub-views under the Landing Page wrapper:
  // Support Guest states & Logged-In Shopper Home pages (Home, Trending, My Looks, Wardrobe)
  return (
    <LandingPage 
      products={products.filter((p) => p.inStock !== false)}
      currentUser={currentUser}
      onLogout={handleUserLogout}
      activeView={currentView === "fitting-studio" ? "home" : currentView}
      setActiveView={setCurrentView}
      onSignIn={(message, redirectTarget) => {
        setAuthMessage(message || "");
        setAuthRedirectTarget((redirectTarget as any) || "home");
        setShowAuth(true);
      }}
      onAdminSignIn={() => {
        setAuthMessage("Store Owners request portal access code below.");
        setAuthRedirectTarget("home");
        setShowAuth(true);
      }}
      onEnterFittingStudio={() => {
        setCurrentView("fitting-studio");
      }}
      setInitialOutfit={setInitialOutfit}
    />
  );
}
