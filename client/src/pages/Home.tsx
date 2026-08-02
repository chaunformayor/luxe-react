import { useState } from "react";
import { Link } from "wouter";
import HeroSlider from "@/components/HeroSlider";

const stats = [
  { value: "25+", label: "Years in St. Louis" },
  { value: "6.1%", label: "STL Rent Growth YoY" },
  { value: "~95%", label: "Occupancy Rate" },
  { value: "24/7", label: "Emergency Response" },
];

const diffs = [
  {
    icon: "🏗️",
    title: "In-House Rehab Crew",
    desc: "Faster turns. No third-party markups on your renovation.",
  },
  {
    icon: "🌐",
    title: "Built for Out-of-State Investors",
    desc: "Your trusted local eyes on every property — we handle it remotely.",
  },
  {
    icon: "📊",
    title: "Traditional & Short-Term Rentals",
    desc: "We manage both strategies — you pick what fits your goals.",
  },
  {
    icon: "📍",
    title: "25+ Years in St. Louis",
    desc: "Deep market knowledge. Real relationships. No learning curve.",
  },
];

const services = [
  {
    icon: "✏️",
    title: "Property Marketing",
    desc: "Professional listings across Zillow, Apartments.com, and local channels — with optimized pricing to minimize vacancy and maximize rent.",
  },
  {
    icon: "👤",
    title: "Tenant Screening",
    desc: "Credit, background, income verification, and rental history — we place qualified tenants who pay on time and stay long-term.",
  },
  {
    icon: "💵",
    title: "Rent Collection & Reporting",
    desc: "Online payment portal, automated late notices, direct deposit, and monthly owner statements — transparent financials every time.",
  },
  {
    icon: "🔧",
    title: "Maintenance & Repairs",
    desc: "Our in-house GC crew handles everything from light cosmetic updates to full gut rehabs — faster and cheaper than outside contractors.",
  },
];

const featuredProperties = [
  {
    price: "$1,850",
    period: "/mo",
    name: "Modern Loft – Central West End",
    address: "St. Louis, MO 63108",
    beds: 2,
    baths: 2,
    sqft: "1,100",
  },
  {
    price: "$325,000",
    period: "",
    name: "Elegant Townhome – Clayton",
    address: "Clayton, MO 63105",
    beds: 3,
    baths: 2.5,
    sqft: "2,200",
  },
  {
    price: "$2,400",
    period: "/mo",
    name: "Luxury Condo – Ladue",
    address: "Ladue, MO 63124",
    beds: 3,
    baths: 2,
    sqft: "1,650",
  },
];

const traditionalPlans = [
  {
    label: "STARTER",
    price: "$75",
    period: "/month",
    name: "Leasing Only",
    desc: "For hands-on owners who want professional tenant placement without ongoing management.",
    features: [
      "Professional listing & marketing",
      "Tenant screening & background check",
      "Lease preparation & execution",
      "Move-in inspection & documentation",
      "First month's rent collection",
    ],
    featured: false,
    cta: "Get Started",
  },
  {
    label: "FULL SERVICE",
    price: "8%",
    period: " of monthly rent",
    name: "Full Management",
    desc: "We handle everything so you can focus on growing your portfolio.",
    features: [
      "Everything in Leasing Only",
      "Rent collection & disbursement",
      "24/7 maintenance coordination",
      "Quarterly property inspections",
      "Owner portal & monthly statements",
      "Lease renewals & rent adjustments",
      "Eviction coordination if needed",
    ],
    featured: true,
    cta: "Get Started",
  },
  {
    label: "PORTFOLIO",
    price: "7%",
    period: " of monthly rent",
    name: "Investor Portfolio",
    desc: "For investors managing 3+ properties — with priority service and preferred rehab pricing.",
    features: [
      "Everything in Full Management",
      "Dedicated portfolio manager",
      "Priority maintenance scheduling",
      "Preferred MCS rehab pricing",
      "Quarterly performance reviews",
      "Access to off-market deal flow",
    ],
    featured: false,
    cta: "Let's Talk",
  },
];

