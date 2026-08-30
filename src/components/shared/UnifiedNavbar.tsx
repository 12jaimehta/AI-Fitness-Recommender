"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import { useUser } from "@/lib/hooks/use-user";
import { navItems } from "@/lib/constant";
import { getUserProfile } from "@/lib/service/progress-database";
import { isProfileComplete } from "@/shared/lib/profile";

export default function Navbar() {
  const { user, isSignedIn, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const homeHref = isSignedIn ? (profileComplete ? "/dashboard" : "/") : "/";
  const isHomePage = pathname === "/";
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";

  const navLinks = navItems.map((item) =>
    item.name === "Home" ? { ...item, href: homeHref } : item
  );

  const isNavActive = (href: string) => {
    if (href === "/" || href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    if (!isSignedIn) {
      setProfileComplete(true);
      return;
    }
    getUserProfile()
      .then((profile) => setProfileComplete(isProfileComplete(profile)))
      .catch(() => {});
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignOut = async () => {
    const supabase = (await import("@/lib/supabase/supabase-client")).createClient();
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const go = (href: string) => {
    router.push(href);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <>
        <nav
          className={`fixed top-0 left-0 right-0 z-50 
            ${isHomePage ? "bg-transparent border-b border-white/20" : "bg-white border-b border-black/10"}
          `}
        >
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
            <div className={`font-bold text-2xl ${isHomePage ? "text-white" : "text-[#282828]"}`}>
              fyteAI
            </div>
            <div className="w-[100px] h-[40px]" />
          </div>
        </nav>
        <div className="h-[80px]" />
      </>
    );
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition 
        ${isHomePage ? "bg-transparent backdrop-blur-md border-b border-white/20" : "bg-white border-b border-black/10"}`}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
          <div
            onClick={() => router.push(homeHref)}
            className={`font-bold text-2xl cursor-pointer ${isHomePage ? "text-white" : "text-[#282828]"}`}
          >
            fyteAI
          </div>

          <div className="hidden md:flex gap-4 items-center">
            {navLinks.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`px-4 py-2 rounded-md font-medium text-sm transition 
                  ${isHomePage ? "text-white" : "text-[#282828]"} 
                  ${isNavActive(item.href) ? "opacity-100" : "opacity-70 hover:opacity-100"}
                `}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                    isHomePage
                      ? "border border-white/30 bg-white/10 text-white"
                      : "border border-gray-200 bg-white text-[#282828]"
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${
                    isHomePage ? "bg-white text-[#282828]" : "bg-[#282828] text-white"
                  }`}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[120px] truncate sm:inline">{displayName}</span>
                  <ChevronDown size={16} className={isUserMenuOpen ? "rotate-180" : ""} />
                </button>
                {isUserMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => go("/my-profile")}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#282828] hover:bg-gray-50"
                    >
                      <User size={16} />
                      My profile
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#282828] hover:bg-gray-50"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                onClick={() => router.push("/sign-in")}
                className={`px-6 py-2 rounded-md text-sm font-medium 
                  ${isHomePage ? "border border-white/30 text-white bg-transparent" : "bg-[#282828] text-white"}
                `}
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 ${isHomePage ? "text-white" : "text-[#282828]"}`}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div
            className={`md:hidden px-6 py-4 border-t 
              ${isHomePage ? "bg-black/90 border-white/20" : "bg-white border-black/10"}
            `}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <button
                  key={item.name}
                  onClick={() => go(item.href)}
                  className={`w-full text-left px-4 py-3 rounded-md text-lg 
                    ${isHomePage ? "text-white" : "text-[#282828]"}
                  `}
                >
                  {item.name}
                </button>
              ))}
              {isSignedIn ? (
                <>
                  <button
                    onClick={() => go("/my-profile")}
                    className={`w-full text-left px-4 py-3 rounded-md text-lg ${
                      isHomePage ? "text-white" : "text-[#282828]"
                    }`}
                  >
                    My profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className={`w-full text-left px-4 py-3 rounded-md text-lg ${
                      isHomePage ? "text-white" : "text-[#282828]"
                    }`}
                  >
                    Log out
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </nav>

      <div className="h-[40px]" />
    </>
  );
}
