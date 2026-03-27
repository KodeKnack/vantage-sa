"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "For graduates", href: "/graduates" },
  { label: "For employers", href: "/employers" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0d0d0d]/95 backdrop-blur-md border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center select-none">
          <span className="text-white font-bold text-xl tracking-tight">Vantage</span>
          <span className="text-[#3ddc84] font-bold text-xl tracking-tight">SA</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "text-white bg-white/[0.07]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3ddc84]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/graduate-view"
            className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white border border-white/[0.12] hover:border-white/25 rounded-lg transition-all duration-150 hover:bg-white/[0.04]"
          >
            Graduate view
          </Link>
          <Link
            href="/employer-portal"
            className="px-4 py-2 text-sm font-semibold text-[#0d0d0d] bg-[#3ddc84] hover:bg-[#52e896] rounded-lg transition-all duration-150 shadow-[0_0_16px_rgba(61,220,132,0.25)] hover:shadow-[0_0_24px_rgba(61,220,132,0.35)]"
          >
            Employer portal
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          className="md:hidden flex flex-col gap-[5px] p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          <span className={`block w-5 h-[1.5px] bg-white/80 rounded-full transition-all duration-200 origin-center ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-white/80 rounded-full transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-white/80 rounded-full transition-all duration-200 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#0d0d0d]/98 backdrop-blur-md border-t border-white/[0.06] px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  isActive
                    ? "text-white bg-white/[0.07]"
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
            <Link
              href="/graduate-view"
              className="px-4 py-3 text-sm font-medium text-white/80 border border-white/[0.12] rounded-lg text-center hover:bg-white/[0.04] transition-colors"
            >
              Graduate view
            </Link>
            <Link
              href="/employer-portal"
              className="px-4 py-3 text-sm font-semibold text-[#0d0d0d] bg-[#3ddc84] rounded-lg text-center"
            >
              Employer portal
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