const strPlans = [
  {
    label: "SETUP",
    price: "$499",
    period: " one-time",
    name: "STR Setup",
    desc: "Get your short-term rental listed and optimized on all major platforms.",
    features: [
      "Airbnb & VRBO listing setup",
      "Professional photography",
      "Dynamic pricing configuration",
      "House rules & automation setup",
      "Guest communication templates",
    ],
    featured: false,
    cta: "Get Started",
  },
  {
    label: "FULL SERVICE STR",
    price: "20%",
    period: " of revenue",
    name: "Full STR Management",
    desc: "Complete short-term rental management — we handle everything.",
    features: [
      "Everything in STR Setup",
      "Guest communication 24/7",
      "Cleaning coordination",
      "Dynamic pricing management",
      "Maintenance & restocking",
      "Monthly revenue reporting",
    ],
    featured: true,
    cta: "Get Started",
  },
  {
    label: "HYBRID",
    price: "Custom",
    period: "",
    name: "Hybrid Strategy",
    desc: "Mix of traditional and short-term rentals or a custom management structure.",
    features: [
      "Tailored management plan",
      "Flexible fee structure",
      "Multi-property strategy",
      "Market analysis included",
      "Dedicated account manager",
    ],
    featured: false,
    cta: "Let's Talk",
  },
];

const neighborhoods = [
  { num: "01", name: "North County", desc: "Florissant, Ferguson, Hazelwood · Strong investor returns", slug: "north-county" },
  { num: "02", name: "St. Charles County", desc: "O'Fallon, Wentzville, St. Peters · STL's #1 growth market", slug: "st-charles" },
  { num: "03", name: "Kirkwood", desc: "Premium rentals · Corporate relo · Top school district", slug: "kirkwood" },
  { num: "04", name: "Webster Groves", desc: "Historic homes · Long-term tenants · University demand", slug: "webster-groves" },
  { num: "05", name: "South City & South County", desc: "Soulard, Mehlville, Oakville · Brick duplex & STR opportunity", slug: "south-city" },
];

const whyBullets = [
  {
    title: "Transparent Reporting",
    desc: "Real-time access to financial statements, maintenance logs, and occupancy reports through your owner portal.",
  },
  {
    title: "Maximum Occupancy",
    desc: "Our proven marketing strategies keep vacancy periods short and your investment generating income.",
  },
  {
    title: "Legal Compliance",
    desc: "Stay protected with our expert knowledge of local, state, and federal rental regulations.",
  },
];

const commitments = [
  { num: "01", title: "Integrity", desc: "Complete transparency and honesty in all our dealings." },
  { num: "02", title: "Excellence", desc: "We strive for perfection in every aspect of management." },
  { num: "03", title: "Care", desc: "We treat every property as if it were our own." },
  { num: "04", title: "Results", desc: "Measurable outcomes that exceed expectations." },
];

const testimonials = [
  {
    initials: "MT",
    name: "Michael Thompson",
    role: "Property Investor",
    quote: "Luxe Property Solutions transformed how I manage my investment properties. Their professionalism and attention to detail are unmatched.",
  },
  {
    initials: "SW",
    name: "Sarah Williams",
    role: "Real Estate Developer",
    quote: "Outstanding service from start to finish. They handle everything so I can focus on growing my portfolio without the day-to-day stress.",
  },
  {
    initials: "JR",
    name: "James Richardson",
    role: "Long-term Tenant",
    quote: "The tenant portal makes paying rent and submitting maintenance requests so easy. Communication with the team is always prompt and professional.",
  },
];

