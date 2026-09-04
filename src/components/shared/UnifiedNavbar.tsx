"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, CreditCard, LogOut, Menu, User, X } from "lucide-react";
import { useUser, signOutAndClearCache } from "@frontend/features/auth";
import { navItems } from "@/lib/constant";
import { getUserProfile } from "@/lib/service/progress-database";
import { isProfileComplete } from "@/shared/lib/profile";
import { signedInHomeHref } from "@/shared/lib/app-home";
import { AnimatePresence, motion, popIn, fadeUp, transition } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, isSignedIn, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  // Menus remember the path they were opened on, so navigating closes them without an effect.
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null);
  const [userMenuPath, setUserMenuPath] = useState<string | null>(null);
  const [loadedProfileComplete, setLoadedProfileComplete] = useState(true);
  const isMobileMenuOpen = mobileMenuPath === pathname;
  const isUserMenuOpen = userMenuPath === pathname;
  const setIsMobileMenuOpen = (open: boolean) => setMobileMenuPath(open ? pathname : null);
  const setIsUserMenuOpen = (open: boolean) => setUserMenuPath(open ? pathname : null);
  const profileComplete = !isSignedIn || loadedProfileComplete;
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const homeHref = isSignedIn ? signedInHomeHref(profileComplete) : "/";
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";

  const navLinks = navItems
    .filter((item) => item.name !== "Trainers")
    .filter((item) => !(isSignedIn && profileComplete && item.name === "Coach"))
    .map((item) => (item.name === "Home" ? { ...item, href: homeHref } : item));

  const isNavActive = (href: string) => {
    if (href === "/" || href === "/progress") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

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

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuPath(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOutAndClearCache();
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

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b text-white transition-colors duration-300",
        scrolled || isMobileMenuOpen
          ? "border-white/10 bg-[#161616]/85 backdrop-blur-xl"
          : "border-white/15 bg-transparent backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => router.push(homeHref)}
          className="text-2xl font-extrabold tracking-tight text-shadow-md transition hover:scale-[1.015]"
        >
          fyteAI
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                isNavActive(item.href) ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-10 w-24 rounded-full bg-white/10" />
          ) : isSignedIn ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 py-1.5 pl-1.5 pr-3 text-sm font-semibold backdrop-blur-md transition hover:bg-white/20"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-fyte-ink">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate sm:inline">{displayName}</span>
                <ChevronDown size={16} className={cn("transition-transform", isUserMenuOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {isUserMenuOpen ? (
                  <motion.div
                    {...popIn}
                    transition={transition}
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/15 bg-[#1c1c1c]/95 py-2 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="mb-1 border-b border-white/10 px-4 py-3">
                      <p className="text-xs text-white/60">Signed in as</p>
                      <p className="truncate text-sm font-medium">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => go("/my-profile")}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/10"
                    >
                      <User size={16} /> My profile
                    </button>
                    <button
                      type="button"
                      onClick={() => go("/billing")}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/10"
                    >
                      <CreditCard size={16} /> Membership
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/sign-in")}
              className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur-md transition hover:bg-white/20"
            >
              Sign in
            </button>
          )}

          <button
            type="button"
            aria-label="Menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-full border border-white/30 bg-white/10 p-2 backdrop-blur-md md:hidden"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div {...fadeUp} transition={transition} className="border-t border-white/10 px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => go(item.href)}
                  className={cn(
                    "w-full rounded-xl px-4 py-3 text-left text-base font-semibold",
                    isNavActive(item.href) ? "bg-white/15" : "text-white/80 hover:bg-white/10"
                  )}
                >
                  {item.name}
                </button>
              ))}
              {isSignedIn ? (
                <>
                  <button
                    type="button"
                    onClick={() => go("/my-profile")}
                    className="w-full rounded-xl px-4 py-3 text-left text-base font-semibold text-white/80 hover:bg-white/10"
                  >
                    My profile
                  </button>
                  <button
                    type="button"
                    onClick={() => go("/billing")}
                    className="w-full rounded-xl px-4 py-3 text-left text-base font-semibold text-white/80 hover:bg-white/10"
                  >
                    Membership
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-xl px-4 py-3 text-left text-base font-semibold text-red-300 hover:bg-red-500/10"
                  >
                    Log out
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
