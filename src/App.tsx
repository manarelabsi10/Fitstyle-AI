import React, { useState, useEffect } from "react";
import LoginView from "./components/LoginView";
import ShopperStudioView from "./components/ShopperStudioView";
import AdminDashboard from "./components/AdminDashboard";
import LandingPage from "./components/LandingPage";
import { Product, UserProfile } from "./types";
import { getCurrentUser, signOut, fetchUserAttributes } from "aws-amplify/auth";
import "./amplifyConfig";
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

    // Check for an existing Cognito session (covers: page refresh after email/password
    // login, AND the redirect back from Google via Cognito's Hosted UI).
    // Unlike Firebase's onAuthStateChanged, Amplify doesn't push "logged out" as a
    // default event -- getCurrentUser() simply throws if there's no session, which we
    // treat as "nothing to do here, keep whatever localStorage already restored above."
    (async () => {
      try {
        const { userId } = await getCurrentUser();
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const profile: UserProfile = await res.json();
          setCurrentUser(profile);
          localStorage.setItem("active_user_session_fitstyle", JSON.stringify(profile));
        } else if (res.status === 404) {
          // Signed into Cognito (e.g. just came back from Google) but no profile
          // saved yet -- create one now, pulling the real name/email Google gave us
          // (requires the "name" attribute_mapping in infra/cognito_google_idp.tf).
          let realEmail = "";
          let realName = "FitStyle User";
          try {
            const attrs = await fetchUserAttributes();
            realEmail = attrs.email || "";
            realName = attrs.name || (realEmail ? realEmail.split("@")[0] : "FitStyle User");
          } catch (attrErr) {
            console.warn("Could not fetch Cognito user attributes, using placeholder name", attrErr);
          }
          const profile: UserProfile = {
            uid: userId,
            email: realEmail,
            fullName: realName,
            role: "shopper",
          };
          await fetch(`/api/users/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
          });
          setCurrentUser(profile);
          localStorage.setItem("active_user_session_fitstyle", JSON.stringify(profile));
        }
      } catch {
        // No active Cognito session -- fine, this just means the user isn't logged
        // in via Cognito right now. Whatever localStorage restored above (if
        // anything) stands.
      }
    })();

    const unsubscribe = () => {}; // kept so the existing cleanup below still compiles

    // Load items from our DynamoDB-backed API (server.ts -> DynamoDB Products table)
    const fetchCatalog = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const list: Product[] = await res.json();
        setProducts(list.length > 0 ? list : STATIC_FALLBACK_PRODUCTS);
      } catch (err) {
        console.warn("Products API unreachable, falling back to local preseeded sandbox.", err);
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

  const handleUserLogout = () => {
    signOut().catch((err) => console.error("Signout error", err));
    setCurrentUser(null);
    setShowAuth(false);
    setCurrentView("home");
    setInitialOutfit(null);
    localStorage.removeItem("active_user_session_fitstyle");
  };

  // Add item
  const handleAddProduct = async (newProd: Omit<Product, "id"> & { id?: string }) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProd),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const saved: Product = await res.json();
      setProducts((prev) => [...prev, saved]);
    } catch (err) {
      console.warn("Add product API call failed - saving to client memory only (won't persist)", err);
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
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const updated: Product = await res.json();
      setProducts((prev) => prev.map((item) => (item.id === p.id ? updated : item)));
    } catch (err) {
      console.warn("Update product API call failed - updating client memory only (won't persist)", err);
      setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
    }
  };

  // Delete item
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.warn("Delete product API call failed - removing from client memory only (won't persist)", err);
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