export default function Home() {
  const [pricingTab, setPricingTab] = useState<"traditional" | "str">("traditional");
  const plans = pricingTab === "traditional" ? traditionalPlans : strPlans;

  return (
    <div>
      {/* ── Hero ── */}
      <HeroSlider />

      {/* ── Stats Bar ── */}
      <section className="bg-[var(--luxe-gold)]">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--luxe-navy)]/20">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center py-7 px-6">
                <span
                  className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {s.value}
                </span>
                <span className="text-[var(--luxe-navy)]/60 text-xs uppercase tracking-widest mt-2 text-center">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Differentiator Grid ── */}
      <section className="bg-[var(--luxe-navy)] py-16">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {diffs.map((d, i) => (
              <div key={i} className="flex items-start gap-5">
                <span className="text-3xl mt-1">{d.icon}</span>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                    {d.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Full-Service Property Management — And More
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
              We're the only St. Louis team that handles deal sourcing, rehab, and property management under one
              roof. No handoffs, no markups, no gaps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((svc, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl mb-6"
                  style={{ background: "rgba(201,168,76,0.12)" }}
                >
                  {svc.icon}
                </div>
                <h3
                  className="text-xl font-bold text-[var(--luxe-navy)] mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {svc.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/services">
              <span className="inline-block px-8 py-4 bg-[var(--luxe-navy)] text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-navy)]/90 transition-colors rounded-sm">
                View All Services
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Featured Properties
            </h2>
            <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mx-auto mt-4 mb-6" />
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Discover our handpicked selection of premium properties available for lease and sale in the St.
              Louis area.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProperties.map((p, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-56 bg-gray-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="p-6">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      className="text-2xl font-bold text-[var(--luxe-navy)]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {p.price}
                    </span>
                    {p.period && <span className="text-gray-500 text-sm">{p.period}</span>}
                  </div>
                  <h3 className="font-bold text-[var(--luxe-navy)] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                    {p.name}
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {p.address}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {p.beds} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      {p.baths} Baths
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      {p.sqft} sqft
                    </span>
                  </div>
                  <Link href="/properties">
                    <span className="block text-center py-3 border border-[var(--luxe-gold)] text-[var(--luxe-gold)] text-sm font-semibold rounded cursor-pointer hover:bg-[var(--luxe-gold)] hover:text-[var(--luxe-navy)] transition-colors">
                      View Details
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/properties">
              <span className="inline-block px-8 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                View All Properties
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Simple, Straightforward Fees. No Surprises.
            </h2>
            <div className="w-[60px] h-[3px] bg-[var(--luxe-gold)] mx-auto mt-4 mb-4" />
            <p className="text-gray-600 max-w-xl mx-auto">
              All plans include a dedicated property manager, online owner portal, and 24/7 maintenance
              coordination.
            </p>

            {/* Toggle — pill style matching live site */}
            <div className="flex justify-center mt-8">
              <div className="flex p-1 rounded-[4px]" style={{ background: "rgba(27,58,92,0.08)" }}>
                <button
                  onClick={() => setPricingTab("traditional")}
                  className={`px-7 py-2.5 text-[13px] font-medium rounded-[2px] transition-all ${
                    pricingTab === "traditional"
                      ? "bg-[var(--luxe-navy)] text-white"
                      : "bg-transparent text-gray-800 hover:bg-[var(--luxe-navy)]/10"
                  }`}
                >
                  Traditional Rental
                </button>
                <button
                  onClick={() => setPricingTab("str")}
                  className={`px-7 py-2.5 text-[13px] font-medium rounded-[2px] transition-all ${
                    pricingTab === "str"
                      ? "bg-[var(--luxe-navy)] text-white"
                      : "bg-transparent text-gray-800 hover:bg-[var(--luxe-navy)]/10"
                  }`}
                >
                  Short-Term Rental
                </button>
              </div>
            </div>
          </div>

          {/* 3-column grid matching live site */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-lg py-9 px-7 ${
                  plan.featured
                    ? "bg-[var(--luxe-navy)]"
                    : "bg-white"
                }`}
                style={{
                  border: plan.featured
                    ? "1px solid var(--luxe-navy)"
                    : "1px solid rgba(27,58,92,0.1)",
                }}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] text-[10px] font-semibold tracking-[2px] uppercase px-3.5 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[var(--luxe-gold)] mb-3.5">
                  {plan.label}
                </p>

                <div className="mb-1 leading-none">
                  <span
                    className={`text-[44px] font-bold ${plan.featured ? "text-white" : "text-[var(--luxe-navy)]"}`}
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.featured ? "text-white/50" : "text-gray-500"}`}>
                    {plan.period}
                  </span>
                </div>

                <p
                  className={`text-[17px] font-semibold mb-2 ${plan.featured ? "text-white" : "text-[var(--luxe-navy)]"}`}
                >
                  {plan.name}
                </p>
                <p className={`text-sm mb-6 leading-relaxed ${plan.featured ? "text-white/50" : "text-gray-500"}`}>
                  {plan.desc}
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li
                      key={j}
                      className={`flex items-start gap-3 text-[13px] ${plan.featured ? "text-white/70" : "text-gray-800"}`}
                    >
                      <span className="text-[var(--luxe-gold)] font-bold flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/contact">
                  <span
                    className={`block text-center py-3.5 px-6 font-semibold text-sm rounded-md cursor-pointer transition-all ${
                      plan.featured
                        ? "bg-[var(--luxe-gold)] text-[var(--luxe-navy)] hover:bg-[#A88830]"
                        : "bg-[var(--luxe-navy)] text-white hover:bg-[var(--luxe-navy)]/90"
                    }`}
                  >
                    {plan.cta}
                  </span>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-sm mt-5">
            One-time leasing/placement fee: 50% of first month's rent · Lease renewal: $150 flat · Eviction
            coordination: $250 + court costs
          </p>
        </div>
      </section>

      {/* ── Neighborhoods ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              We Manage Properties Across Greater St. Louis
            </h2>
            <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mt-4 mb-4" />
            <p className="text-gray-600 text-lg max-w-2xl">
              From North County to St. Charles, Kirkwood to South City — we know these markets because we work
              in them every day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {neighborhoods.map((n) => (
              <Link key={n.slug} href={`/neighborhoods/${n.slug}`}>
                <div className="p-6 border border-gray-200 rounded-xl cursor-pointer hover:border-[var(--luxe-gold)] hover:shadow-md transition-all group">
                  <span
                    className="text-3xl font-bold text-[var(--luxe-gold)] block mb-3"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {n.num}
                  </span>
                  <h3
                    className="text-lg font-bold text-[var(--luxe-navy)] mb-1 group-hover:text-[var(--luxe-gold)] transition-colors"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {n.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{n.desc}</p>
                </div>
              </Link>
            ))}

            {/* Your Area card */}
            <Link href="/contact">
              <div className="p-6 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--luxe-gold)] hover:shadow-md transition-all group">
                <span className="text-3xl font-bold text-gray-300 block mb-3">+</span>
                <h3
                  className="text-lg font-bold text-[var(--luxe-navy)] mb-1 group-hover:text-[var(--luxe-gold)] transition-colors"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Your Area
                </h3>
                <p className="text-gray-500 text-sm">
                  Don't see your neighborhood? Contact us — we likely serve it.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left */}
            <div>
              <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
                WHY CHOOSE US
              </p>
              <h2
                className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                St. Louis's Only End-to-End Investor Platform.
              </h2>
              <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mb-8" />
              <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                No other property management company in St. Louis gives you an in-house GC crew, deal sourcing,
                and full property management under one roof. That's the Luxe difference.
              </p>

              <div className="space-y-6 mb-10">
                {whyBullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded bg-[var(--luxe-gold)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[var(--luxe-gold)] text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--luxe-navy)] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                        {b.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/about">
                <span className="inline-block px-8 py-4 bg-[var(--luxe-navy)] text-white font-semibold text-sm cursor-pointer hover:bg-[var(--luxe-navy)]/90 transition-colors rounded-sm">
                  Learn About Us
                </span>
              </Link>
            </div>

            {/* Right — Commitments */}
            <div>
              <h3
                className="text-xl font-bold text-[var(--luxe-navy)] mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Our Commitment to You
              </h3>
              <div className="space-y-4">
                {commitments.map((c) => (
                  <div
                    key={c.num}
                    className="bg-white rounded-xl p-6 border border-gray-100 flex items-start gap-5"
                  >
                    <span
                      className="text-2xl font-bold text-[var(--luxe-gold)] flex-shrink-0"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {c.num}
                    </span>
                    <div>
                      <h4
                        className="font-bold text-[var(--luxe-navy)] mb-1"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {c.title}
                      </h4>
                      <p className="text-gray-500 text-sm">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-[var(--luxe-navy)]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              What Our Clients Say
            </h2>
            <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mx-auto mt-4 mb-4" />
            <p className="text-white/60 text-lg">
              Hear from property owners and tenants who trust Luxe Property Solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-xl p-8"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-[var(--luxe-gold)]">★</span>
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[var(--luxe-navy)] flex-shrink-0"
                    style={{ background: "var(--luxe-gold)" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div
                      className="text-white font-bold text-sm"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {t.name}
                    </div>
                    <div className="text-[var(--luxe-gold)] text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24" style={{ background: "linear-gradient(135deg, #0A1628 0%, #1A2F45 100%)", borderTop: "1px solid rgba(201,168,76,0.2)" }}>
        <div className="container mx-auto text-center">
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to Work With St. Louis's Only End-to-End Investor Platform?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            From deal sourcing and rehab to leasing and long-term management — we handle it all so you never
            have to wonder what's happening with your investment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <span className="inline-block px-10 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Get a Free Rental Analysis
              </span>
            </Link>
            <a href="tel:6362011239">
              <span className="inline-block px-10 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                Call 636-201-1239
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
