import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Sparkles, User, ShieldCheck } from "lucide-react";
import { UserProfile } from "../types";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import fitStyleLogo from "../assets/images/fitstyle_ai_logo_1780811765736.png";

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
  initialMessage?: string;
  initialView?: "login" | "signup";
}

const RealGoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0 mr-1.5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const RealAppleIcon = () => (
  <svg className="w-5 h-5 shrink-0 mr-1.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.02-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

export default function LoginView({ onLogin, initialMessage, initialView }: LoginViewProps) {
  const [view, setView] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"shopper" | "owner">("shopper");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [infoBanner, setInfoBanner] = useState("");
  const isLocalhost = typeof window !== "undefined" && window.location.hostname.includes("localhost");

  useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
  }, [initialView]);

  useEffect(() => {
    if (initialMessage) {
      setInfoBanner(initialMessage);
    } else {
      setInfoBanner("");
    }
  }, [initialMessage]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill in email and password fields.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let userProfile: UserProfile;
        if (userDocSnap.exists()) {
          userProfile = userDocSnap.data() as UserProfile;
          if (!userProfile.role) {
            userProfile.role = role;
          }
        } else {
          userProfile = {
            uid: user.uid,
            email: user.email || email,
            fullName: user.displayName || email.split("@")[0],
            role: role
          };
          await setDoc(userDocRef, userProfile);
        }

        setSuccessMsg("Success! Accessing your styling studio...");
        setTimeout(() => {
          onLogin(userProfile);
        }, 1000);
      })
      .catch((err: any) => {
        setErrorMsg("Authentication failed: " + (err.message || "Please check your email and password."));
      });
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password || !fullName) {
      setErrorMsg("Please provide your full name, email, and password to register.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must meet the 6 character minimum limit.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: user.email || email,
          fullName: fullName,
          role: role
        };

        // Create user document on Firestore users/{userId} path
        await setDoc(doc(db, "users", user.uid), newUserProfile);

        setSuccessMsg("Account created! Logging you into the styling studio...");
        setTimeout(() => {
          onLogin(newUserProfile);
        }, 1000);
      })
      .catch((err: any) => {
        setErrorMsg("Registration failed: " + (err.message || "An error occurred during account creation."));
      });
  };

  const handleSocialLogin = (providerName: "google" | "apple") => {
    setErrorMsg("");
    setSuccessMsg("");

    if (providerName === "apple") {
      const provider = new OAuthProvider("apple.com");
      signInWithPopup(auth, provider)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          let userProfile: UserProfile;
          if (userDocSnap.exists()) {
            userProfile = userDocSnap.data() as UserProfile;
          } else {
            userProfile = {
              uid: user.uid,
              email: user.email || "",
              fullName: user.displayName || user.email?.split("@")[0] || "Apple User",
              role: role
            };
            await setDoc(userDocRef, userProfile);
          }

          setSuccessMsg("Success! Accessing your styling studio...");
          setTimeout(() => {
            onLogin(userProfile);
          }, 800);
        })
        .catch((err: any) => {
          if (err.code === "auth/popup-blocked") {
            setErrorMsg("Please allow popups for this site and try again");
          } else if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
            setErrorMsg("");
          } else {
            setErrorMsg("Apple Authentication failed: " + (err.message || "Please try again."));
          }
        });
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account"
    });
    signInWithPopup(auth, provider)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let userProfile: UserProfile;
        if (userDocSnap.exists()) {
          userProfile = userDocSnap.data() as UserProfile;
        } else {
          userProfile = {
            uid: user.uid,
            email: user.email || "",
            fullName: user.displayName || user.email?.split("@")[0] || "Google User",
            role: role
          };
          await setDoc(userDocRef, userProfile);
        }

        setSuccessMsg("Success! Accessing your styling studio...");
        setTimeout(() => {
          onLogin(userProfile);
        }, 800);
      })
      .catch((err: any) => {
        if (err.code === "auth/popup-blocked") {
          setErrorMsg("Please allow popups for this site and try again");
        } else if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
          setErrorMsg("");
        } else {
          setErrorMsg("Google Authentication failed: " + (err.message || "Please try again."));
        }
      });
  };

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row bg-[#fff7f9] text-[#221920] font-sans selection:bg-[#fae9f3] selection:text-[#5a005a]">
      
      {/* 1. Left Visual Banner - Dynamically shifts based on Login or Signup View */}
      {view === "login" ? (
        /* Image 1: High fashion model in a beige designer pantsuit and corridor design */
        <section className="relative w-full md:w-1/2 lg:w-[48%] min-h-[40vh] md:min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="High fashion luxury model in beige tailored pantsuit walking corridor"
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200"
              className="w-full h-full object-cover brightness-[0.75] contrast-[1.05]"
            />
            {/* Visual shadows to recreate the sleek editorial ambient lighting */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#221920]/80 via-transparent to-black/20" />
          </div>

          {/* Central Logo Overlay - Glassmorphic Pink Circle */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 relative w-28 h-28 border-2 border-white rounded-full shadow-2xl overflow-hidden transition-transform hover:scale-105 duration-500">
              <img src={fitStyleLogo} alt="FitStyle Logo" className="w-full h-full object-cover" />
            </div>

            <h1 className="font-playfair text-4xl lg:text-5xl text-white font-extrabold tracking-tight drop-shadow-lg mb-1">
              FitStyle AI
            </h1>
            <p className="font-outfit text-xs text-purple-100 uppercase tracking-[0.25em] font-semibold mb-6">
              YOUR PERSONAL AI STYLIST
            </p>
            <div className="h-[1px] w-20 bg-white/45 mx-auto mb-4" />
            <p className="font-playfair italic text-xs md:text-sm text-purple-50/90 tracking-wide max-w-sm">
              "Curated elegance, powered by intelligence."
            </p>
          </div>

          {/* Absolute bottom copyright badge inline with modern image */}
          <div className="absolute bottom-6 left-8 z-10 text-[9px] font-outfit uppercase tracking-[0.3em] text-white/50">
            HAUTE INTELLIGENCE © 2024
          </div>
        </section>
      ) : (
        /* Image 2: Create Account Lavender Pastel Block Design */
        <section className="relative w-full md:w-1/2 lg:w-[48%] min-h-[40vh] md:min-h-screen flex flex-col items-center justify-center p-8 bg-[#d1c2d0] overflow-hidden">
          {/* Subtle lavender gradient meshes to add premium finish */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#c4b3c3] via-[#d1c2d0] to-[#dfd1de]" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* The circular mockup block on the left with our custom logo */}
            <div className="mb-6 relative w-28 h-28 border-[4px] border-white rounded-full shadow-xl overflow-hidden">
              <img src={fitStyleLogo} alt="FitStyle Logo" className="w-full h-full object-cover" />
            </div>

            <h1 className="font-playfair text-4xl lg:text-5xl text-white font-bold tracking-tight mb-2 drop-shadow-sm">
              FitStyle AI
            </h1>
            <p className="font-outfit text-[11px] text-white/95 uppercase tracking-[0.25em] font-semibold">
              YOUR PERSONAL AI STYLIST
            </p>
          </div>

          <div className="absolute bottom-6 left-8 z-10 text-[9px] font-outfit uppercase tracking-[0.3em] text-white/60">
            HAUTE INTELLIGENCE © 2024
          </div>
        </section>
      )}


      {/* 2. Control Authentication Right Form Panel */}
      <section className="w-full md:w-1/2 lg:w-[52%] flex flex-col justify-center items-center bg-[#ffffff] p-6 sm:p-12 md:p-16 relative z-20">
        <div className="w-full max-w-md">
          
          {/* View Specific Header */}
          {view === "login" ? (
            /* Welcome Back text header in dark purple serif */
            <div className="mb-6">
              <h2 className="font-playfair text-3xl font-extrabold text-[#5a005a] leading-tight mb-2">
                Welcome back
              </h2>
              <p className="font-sans text-sm text-[#52424e] font-light leading-relaxed">
                Enter your credentials to access your styling studio.
              </p>
            </div>
          ) : (
            /* Create Account text header */
            <div className="mb-6">
              <h2 className="font-playfair text-3xl font-extrabold text-[#5a005a] leading-tight mb-2">
                Create Account
              </h2>
              <p className="font-sans text-sm text-[#52424e] font-light leading-relaxed">
                Step into the future of curated fashion.
              </p>
            </div>
          )}

          {/* Feedback Badges */}
          {infoBanner && (
            <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-150 text-purple-950 text-xs font-semibold flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#ac2471] shrink-0 animate-pulse" />
              <span>{infoBanner}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100/80 text-[#ac2471] text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ac2471] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100/80 text-emerald-700 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Core Authed Form */}
          <form className="space-y-6" onSubmit={view === "login" ? handleSignIn : handleCreateAccount}>
            
            {/* Account Type / Role Capsule Selector */}
            <div>
              <label id="access-role-label" className="block text-[10px] font-outfit uppercase tracking-[0.2em] text-[#73636f] font-bold mb-2">
                {view === "login" ? "Choose Access Space" : "ACCOUNT TYPE"}
              </label>
              
              <div className="p-1 bg-[#fff2f7] rounded-xl flex gap-1 border border-[#fbdde8]">
                <button
                  type="button"
                  onClick={() => setRole("shopper")}
                  className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    role === "shopper"
                      ? "bg-white text-[#5a005a] shadow-sm font-black"
                      : "text-zinc-500 hover:text-[#5a005a]"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Shopper
                </button>
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    role === "owner"
                      ? "bg-white text-[#5a005a] shadow-sm font-black"
                      : "text-zinc-500 hover:text-[#5a005a]"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Store Owner
                </button>
              </div>
            </div>

            {view === "signup" && role === "owner" ? (
              /* Store Owner Special Invitation-Only Box */
              <div className="p-6 rounded-2xl border border-[#eed0de] bg-[#fff7fa]/40 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#fae9f3] text-[#5a005a] text-2xl">
                  🏪
                </div>
                <h3 className="font-playfair text-xl font-bold text-[#5a005a]">
                  Store Owner Access
                </h3>
                <p className="font-sans text-sm text-[#52424e] leading-relaxed">
                  Store owner accounts are by invitation only.
                </p>
                <div className="py-1">
                  <p className="font-outfit text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                    To request access, contact us:
                  </p>
                  <p className="font-mono text-[#5a005a] font-bold text-sm select-all">
                    owners@fitstyle.ai
                  </p>
                </div>
                <a
                  href="mailto:owners@fitstyle.ai?subject=Store%20Owner%20Access%20Request"
                  className="block w-full py-3.5 px-4 bg-[#5a005a] hover:bg-[#430043] text-white rounded-xl font-outfit text-xs font-bold uppercase tracking-[0.16em] shadow-lg shadow-purple-900/10 hover:shadow-purple-900/20 text-center active:scale-98 transition-all"
                >
                  REQUEST STORE ACCESS
                </a>
              </div>
            ) : (
              <>
                {/* FULL NAME is parsed purely in Create Account mode */}
                {view === "signup" && (
                  <div>
                    <label className="block text-[10px] font-outfit uppercase tracking-[0.2em] text-[#73636f] font-bold mb-1.5">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Evelyn Harper"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#fff7fa]/50 px-4 py-3 rounded-xl border border-[#eed0de] focus:bg-white focus:border-[#5a005a] focus:ring-1 focus:ring-[#5a005a]/20 transition-all outline-none font-sans text-sm text-[#221920]"
                    />
                  </div>
                )}

                {/* EMAIL CONTAINER */}
                <div>
                  <label className="block text-[10px] font-outfit uppercase tracking-[0.2em] text-[#73636f] font-bold mb-1.5">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={view === "login" ? "name@example.com" : "evelyn@fitstyle.ai"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#fff7fa]/50 px-4 py-3 rounded-xl border border-[#eed0de] focus:bg-white focus:border-[#5a005a] focus:ring-1 focus:ring-[#5a005a]/20 transition-all outline-none font-sans text-sm text-[#221920]"
                  />
                </div>

                {/* PASSWORD CONTAINER WITH RIGHT HELPER ACTIONS */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-outfit uppercase tracking-[0.2em] text-[#73636f] font-bold">
                      PASSWORD
                    </label>
                    
                    {view === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail("evelyn@fitstyle.ai");
                          setPassword("evelyn123");
                          setFullName("Evelyn Harper");
                          setSuccessMsg("Pre-filled Evelyn's credentials safely. Click Sign In Below.");
                        }}
                        className="text-[10px] font-bold text-[#ac2471] hover:underline uppercase tracking-wider"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#fff7fa]/50 pl-4 pr-11 py-3 rounded-xl border border-[#eed0de] focus:bg-white focus:border-[#5a005a] focus:ring-1 focus:ring-[#5a005a]/20 transition-all outline-none font-sans text-sm text-[#221920]"
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-zinc-400 hover:text-[#5a005a] transition-all focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Core Click Button */}
                <button
                  type="submit"
                  className="w-full py-4 px-4 bg-[#5a005a] hover:bg-[#430043] text-white rounded-xl font-outfit text-xs font-bold uppercase tracking-[0.16em] shadow-lg shadow-purple-950/10 hover:shadow-purple-900/20 active:scale-98 transition-all"
                >
                  {view === "login" ? "SIGN IN TO STUDIO" : "CREATE ACCOUNT"}
                </button>

                {/* Image 1: Customized continue options divider line */}
                <div className="relative py-2 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#f2e1eb]" />
                  </div>
                  <span className="relative px-3.5 bg-white text-[9px] font-bold font-outfit uppercase tracking-[0.2em] text-[#ac2471]/80">
                    OR CONTINUE WITH
                  </span>
                </div>

                {/* Custom Google & Apple Brand Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    className="flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl border border-[#f0dae4] hover:bg-[#fff7fa]/60 active:scale-98 transition-all text-xs text-[#221920] font-sans font-medium"
                  >
                    <RealGoogleIcon />
                    <span className="font-bold tracking-tight">GOOGLE</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("apple")}
                    className="flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl border border-[#f0dae4] hover:bg-[#fff7fa]/60 active:scale-98 transition-all text-xs text-[#221920] font-sans font-medium"
                  >
                    <RealAppleIcon />
                    <span className="font-bold">Apple</span>
                  </button>
                </div>

                {isLocalhost && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => onLogin({ uid: "usr-evelyn", email: "evelyn@fitstyle.ai", fullName: "Evelyn Harper", role: "shopper" })}
                      className="inline-flex items-center justify-center rounded-3xl bg-[#ac2471] text-white py-3 px-4 text-xs font-semibold uppercase tracking-[0.15em] shadow-lg shadow-[#ac2471]/20 hover:bg-[#8f1f5a] transition-all"
                    >
                      DEMO SHOPPER ACCESS
                    </button>
                  </div>
                )}
              </>
            )}
          </form>

          {/* Footer view toggle */}
          <div className="mt-10 text-center text-sm">
            {view === "login" ? (
              <p className="text-zinc-500 font-light text-xs md:text-sm">
                New to the collection?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("signup");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="font-bold text-[#5a005a] hover:underline uppercase tracking-wide ml-1 focus:outline-none"
                >
                  SIGN UP
                </button>
              </p>
            ) : role === "owner" ? (
              <p className="text-zinc-500 font-light text-xs md:text-sm">
                Already a store owner?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setRole("owner");
                    setErrorMsg("");
                    setSuccessMsg("Please sign in with your email.");
                  }}
                  className="font-bold text-[#5a005a] hover:underline uppercase tracking-wide ml-1 focus:outline-none"
                >
                  SIGN IN HERE
                </button>
              </p>
            ) : (
              <p className="text-zinc-500 font-light text-xs md:text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setErrorMsg("");
                    setSuccessMsg("Please sign in with your email.");
                  }}
                  className="font-bold text-[#5a005a] hover:underline uppercase tracking-wide ml-1 focus:outline-none"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>

          {/* Extra Mini Links for Signup Screen */}
          {view === "signup" && (
            <div className="mt-8 flex justify-center gap-4 text-[9px] font-bold font-outfit uppercase tracking-[0.25em] text-zinc-400">
              <span className="hover:text-[#5a005a] cursor-pointer">TERMS</span>
              <span>•</span>
              <span className="hover:text-[#5a005a] cursor-pointer">PRIVACY</span>
              <span>•</span>
              <span className="hover:text-[#5a005a] cursor-pointer">SUPPORT</span>
            </div>
          )}

          {/* Exact Copyright line matching user diagram */}
          <div className="mt-14 text-center text-[9px] font-outfit uppercase tracking-[0.25em] text-zinc-400">
            {view === "login" 
              ? "© 2024 FITSTYLE AI. ELEVATED INTELLIGENCE."
              : "© 2026 FITSTYLE AI — CURATED WITH INTELLIGENCE."}
          </div>

        </div>
      </section>
    </div>
  );
}

