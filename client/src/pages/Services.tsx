import { Link } from "wouter";

const mainServices = [
  {
    num: "01",
    title: "Property Marketing",
    desc: "Effective marketing is the foundation of low vacancy rates. Our professional approach ensures your property stands out in a competitive market and attracts the highest-quality tenants quickly.",
    bullets: [
      "Professional HDR photography and videography",
      "3D virtual tours and floor plans",
      "Multi-platform listing syndication (Zillow, Realtor.com, MLS)",
      "Targeted social media advertising campaigns",
      "Market rent analysis and competitive pricing",
    ],
  },
  {
    num: "02",
    title: "Tenant Screening",
    desc: "Placing the right tenant is the single most important decision in property management. Our rigorous multi-step screening process protects your investment and ensures a positive tenancy.",
    bullets: [
      "Full credit report and score review",
      "Criminal background and eviction history checks",
      "Employment and income verification (3x rent standard)",
      "Previous landlord reference verification",
      "Fair Housing compliant screening criteria",
    ],
  },
  {
    num: "03",
    title: "Financial Management",
    desc: "We handle every dollar with precision and transparency. Your owner portal gives you 24/7 access to real-time financial data so you always know exactly where your money stands.",
    bullets: [
      "Online rent collection with auto-reminders",
      "Monthly owner statements and annual reports",
      "Direct deposit of owner distributions",
      "Security deposit management and accounting",
      "1099 preparation and tax-ready reporting",
    ],
  },
  {
    num: "04",
    title: "Maintenance & Repairs",
    desc: "Protecting your investment means staying ahead of maintenance needs. Our proactive approach and network of trusted contractors keeps your property in prime condition year-round.",
    bullets: [
      "24/7 emergency maintenance response",
      "Online tenant maintenance request portal",
      "Vetted network of licensed, insured contractors",
      "Preventive maintenance scheduling",
      "Detailed maintenance history and cost tracking",
    ],
  },
];

const additionalServices = [
  {
    title: "Lease Administration",
    desc: "Professional lease preparation, renewals, and enforcement to protect your interests and ensure legal compliance at all times.",
  },
  {
    title: "Tenant Relations",
    desc: "Responsive communication and professional service to maintain high tenant satisfaction, reduce turnover, and protect your income.",
  },
  {
    title: "Property Inspections",
    desc: "Regular move-in, move-out, and mid-lease inspections with detailed photo reports to identify issues before they become costly problems.",
  },
  {
    title: "Legal Compliance",
    desc: "Stay protected with our expert knowledge of Missouri landlord-tenant law, Fair Housing regulations, and local St. Louis ordinances.",
  },
];

export default function Services() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <span>Services</span>
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Our Services
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Comprehensive property management solutions tailored to your needs — from single-family homes to
            commercial portfolios.
          </p>
        </div>
      </section>

      {/* ── Main Services ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="space-y-16">
            {mainServices.map((svc, i) => (
              <div
                key={svc.num}
                className={`grid lg:grid-cols-2 gap-12 items-start pb-16 ${
                  i < mainServices.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* Left */}
                <div>
                  <p
                    className="text-5xl font-bold text-[var(--luxe-gold)]/20 mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {svc.num}
                  </p>
                  <h2
                    className="text-3xl md:text-4xl font-bold text-[var(--luxe-navy)] mb-4"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {svc.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">{svc.desc}</p>
                </div>

                {/* Right — bullet list */}
                <div className="bg-[var(--luxe-light)] rounded-xl p-8">
                  <ul className="space-y-4">
                    {svc.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="text-[var(--luxe-gold)] font-bold mt-0.5 flex-shrink-0">✓</span>
                        <span className="text-gray-700 text-sm leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Additional Services ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="mb-14">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Additional Services
            </h2>
            <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mb-4" />
            <p className="text-gray-500 text-lg">
              Everything else you need covered, handled with the same precision and care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {additionalServices.map((svc) => (
              <div
                key={svc.title}
                className="bg-white rounded-xl p-8 border border-gray-100 hover:border-[var(--luxe-gold)]/40 hover:shadow-md transition-all"
              >
                <h3
                  className="text-xl font-bold text-[var(--luxe-navy)] mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {svc.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-[var(--luxe-navy)]">
        <div className="container mx-auto text-center">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to Get Started?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Contact us today to learn how we can comprehensively manage your properties and maximize your
            returns.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <span className="inline-block px-10 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Contact Us Today
              </span>
            </Link>
            <Link href="/properties">
              <span className="inline-block px-10 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                View Properties
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
