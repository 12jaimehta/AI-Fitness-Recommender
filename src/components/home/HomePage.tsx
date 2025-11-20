"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { menuItems, slides } from "@/lib/constant";
import { useCurrentUser } from "@/lib/use-current-user";

export default function HomePage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const { isSignedIn, user } = useCurrentUser();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-1000 bg-transparent border-b border-white/20">
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
                        <button
                            onClick={() => router.push("/")}
                            className="text-white text-[16px] font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:-translate-y-[0.5px] hover:shadow-xl"
                        >
                            Home
                        </button>

                        <button
                            onClick={() => router.push("/diet")}
                            className="text-white text-[16px] font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:-translate-y-[0.5px] hover:shadow-xl"
                        >
                            Diet Plan
                        </button>

                        <button
                            onClick={() => router.push("/workout")}
                            className="text-white text-[16px] font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:-translate-y-[0.5px] hover:shadow-xl"
                        >
                            Workout Plan
                        </button>

                        <button
                            onClick={() => router.push("/progress")}
                            className="text-white text-[16px] font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:-translate-y-[0.5px] hover:shadow-xl"
                        >
                            Track Progress
                        </button>

                        <button onClick={() => router.push("/sign-in")} className="px-6 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur text-white text-sm font-semibold hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">

                            {isSignedIn ? "Logout" : "Login"}

                        </button>
                    </nav>

                    {/* Mobile Hamburger Button (visible only on mobile) */}
                    <motion.button
                        className="
              md:hidden
              p-3 rounded-xl border-2 border-white/40 
              bg-white/10 backdrop-blur-xl shadow-xl 
              relative overflow-hidden 
              hover:bg-white/20 hover:border-white/60
            "
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div
                            className={`absolute inset-0 rounded-xl transition-opacity duration-300 
              bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]
              ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
                        />

                        <div className="relative flex flex-col items-center justify-center gap-[5px] w-[26px] h-[26px]">
                            <motion.div
                                className="w-[22px] h-[3px] rounded bg-white shadow-sm"
                                animate={{
                                    rotate: isMobileMenuOpen ? 45 : 0,
                                    y: isMobileMenuOpen ? 8 : 0,
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            />
                            <motion.div
                                className="w-[22px] h-[3px] rounded bg-white shadow-sm"
                                animate={{
                                    opacity: isMobileMenuOpen ? 0 : 1,
                                    scaleX: isMobileMenuOpen ? 0 : 1,
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            />
                            <motion.div
                                className="w-[22px] h-[3px] rounded bg-white shadow-sm"
                                animate={{
                                    rotate: isMobileMenuOpen ? -45 : 0,
                                    y: isMobileMenuOpen ? -8 : 0,
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
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
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="fixed top-[80px] left-0 right-0 bottom-0 z-999 bg-white border-t border-[#162a41]/10 shadow-xl"
                    >
                        <div className="flex flex-col gap-2 p-6 h-full overflow-y-auto md:hidden">

                            {/* Mobile Items */}
                            {["Home", "Diet Plan", "Workout Plan", "Track Progress"].map(
                                (item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            router.push(
                                                item === "Home"
                                                    ? "/"
                                                    : "/" + item.toLowerCase().replace(" ", "")
                                            );
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="text-left text-[18px] font-semibold text-[#162a41] px-5 py-4 rounded-xl transition-all duration-300 hover:bg-[#162a41]/5 hover:translate-x-1"
                                    >
                                        {item}
                                    </button>
                                )
                            )}

                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        router.push(item.path);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-4 text-left text-[18px] font-semibold text-[#162a41] 
               px-5 py-4 rounded-xl hover:bg-[#162a41]/5 hover:translate-x-1 transition-all"
                                >
                                    {item.label}
                                </button>
                            ))}


                            {/* Login */}
                            <div className="mt-5 border-t border-[#162a41]/10 pt-5">
                                <button
                                    onClick={() => {
                                        router.push("/sign-in");
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-[#162a41] text-white text-[18px] font-semibold px-6 py-4 rounded-xl transition-all duration-300 hover:bg-[#1a3452] hover:-translate-y-1 hover:shadow-lg"
                                >
                                    {isSignedIn ? "Logout" : "Login"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Carousel */}
            <div className="relative w-full h-screen overflow-hidden bg-black">
                {slides.map((slide, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: currentSlide === index ? 1 : 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className={`absolute inset-0 w-full h-full ${currentSlide === index ? "z-10" : "z-0"
                            }`}
                    >
                        {/* Background */}
                        {slide.type === "video" ? (
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src={slide.src} type="video/mp4" />
                            </video>
                        ) : (
                            <img
                                src={slide.src}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />

                        {/* Text */}
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

                {/* Prev */}
                <button
                    onClick={prevSlide}
                    className="absolute left-5 top-1/2 -translate-y-1/2 z-[100] w-[50px] h-[50px] rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md hover:bg-white/30 hover:scale-110 transition-all"
                >
                    <ChevronLeft size={24} className="text-white" />
                </button>

                {/* Next */}
                <button
                    onClick={nextSlide}
                    className="absolute right-5 top-1/2 -translate-y-1/2 z-[100] w-[50px] h-[50px] rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md hover:bg-white/30 hover:scale-110 transition-all"
                >
                    <ChevronRight size={24} className="text-white" />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-3 rounded-full transition-all ${currentSlide === index ? "w-10 bg-white/80" : "w-3 bg-white/40"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
