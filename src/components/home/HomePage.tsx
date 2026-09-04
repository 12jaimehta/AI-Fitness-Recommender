"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, enter, popIn, fadeUp, press, transition } from "@/components/shared/Motion";
import {
    ArrowRight,
    User,
    LogOut,
    ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { hero } from "@/lib/constant";
import { useCurrentUser, signOutAndClearCache } from "@frontend/features/auth";
import { getUserProfile } from "@/lib/service/progress-database";
import { isProfileComplete } from "@/shared/lib/profile";
import { signedInHomeHref } from "@/shared/lib/app-home";

export default function HomePage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [loadedProfileComplete, setLoadedProfileComplete] = useState(true);
    
    const router = useRouter();
    const { isSignedIn, user } = useCurrentUser();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const profileComplete = !isSignedIn || loadedProfileComplete;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        try {
            await signOutAndClearCache();
            router.refresh();
            setIsUserMenuOpen(false);
            setIsMobileMenuOpen(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
    const homeHref = isSignedIn ? signedInHomeHref(profileComplete) : "/";

    useEffect(() => {
        if (!isSignedIn) return;
        let cancelled = false;
        getUserProfile()
            .then((profile) => {
                if (!cancelled) setLoadedProfileComplete(isProfileComplete(profile));
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [isSignedIn, user?.id]);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-[1000] bg-transparent border-b border-white/20">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="text-white font-extrabold text-[28px] cursor-pointer transition-transform duration-200 hover:scale-[1.015] text-shadow-md"
                        onClick={() => router.push(homeHref)}
                    >
                        fyteAI
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => router.push(homeHref)} className="nav-link text-white font-semibold hover:text-white/80 transition">Home</button>
                        <button onClick={() => router.push("/diet")} className="nav-link text-white font-semibold hover:text-white/80 transition">Diet Plan</button>
                        <button onClick={() => router.push("/workout")} className="nav-link text-white font-semibold hover:text-white/80 transition">Workout Plan</button>
                        {!(isSignedIn && profileComplete) ? (
                        <button onClick={() => router.push("/progress")} className="nav-link text-white font-semibold hover:text-white/80 transition">Coach</button>
                        ) : null}

                        {/* Modern Auth Section */}
                        {isSignedIn ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white transition-all hover:bg-white/20"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-white/80 flex items-center justify-center text-xs font-bold text-gray-800">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold">{displayName}</span>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            {...popIn}
                                            transition={transition}
                                            className="absolute right-0 mt-2 w-56 rounded-xl border border-white/20 bg-[#282828]/90 backdrop-blur-xl shadow-2xl overflow-hidden py-2"
                                        >
                                            <div className="px-4 py-3 border-b border-white/10 mb-2">
                                                <p className="text-sm text-white font-medium">Signed in as</p>
                                                <p className="text-xs text-white/70 truncate">{user?.email}</p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => router.push('/my-profile')}
                                                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                                            >
                                                <User size={16} /> My Profile
                                            </button>
                                            
                                            <button 
                                                onClick={handleSignOut}
                                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                            >
                                                <LogOut size={16} /> Log out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button 
                                onClick={() => router.push("/sign-in")} 
                                className="px-6 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur text-white text-sm font-semibold hover:bg-white/20 transition-all duration-200 hover:scale-[1.015] cursor-pointer"
                            >
                                Login
                            </button>
                        )}
                    </nav>

                    {/* Mobile Hamburger Button */}
                    <motion.button
                        className="md:hidden p-3 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-xl relative overflow-hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        {...press}
                    >
                        <div className="relative flex flex-col items-center justify-center gap-[5px] w-[26px] h-[26px]">
                            <motion.div
                                className="w-[22px] h-[3px] rounded bg-white"
                                animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }}
                                transition={transition}
                            />
                            <motion.div
                                className="w-[22px] h-[3px] rounded bg-white"
                                animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                                transition={transition}
                            />
                            <motion.div
                                className="w-[22px] h-[3px] rounded bg-white"
                                animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }}
                                transition={transition}
                            />
                        </div>
                    </motion.button>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        {...fadeUp}
                        transition={transition}
                        className="fixed top-[80px] left-0 right-0 bottom-0 z-[999] bg-white border-t border-[#282828]/10 shadow-xl flex flex-col"
                    >
                        <div className="flex-1 p-6 overflow-y-auto">
                            {(isSignedIn && profileComplete
                                ? ["Home", "Diet Plan", "Workout Plan"]
                                : ["Home", "Diet Plan", "Workout Plan", "Coach"]
                            ).map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        const paths: Record<string, string> = {
                                            Home: homeHref,
                                            "Diet Plan": "/diet",
                                            "Workout Plan": "/workout",
                                            Coach: "/progress",
                                        };
                                        router.push(paths[item] || "/");
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left text-[18px] font-semibold text-[#282828] px-5 py-4 rounded-xl mb-2 transition-all duration-300 hover:bg-[#282828]/5"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                        {/* Mobile Auth Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50">
                            {isSignedIn ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-12 h-12 rounded-full bg-[#282828] text-white flex items-center justify-center text-lg font-bold shadow-md">
                                            {displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#282828] text-lg">{displayName}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            router.push("/my-profile");
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 bg-white text-[#282828] font-bold px-6 py-4 rounded-xl transition-transform duration-200 active:scale-[0.985] border border-gray-200"
                                    >
                                        <User size={20} />
                                        My profile
                                    </button>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center justify-center gap-2 bg-[#282828] text-white font-bold px-6 py-4 rounded-xl transition-transform duration-200 active:scale-[0.985]"
                                    >
                                        <LogOut size={20} />
                                        Log out
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        router.push("/sign-in");
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-[#282828] text-white text-[18px] font-semibold px-6 py-4 rounded-xl shadow-lg active:scale-[0.985] transition-transform duration-200"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative w-full h-screen overflow-hidden bg-black">
                <img
                    src={hero.src}
                    alt=""
                    fetchPriority="high"
                    decoding="sync"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
                <div className="absolute top-1/2 left-1/2 w-full max-w-[900px] -translate-x-1/2 -translate-y-1/2 px-5 text-center text-white">
                    <motion.h1
                        {...enter(0.04)}
                        className="font-extrabold leading-tight mb-6 text-shadow-lg text-[clamp(36px,8vw,72px)]"
                    >
                        {hero.title}
                    </motion.h1>
                    <motion.p
                        {...enter(0.08)}
                        className="font-normal mb-8 sm:mb-12 leading-relaxed text-shadow-md text-[clamp(18px,3vw,24px)]"
                    >
                        {hero.subtitle}
                    </motion.p>
                    <motion.button
                        {...enter(0.12)}
                        {...press}
                        onClick={() => {
                            if (isSignedIn && profileComplete) {
                                router.push("/progress");
                                return;
                            }
                            router.push("/diet");
                        }}
                        className="inline-flex max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-white/20 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-white/30 sm:gap-3 sm:px-8 sm:py-4 sm:text-lg"
                    >
                        {hero.cta}
                        <ArrowRight size={18} className="shrink-0" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}