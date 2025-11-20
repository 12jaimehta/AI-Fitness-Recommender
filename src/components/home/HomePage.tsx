"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    User,
    LogOut,
    Settings,
    ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { menuItems, slides } from "@/lib/constant";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { createClient } from "@/lib/supabase/supabase-client";

export default function HomePage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    
    const router = useRouter();
    const { isSignedIn, user } = useCurrentUser();
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Carousel Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [slides.length]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const handleSignOut = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.refresh();
            setIsUserMenuOpen(false);
            setIsMobileMenuOpen(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Extract display name from email if name isn't available
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-[1000] bg-transparent border-b border-white/20">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="text-white font-extrabold text-[28px] cursor-pointer transition-all duration-300 hover:scale-105 text-shadow-md"
                        onClick={() => router.push("/")}
                    >
                        fyteAI
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => router.push("/")} className="nav-link text-white font-semibold hover:text-white/80 transition">Home</button>
                        <button onClick={() => router.push("/diet")} className="nav-link text-white font-semibold hover:text-white/80 transition">Diet Plan</button>
                        <button onClick={() => router.push("/workout")} className="nav-link text-white font-semibold hover:text-white/80 transition">Workout Plan</button>
                        <button onClick={() => router.push("/progress")} className="nav-link text-white font-semibold hover:text-white/80 transition">Track Progress</button>

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
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-56 rounded-xl border border-white/20 bg-[#162a41]/90 backdrop-blur-xl shadow-2xl overflow-hidden py-2"
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
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button 
                                onClick={() => router.push("/sign-in")} 
                                className="px-6 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur text-white text-sm font-semibold hover:bg-white/20 transition-all hover:scale-105 cursor-pointer"
                            >
                                Login
                            </button>
                        )}
                    </nav>

                    {/* Mobile Hamburger Button */}
                    <motion.button
                        className="md:hidden p-3 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-xl relative overflow-hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="relative flex flex-col items-center justify-center gap-[5px] w-[26px] h-[26px]">
                            <motion.div
                                className="w-[22px] h-[3px] rounded bg-white"
                                animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }}
                            />
                            <motion.div
                                className="w-[22px] h-[3px] rounded bg-white"
                                animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                            />
                            <motion.div
                                className="w-[22px] h-[3px] rounded bg-white"
                                animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }}
                            />
                        </div>
                    </motion.button>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ duration: 0.4 }}
                        className="fixed top-[80px] left-0 right-0 bottom-0 z-[999] bg-white border-t border-[#162a41]/10 shadow-xl flex flex-col"
                    >
                        <div className="flex-1 p-6 overflow-y-auto">
                            {["Home", "Diet Plan", "Workout Plan", "Track Progress"].map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        router.push(item === "Home" ? "/" : "/" + item.toLowerCase().replace(" ", ""));
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left text-[18px] font-semibold text-[#162a41] px-5 py-4 rounded-xl mb-2 transition-all duration-300 hover:bg-[#162a41]/5"
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
                                        <div className="w-12 h-12 rounded-full bg-[#162a41] text-white flex items-center justify-center text-lg font-bold shadow-md">
                                            {displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#162a41] text-lg">{displayName}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold px-6 py-4 rounded-xl transition-all active:scale-95 border border-red-100"
                                    >
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        router.push("/sign-in");
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-[#162a41] text-white text-[18px] font-semibold px-6 py-4 rounded-xl shadow-lg active:scale-95 transition-all"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Carousel (Existing Code) */}
            <div className="relative w-full h-screen overflow-hidden bg-black">
                {slides.map((slide, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: currentSlide === index ? 1 : 0 }}
                        transition={{ duration: 0.8 }}
                        className={`absolute inset-0 w-full h-full ${currentSlide === index ? "z-10" : "z-0"}`}
                    >
                        {slide.type === "video" ? (
                            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                                <source src={slide.src} type="video/mp4" />
                            </video>
                        ) : (
                            <img src={slide.src} alt={slide.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
                        {currentSlide === index && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white max-w-[900px] px-5">
                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="font-extrabold leading-tight mb-6 text-shadow-lg text-[clamp(36px,8vw,72px)]"
                                >
                                    {slide.title}
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: 0.4 }}
                                    className="font-normal mb-12 leading-relaxed text-shadow-md text-[clamp(18px,3vw,24px)]"
                                >
                                    {slide.subtitle}
                                </motion.p>
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: 0.6 }}
                                    onClick={() => {
                                        if (currentSlide === 0) router.push("/diet");
                                        else if (currentSlide === 1) router.push("/workout");
                                        else router.push("/diet");
                                    }}
                                    className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-white rounded-full border border-white/30 bg-white/20 backdrop-blur-md hover:bg-white/30 hover:border-white/50 transition-all"
                                >
                                    {slide.cta}
                                    <ArrowRight size={20} />
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                ))}

                <button onClick={prevSlide} className="absolute left-5 top-1/2 -translate-y-1/2 z-[100] w-[50px] h-[50px] rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md hover:bg-white/30 hover:scale-110 transition-all">
                    <ChevronLeft size={24} className="text-white" />
                </button>
                <button onClick={nextSlide} className="absolute right-5 top-1/2 -translate-y-1/2 z-[100] w-[50px] h-[50px] rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md hover:bg-white/30 hover:scale-110 transition-all">
                    <ChevronRight size={24} className="text-white" />
                </button>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-3 rounded-full transition-all ${currentSlide === index ? "w-10 bg-white/80" : "w-3 bg-white/40"}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}