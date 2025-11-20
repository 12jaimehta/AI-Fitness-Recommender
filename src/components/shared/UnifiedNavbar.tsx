"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/lib/hooks/use-user";
import { Menu, X } from "lucide-react";
import { navItems } from "@/lib/constant";

export default function Navbar() {
  const { user, isSignedIn, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const isHomePage = pathname === "/";

  if (isLoading) {
    return (
      <>
        <nav
          className={`fixed top-0 left-0 right-0 z-50 
            ${isHomePage ? "bg-transparent border-b border-white/20" : "bg-white border-b border-black/10"}
          `}
        >
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
            <div
              className={`font-bold text-2xl ${
                isHomePage ? "text-white" : "text-[#162a41]"
              }`}
            >
              fyteAI
            </div>

            <div className="w-[100px] h-[40px]"></div>
          </div>
        </nav>

        <div className="h-[80px]" />
      </>
    );
  }

  const handleSignOut = async () => {
    const supabase = (await import("@/lib/supabase/supabase-client")).createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition 
        ${isHomePage ? 
          "bg-transparent backdrop-blur-md border-b border-white/20" : 
          "bg-white border-b border-black/10"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">

          <div
            onClick={() => router.push("/")}
            className={`font-bold text-2xl cursor-pointer ${
              isHomePage ? "text-white" : "text-[#162a41]"
            }`}
          >
            fyteAI
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 items-center">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`px-4 py-2 rounded-md font-medium text-sm transition 
                  ${isHomePage ? "text-white" : "text-[#162a41]"} 
                  ${pathname === item.href ? "opacity-100" : "opacity-70 hover:opacity-100"}
                `}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Auth + Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${
                    isHomePage ? "text-white" : "text-[#162a41]"
                  }`}
                >
                  {user?.email?.split("@")[0]}
                </span>

                <button
                  onClick={handleSignOut}
                  className={`px-4 py-2 rounded-md text-sm font-medium 
                    ${isHomePage ? "bg-white/20 text-white" : "bg-[#162a41] text-white"}
                  `}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/sign-in")}
                className={`px-6 py-2 rounded-md text-sm font-medium 
                  ${isHomePage ? "border border-white/30 text-white bg-transparent" : "bg-[#162a41] text-white"}
                `}
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 ${
                isHomePage ? "text-white" : "text-[#162a41]"
              }`}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className={`md:hidden px-6 py-4 border-t 
              ${isHomePage ? "bg-black/90 border-white/20" : "bg-white border-black/10"}
            `}
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-md text-lg 
                    ${isHomePage ? "text-white" : "text-[#162a41]"}
                  `}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-[80px]" />
    </>
  );
}
