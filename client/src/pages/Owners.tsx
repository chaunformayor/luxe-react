import { useState } from "react";
import { Link } from "wouter";
import { TrendingUp, Clock, Shield, BarChart, CheckCircle, FileText, Users, Wrench } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Maximize Your Returns",
    desc: "Strategic pricing, professional marketing, and low vacancy rates translate directly into higher net income for your portfolio.",
  },
  {
    icon: Clock,
    title: "Truly Passive Income",
    desc: "We handle every call, request, and repair. You collect distributions and review monthly statements — nothing more.",
  },
  {
    icon: Shield,
    title: "Protect Your Investment",
    desc: "Rigorous tenant screening, regular property inspections, and a vetted contractor network keep your asset in prime condition.",
  },
  {
    icon: BarChart,
    title: "Transparent Reporting",
    desc: "Real-time access to income, expenses, and maintenance history through your Owner Portal — 24/7, from any device.",
  },
];

const steps = [
  {
    num: "01",
    title: "Free Consultation",
    desc: "We learn about your property, your goals, and your current situation. No obligation, no pressure.",
  },
  {
    num: "02",
    title: "Property Assessment",
    desc: "Our team conducts a thorough market analysis and property walkthrough to set the right rental rate.",
  },
  {
    num: "03",
    title: "Onboarding",
    desc: "We handle paperwork, photography, listing setup, and tenant marketing — all within days of signing.",
  },
  {
    num: "04",
    title: "Hands-Free Management",
    desc: "Sit back while we handle everything: leasing, maintenance, rent collection, reporting, and renewals.",
  },
];

const included = [
  "Professional HDR photography & listing syndication",
  "Rigorous tenant screening (credit, criminal, income, references)",
  "Online rent collection & direct deposit to owner",
  "Monthly owner statements & year-end 1099 preparation",
  "24/7 emergency maintenance response",
  "Vetted, licensed & insured contractor network",
  "Move-in / move-out inspections with photo documentation",
  "Lease preparation, renewals & enforcement",
  "Security deposit management & accounting",
  "Fair Housing compliant practices throughout",
];

const plans = [
  {
    id: "starter",
    label: "STARTER",
    price: "$75",
    period: "/month",
    tagline: "Leasing Only",
    desc: "Ideal for owners who want professional tenant placement and move-in coordination, then self-manage.",
    bullets: ["Market rent analysis", "Professional marketing & showings", "Full tenant screening", "Lease execution", "Move-in coordination"],
    featured: false,
  },
  {
    id: "fullservice",
    label: "FULL SERVICE",
    price: "8%",
    period: "of monthly rent",
    tagline: "Full Management",
    desc: "Our most popular plan. Everything from leasing through ongoing management, maintenance, and reporting.",
    bullets: ["Everything in Starter", "Rent collection & direct deposit", "Monthly owner statements", "Maintenance coordination", "Lease renewals & enforcement"],
    featured: true,
  },
  {
    id: "portfolio",
    label: "PORTFOLIO",
    price: "7%",
    period: "of monthly rent",
    tagline: "Investor Portfolio",
    desc: "Discounted full-service management for investors with 3+ units. Same great service, better rate.",
    bullets: ["Everything in Full Service", "Portfolio-level reporting", "Dedicated account manager", "Priority maintenance dispatch", "Quarterly portfolio review"],
    featured: false,
  },
];

