import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mainNavItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/services", label: "Services" },
    { path: "/properties", label: "Properties" },
    { path: "/blog", label: "Blog" },
    { path: "/contact", label: "Contact" },
  ];

  const closeMobile = () => setMobileMenuOpen(false);

  const navLinkClass = (active: boolean) =>
    `px-3.5 py-2 transition-all text-sm font-medium ${
      active
        ? "text-[var(--luxe-gold)]"
        : "text-white hover:text-[var(--luxe-gold)]"
    }`;

  const mobileNavLinkClass = (active: boolean) =>
    `block px-4 py-2 rounded transition-all ${
      active
        ? "text-[var(--luxe-gold)] font-medium"
        : "text-white hover:text-[var(--luxe-gold)]"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={`text-white fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[var(--luxe-navy)] shadow-[0_2px_20px_rgba(0,0,0,0.3)]" : "bg-transparent"}`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/">
              <span className="cursor-pointer block">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 285 65" width="200" height="46" aria-label="Luxe Property Solutions">
                  {/* City skyline silhouette */}
                  <g fill="rgba(255,255,255,0.13)">
                    <rect x="2" y="51" width="7" height="14"/><rect x="3" y="48" width="2" height="3"/>
                    <rect x="11" y="44" width="6" height="21"/><rect x="13" y="41" width="2" height="3"/>
                    <rect x="19" y="50" width="5" height="15"/><rect x="20" y="47" width="2" height="3"/>
                    <rect x="61" y="48" width="6" height="17"/><rect x="63" y="45" width="2" height="3"/>
                    <rect x="69" y="42" width="8" height="23"/><rect x="72" y="38" width="2" height="4"/>
                    <rect x="79" y="50" width="7" height="15"/><rect x="80" y="47" width="2" height="3"/>
                  </g>
                  {/* Gateway Arch */}
                  <path d="M 9,65 C 9,24 32,3 43,3 C 54,3 77,24 77,65 L 71,65 C 71,28 55,9 43,9 C 31,9 15,28 15,65 Z" fill="#C9A84C"/>
                  {/* Ground baseline */}
                  <rect x="2" y="63" width="84" height="2" fill="#C9A84C" rx="1"/>
                  {/* Vertical divider */}
                  <line x1="95" y1="9" x2="95" y2="56" stroke="#C9A84C" strokeWidth="0.8" strokeOpacity="0.45"/>
                  {/* LUXE */}
                  <text x="106" y="38" fontFamily="Georgia, 'Palatino Linotype', serif" fontSize="29" fontWeight="700" fill="#C9A84C" letterSpacing="5">LUXE</text>
                  {/* PROPERTY SOLUTIONS */}
                  <text x="108" y="51" fontFamily="Arial, Helvetica, sans-serif" fontSize="8.5" fill="rgba(255,255,255,0.85)" letterSpacing="3" fontWeight="400">PROPERTY SOLUTIONS</text>
                  {/* ST. LOUIS, MISSOURI */}
                  <text x="109" y="61" fontFamily="Arial, Helvetica, sans-serif" fontSize="7" fill="rgba(201,168,76,0.7)" letterSpacing="1.5">ST. LOUIS, MISSOURI</text>
                </svg>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <span className={navLinkClass(location === item.path)}>
                    {item.label}
                  </span>
                </Link>
              ))}

              {/* Portal links */}
              <div className="flex items-center gap-2.5 ml-4 pl-4 border-l border-white/20">
                <a href="/login" className="px-4 py-2 rounded-md text-[0.85rem] font-semibold text-white border border-white/40 hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-all">
                  Tenant Portal
                </a>
                <a href="/owner-login" className="px-4 py-2 rounded-md text-[0.85rem] font-semibold bg-[var(--luxe-gold)] text-[var(--luxe-navy)] hover:bg-[#A88830] transition-all">
                  Owner Portal
                </a>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-white/10 rounded"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden pb-4 space-y-1">
              {mainNavItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <span
                    className={mobileNavLinkClass(location === item.path)}
                    onClick={closeMobile}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <a
                href="/login"
                className="block px-4 py-2 rounded text-sm font-semibold text-white border border-white/40 hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-all"
                onClick={closeMobile}
              >
                Tenant Portal
              </a>
              <a
                href="/owner-login"
                className="block px-4 py-2 rounded text-sm font-semibold bg-[var(--luxe-gold)] text-[var(--luxe-navy)] hover:bg-[#A88830] transition-all"
                onClick={closeMobile}
              >
                Owner Portal
              </a>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content — pt-[72px] offsets the fixed nav */}
      <main className="flex-1 pt-[72px]">{children}</main>

      {/* Footer */}
      <footer className="bg-[var(--luxe-navy)] text-white">
        <div className="container mx-auto py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link href="/">
                <span className="cursor-pointer block mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 285 65" width="160" height="37" aria-label="Luxe Property Solutions">
                    <g fill="rgba(255,255,255,0.13)">
                      <rect x="2" y="51" width="7" height="14"/><rect x="3" y="48" width="2" height="3"/>
                      <rect x="11" y="44" width="6" height="21"/><rect x="13" y="41" width="2" height="3"/>
                      <rect x="19" y="50" width="5" height="15"/><rect x="20" y="47" width="2" height="3"/>
                      <rect x="61" y="48" width="6" height="17"/><rect x="63" y="45" width="2" height="3"/>
                      <rect x="69" y="42" width="8" height="23"/><rect x="72" y="38" width="2" height="4"/>
                      <rect x="79" y="50" width="7" height="15"/><rect x="80" y="47" width="2" height="3"/>
                    </g>
                    <path d="M 9,65 C 9,24 32,3 43,3 C 54,3 77,24 77,65 L 71,65 C 71,28 55,9 43,9 C 31,9 15,28 15,65 Z" fill="#C9A84C"/>
                    <rect x="2" y="63" width="84" height="2" fill="#C9A84C" rx="1"/>
                    <line x1="95" y1="9" x2="95" y2="56" stroke="#C9A84C" strokeWidth="0.8" strokeOpacity="0.45"/>
                    <text x="106" y="38" fontFamily="Georgia, 'Palatino Linotype', serif" fontSize="29" fontWeight="700" fill="#C9A84C" letterSpacing="5">LUXE</text>
                    <text x="108" y="51" fontFamily="Arial, Helvetica, sans-serif" fontSize="8.5" fill="rgba(255,255,255,0.85)" letterSpacing="3" fontWeight="400">PROPERTY SOLUTIONS</text>
                    <text x="109" y="61" fontFamily="Arial, Helvetica, sans-serif" fontSize="7" fill="rgba(201,168,76,0.7)" letterSpacing="1.5">ST. LOUIS, MISSOURI</text>
                  </svg>
                </span>
              </Link>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Premium property management services in St. Louis, MO. We combine cutting-edge technology
                with personalized white-glove service to deliver exceptional results.
              </p>
              {/* Social Icons */}
              <div className="flex gap-3">
                {[
                  { label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                  { label: "Instagram", path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 20.5h11a4 4 0 004-4v-11a4 4 0 00-4-4h-11a4 4 0 00-4 4v11a4 4 0 004 4z" },
                  { label: "LinkedIn", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
                ].map((s) => (
                  <button
                    key={s.label}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors text-white/50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.path} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[3px] text-white/40 mb-5">Navigation</h4>
              <ul className="space-y-3">
                {[
                  { path: "/", label: "Home" },
                  { path: "/about", label: "About" },
                  { path: "/services", label: "Services" },
                  { path: "/properties", label: "Properties" },
                  { path: "/blog", label: "Blog" },
                  { path: "/contact", label: "Contact" },
                ].map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <span className="text-white/60 hover:text-[var(--luxe-gold)] transition-colors text-sm cursor-pointer">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Portals */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[3px] text-white/40 mb-5">Portals</h4>
              <ul className="space-y-3">
                {[
                  { path: "/login", label: "Tenant Portal" },
                  { path: "/owner-login", label: "Owner Portal" },
                  { path: "/admin-login", label: "Admin Login" },
                ].map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <span className="text-white/60 hover:text-[var(--luxe-gold)] transition-colors text-sm cursor-pointer">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
                <h4 className="text-xs font-bold uppercase tracking-[3px] text-white/40 mb-1 mt-6">Services</h4>
                {[
                  "Property Marketing",
                  "Tenant Screening",
                  "Financial Management",
                  "Maintenance",
                ].map((s) => (
                  <li key={s}>
                    <Link href="/services">
                      <span className="text-white/60 hover:text-[var(--luxe-gold)] transition-colors text-sm cursor-pointer">
                        {s}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[3px] text-white/40 mb-5">Contact Us</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li>555 Washington Ave</li>
                <li>Saint Louis, MO 63101</li>
                <li>
                  <a href="tel:6362011239" className="hover:text-[var(--luxe-gold)] transition-colors">
                    636-201-1239
                  </a>
                </li>
                <li>
                  <a href="mailto:info@luxestl.com" className="hover:text-[var(--luxe-gold)] transition-colors">
                    info@luxestl.com
                  </a>
                </li>
                <li className="pt-2 border-t border-white/10">Mon–Fri: 9AM–6PM</li>
                <li>Sat: 10AM–4PM</li>
                <li>Sun: Closed</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
            <p>&copy; {new Date().getFullYear()} Luxe Property Solutions. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy"><span className="hover:text-[var(--luxe-gold)] transition-colors cursor-pointer">Privacy Policy</span></Link>
              <Link href="/terms"><span className="hover:text-[var(--luxe-gold)] transition-colors cursor-pointer">Terms of Service</span></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
