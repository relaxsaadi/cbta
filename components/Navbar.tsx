"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, MessageCircle, Calendar, Tag, BookOpen, Home, Info } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/formations";

const FORMATIONS_NAV = [
  { href: "/dgr-7-1", label: "DGR 7.1 — Expéditeurs" },
  { href: "/dgr-7-2", label: "DGR 7.2 — Agents cargo" },
  { href: "/dgr-7-3", label: "DGR 7.3 — Acceptation" },
  { href: "/dgr-7-4", label: "DGR 7.4 — Personnel piste" },
  { href: "/dgr-7-5", label: "DGR 7.5 — Sûreté passagers" },
  { href: "/dgr-7-6", label: "DGR 7.6 — Tri postal" },
  { href: "/dgr-7-7", label: "DGR 7.7 — Équipage cabine" },
  { href: "/dgr-7-8", label: "DGR 7.8 — Dispatch & Ops" },
  { href: "/dgr-7-9", label: "DGR 7.9 — Sécurité aéroport" },
  { href: "/dgr-7-10", label: "DGR 7.10 — Responsables DGR" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formationsOpen, setFormationsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setFormationsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#002A56] ${
          scrolled
            ? "shadow-lg shadow-black/30 border-b border-white/[0.08]"
            : "border-b border-white/[0.05]"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* LOGO */}
          <Link href="/" className="shrink-0">
            <div className="bg-white rounded-lg px-2.5 py-1.5 shadow-sm">
              <Image
                src="/kost-group-logo.svg"
                alt="KOST GROUP"
                width={100}
                height={56}
                className="h-7 w-auto"
                priority
              />
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={isActive("/")}>
              <Home size={14} />
              Accueil
            </NavLink>

            {/* FORMATIONS DROPDOWN */}
            <div
              className="relative"
              onMouseEnter={() => setFormationsOpen(true)}
              onMouseLeave={() => setFormationsOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                  pathname.startsWith("/dgr-")
                    ? "text-white bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/[0.07]"
                }`}
              >
                <BookOpen size={14} />
                Formations
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${formationsOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {formationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-64 bg-[#001f45] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-white/[0.07]">
                      <p className="text-xs font-bold text-white/30 uppercase tracking-wider">10 Formations IATA DGR</p>
                    </div>
                    <div className="py-1">
                      {FORMATIONS_NAV.map((f) => (
                        <Link
                          key={f.href}
                          href={f.href}
                          className={`block px-4 py-2 text-sm transition-colors duration-100 ${
                            isActive(f.href)
                              ? "text-yellow-400 bg-yellow-400/[0.08]"
                              : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                          }`}
                        >
                          {f.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink href="/planning" active={isActive("/planning")}>
              <Calendar size={14} />
              Planning
            </NavLink>

            <NavLink href="/promos" active={isActive("/promos")}>
              <Tag size={14} />
              Promos
            </NavLink>

            <NavLink href="/a-propos" active={isActive("/a-propos")}>
              <Info size={14} />
              À propos
            </NavLink>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-black text-sm font-black px-4 py-2 rounded-full transition-all duration-150 hover:scale-105 shadow-lg shadow-green-500/20"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
          </div>

          {/* MOBILE BURGER */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-[#001f45]/98 backdrop-blur-lg border-b border-white/10 shadow-2xl"
          >
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              <MobileNavLink href="/" active={isActive("/")}>
                <Home size={16} /> Accueil
              </MobileNavLink>

              {/* Formations accordion mobile */}
              <button
                onClick={() => setFormationsOpen(!formationsOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/[0.07] transition-colors"
              >
                <span className="flex items-center gap-2"><BookOpen size={16} /> Formations (10)</span>
                <ChevronDown size={14} className={`transition-transform ${formationsOpen ? "rotate-180" : ""}`} />
              </button>
              {formationsOpen && (
                <div className="ml-4 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                  {FORMATIONS_NAV.map((f) => (
                    <Link
                      key={f.href}
                      href={f.href}
                      className="py-2 text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {f.label}
                    </Link>
                  ))}
                </div>
              )}

              <MobileNavLink href="/planning" active={isActive("/planning")}>
                <Calendar size={16} /> Planning 2026
              </MobileNavLink>
              <MobileNavLink href="/promos" active={isActive("/promos")}>
                <Tag size={16} /> Promos
              </MobileNavLink>
              <MobileNavLink href="/a-propos" active={isActive("/a-propos")}>
                <Info size={16} /> À propos
              </MobileNavLink>
              <MobileNavLink href="/contact" active={isActive("/contact")}>
                <MessageCircle size={16} /> Contact
              </MobileNavLink>

              <div className="pt-3 border-t border-white/[0.07]">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 text-black font-black text-sm px-6 py-3 rounded-full w-full"
                >
                  <MessageCircle size={16} />
                  Réserver via WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
        active
          ? "text-white bg-white/10"
          : "text-white/70 hover:text-white hover:bg-white/[0.07]"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
        active
          ? "text-yellow-400 bg-yellow-400/[0.08]"
          : "text-white/70 hover:text-white hover:bg-white/[0.07]"
      }`}
    >
      {children}
    </Link>
  );
}