export default function Owners() {
  const [activeTab, setActiveTab] = useState<"traditional" | "str">("traditional");

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <span>Property Owners</span>
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Property Owners
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Partner with St. Louis's only end-to-end investor platform — deal sourcing, rehab, and full-service
            property management under one roof.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link href="/contact">
              <span className="inline-block px-8 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Request Free Consultation
              </span>
            </Link>
            <Link href="/owner-login">
              <span className="inline-block px-8 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                Owner Portal Login
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="mb-14">
            <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
              Why Partner With Us
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Management That Works as Hard as You Do
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl">
              We built our platform for investors — not just property managers. Every decision we make is
              designed to protect and grow your investment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="flex items-start gap-6 p-8 rounded-xl border border-gray-100 hover:border-[var(--luxe-gold)]/40 hover:shadow-md transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-[var(--luxe-navy)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7 text-[var(--luxe-gold)]" />
                  </div>
                  <div>
                    <h3
                      className="text-xl font-bold text-[var(--luxe-navy)] mb-2"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {b.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              How It Works
            </h2>
            <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mx-auto mb-4" />
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From first call to first rent check — here's what to expect when you partner with Luxe.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-0px)] w-full h-0.5 bg-[var(--luxe-gold)]/20 z-0" style={{ width: "calc(100% - 2rem)", left: "calc(50% + 2rem)" }} />
                )}
                <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-[var(--luxe-gold)]/40 hover:shadow-md transition-all relative z-10">
                  <div
                    className="text-4xl font-bold text-[var(--luxe-gold)] mb-4"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {s.num}
                  </div>
                  <h3
                    className="text-lg font-bold text-[var(--luxe-navy)] mb-3"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="py-24 bg-[var(--luxe-navy)]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
                Full-Service Management
              </p>
              <h2
                className="text-4xl md:text-5xl font-bold text-white mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Everything Included. No Surprises.
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Our management plans cover the full lifecycle of your rental — from marketing and tenant
                placement to ongoing maintenance and financial reporting. Here's what's included at every level:
              </p>
              <Link href="/services">
                <span className="inline-block px-8 py-3 border border-[var(--luxe-gold)] text-[var(--luxe-gold)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)] hover:text-[var(--luxe-navy)] transition-colors rounded-sm">
                  View Full Service Details
                </span>
              </Link>
            </div>
            <div className="grid gap-3">
              {included.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--luxe-gold)] flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Simple, Transparent Pricing
            </h2>
            <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mx-auto mb-4" />
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              No hidden fees. No surprises. Choose the plan that fits your portfolio.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-0 mt-8 border border-gray-200 rounded-lg w-fit mx-auto overflow-hidden">
              {(["traditional", "str"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-7 py-3 text-sm font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-[var(--luxe-navy)] text-white"
                      : "bg-white text-gray-500 hover:text-[var(--luxe-navy)]"
                  }`}
                >
                  {tab === "traditional" ? "Traditional Rental" : "Short-Term Rental"}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "traditional" && (
            <div className="flex flex-col max-w-3xl mx-auto gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-xl border-2 p-8 transition-all ${
                    plan.featured
                      ? "border-[var(--luxe-navy)] bg-[var(--luxe-navy)] text-white shadow-xl"
                      : "border-gray-100 bg-white hover:border-[var(--luxe-gold)]/40 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="md:w-56 flex-shrink-0">
                      {plan.featured && (
                        <span className="inline-block text-xs font-bold uppercase tracking-[2px] bg-[var(--luxe-gold)] text-[var(--luxe-navy)] px-3 py-1 rounded-full mb-3">
                          Most Popular
                        </span>
                      )}
                      <div className={`text-xs font-bold uppercase tracking-[3px] mb-2 ${plan.featured ? "text-[var(--luxe-gold)]/70" : "text-gray-400"}`}>
                        {plan.label}
                      </div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className={`text-4xl font-bold ${plan.featured ? "text-[var(--luxe-gold)]" : "text-[var(--luxe-navy)]"}`} style={{ fontFamily: "var(--font-heading)" }}>
                          {plan.price}
                        </span>
                        <span className={`text-sm ${plan.featured ? "text-white/50" : "text-gray-400"}`}>{plan.period}</span>
                      </div>
                      <div className={`text-sm font-semibold mb-2 ${plan.featured ? "text-white/80" : "text-gray-500"}`}>
                        {plan.tagline}
                      </div>
                      <p className={`text-xs leading-relaxed ${plan.featured ? "text-white/50" : "text-gray-400"}`}>
                        {plan.desc}
                      </p>
                    </div>
                    <div className="flex-1 grid sm:grid-cols-2 gap-2">
                      {plan.bullets.map((b) => (
                        <div key={b} className="flex items-start gap-2">
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.featured ? "text-[var(--luxe-gold)]" : "text-[var(--luxe-gold)]"}`} />
                          <span className={`text-sm ${plan.featured ? "text-white/80" : "text-gray-600"}`}>{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex-shrink-0">
                      <Link href="/contact">
                        <span className={`inline-block px-6 py-3 text-sm font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                          plan.featured
                            ? "bg-[var(--luxe-gold)] text-[var(--luxe-navy)] hover:bg-[var(--luxe-gold)]/90"
                            : "border border-[var(--luxe-navy)] text-[var(--luxe-navy)] hover:bg-[var(--luxe-navy)] hover:text-white"
                        }`}>
                          Get Started
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-center text-xs text-gray-400 mt-4">
                One-time leasing/placement fee: 50% of first month's rent · Lease renewal: $150 flat · Eviction coordination: $250 + court costs
              </p>
            </div>
          )}

          {activeTab === "str" && (
            <div className="flex flex-col max-w-3xl mx-auto gap-4">
              {[
                {
                  label: "SETUP",
                  price: "$499",
                  period: "one-time",
                  tagline: "STR Launch Package",
                  desc: "We set up your short-term rental from scratch — listing, photography, pricing strategy, and platform setup.",
                  bullets: ["Platform setup (Airbnb, VRBO, etc.)", "Professional photography", "Listing copywriting", "Dynamic pricing configuration", "House manual & guest guide"],
                  featured: false,
                },
                {
                  label: "FULL SERVICE STR",
                  price: "20%",
                  period: "of gross revenue",
                  tagline: "Full STR Management",
                  desc: "End-to-end management of your short-term rental — guest communication, cleaning coordination, and dynamic pricing.",
                  bullets: ["Guest communication 24/7", "Cleaning & turnover coordination", "Dynamic pricing management", "Monthly owner distributions", "Performance reporting"],
                  featured: true,
                },
                {
                  label: "HYBRID",
                  price: "Custom",
                  period: "",
                  tagline: "Flexible Arrangement",
                  desc: "You manage the guest experience; we handle pricing, listings, and financial reporting. Built around your schedule.",
                  bullets: ["Listing optimization", "Dynamic pricing", "Financial reporting", "Owner support as needed", "Flexible engagement"],
                  featured: false,
                },
              ].map((plan) => (
                <div
                  key={plan.label}
                  className={`rounded-xl border-2 p-8 transition-all ${
                    plan.featured
                      ? "border-[var(--luxe-navy)] bg-[var(--luxe-navy)] text-white shadow-xl"
                      : "border-gray-100 bg-white hover:border-[var(--luxe-gold)]/40 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="md:w-56 flex-shrink-0">
                      {plan.featured && (
                        <span className="inline-block text-xs font-bold uppercase tracking-[2px] bg-[var(--luxe-gold)] text-[var(--luxe-navy)] px-3 py-1 rounded-full mb-3">
                          Most Popular
                        </span>
                      )}
                      <div className={`text-xs font-bold uppercase tracking-[3px] mb-2 ${plan.featured ? "text-[var(--luxe-gold)]/70" : "text-gray-400"}`}>
                        {plan.label}
                      </div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className={`text-4xl font-bold ${plan.featured ? "text-[var(--luxe-gold)]" : "text-[var(--luxe-navy)]"}`} style={{ fontFamily: "var(--font-heading)" }}>
                          {plan.price}
                        </span>
                        {plan.period && <span className={`text-sm ${plan.featured ? "text-white/50" : "text-gray-400"}`}>{plan.period}</span>}
                      </div>
                      <div className={`text-sm font-semibold mb-2 ${plan.featured ? "text-white/80" : "text-gray-500"}`}>{plan.tagline}</div>
                      <p className={`text-xs leading-relaxed ${plan.featured ? "text-white/50" : "text-gray-400"}`}>{plan.desc}</p>
                    </div>
                    <div className="flex-1 grid sm:grid-cols-2 gap-2">
                      {plan.bullets.map((b) => (
                        <div key={b} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--luxe-gold)]" />
                          <span className={`text-sm ${plan.featured ? "text-white/80" : "text-gray-600"}`}>{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex-shrink-0">
                      <Link href="/contact">
                        <span className={`inline-block px-6 py-3 text-sm font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                          plan.featured
                            ? "bg-[var(--luxe-gold)] text-[var(--luxe-navy)] hover:bg-[var(--luxe-gold)]/90"
                            : "border border-[var(--luxe-navy)] text-[var(--luxe-navy)] hover:bg-[var(--luxe-navy)] hover:text-white"
                        }`}>
                          Get Started
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Owner Portal CTA ── */}
      <section className="py-16 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="bg-white rounded-2xl p-10 md:p-14 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-[var(--luxe-navy)] flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-[var(--luxe-gold)]" />
              </div>
              <div>
                <h3
                  className="text-2xl font-bold text-[var(--luxe-navy)] mb-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Already a Client?
                </h3>
                <p className="text-gray-500 text-sm">
                  Access your Owner Portal for statements, maintenance history, and property performance data.
                </p>
              </div>
            </div>
            <Link href="/owner-login">
              <span className="inline-block px-8 py-4 bg-[var(--luxe-navy)] text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-navy)]/90 transition-colors rounded-lg whitespace-nowrap">
                Owner Portal Login
              </span>
            </Link>
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
            Ready to Partner With Us?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Schedule a free consultation and discover how Luxe Property Solutions can transform your
            property management experience and maximize your returns.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <span className="inline-block px-10 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Request Free Consultation
              </span>
            </Link>
            <Link href="/services">
              <span className="inline-block px-10 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                View Our Services
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
