import { Link } from "wouter";
import { Home, Wrench, CreditCard, MessageCircle, CheckCircle, Shield, FileText, PawPrint, Calendar, Clock } from "lucide-react";

const perks = [
  {
    icon: Home,
    title: "Quality Properties",
    desc: "Well-maintained, move-in ready homes across St. Louis — single-family, condos, and multi-family. Every property meets our quality standards before you sign.",
  },
  {
    icon: Wrench,
    title: "Fast Maintenance",
    desc: "Submit requests online any time. Our in-house team responds fast — typically same or next business day. Emergency line available 24/7.",
  },
  {
    icon: CreditCard,
    title: "Easy Online Payments",
    desc: "Pay rent, set up auto-pay, view your history, and download receipts through your Tenant Portal. No checks, no hassle.",
  },
  {
    icon: MessageCircle,
    title: "Real People, Real Answers",
    desc: "No voicemail loops. Our leasing and management team responds within one business day — often the same day.",
  },
  {
    icon: PawPrint,
    title: "Pet Friendly",
    desc: "We welcome pets. A one-time $150 pet deposit applies. Ask our team about breed or size restrictions on specific properties.",
  },
  {
    icon: Calendar,
    title: "Flexible Lease Terms",
    desc: "Standard 12-month leases plus short-term, mid-term, and month-to-month options available on select properties. We work with your situation.",
  },
];

const voucherTypes = [
  "Section 8 / Housing Choice Voucher (HCV)",
  "VASH (Veterans Affairs Supportive Housing)",
  "Emergency Housing Vouchers (EHV)",
  "Other state and local assistance programs",
];

const voucherCards = [
  {
    icon: Shield,
    title: "Fair Housing Commitment",
    desc: "We do not discriminate based on source of income. Voucher holders receive the same quality of service and access to properties as all other tenants.",
  },
  {
    icon: CheckCircle,
    title: "HQS-Ready Properties",
    desc: "Our properties are maintained to exceed Housing Quality Standards, making PHA inspections smooth and approvals fast.",
  },
  {
    icon: Clock,
    title: "PHA Coordination",
    desc: "Our leasing team handles all coordination with your PHA — from the RFTA form to HAP contract execution — so you can focus on your move.",
  },
];

const quickReqs = [
  { label: "Credit Score", value: "580 minimum" },
  { label: "Income", value: "3× monthly rent" },
  { label: "Background", value: "No violent felonies" },
  { label: "Application Fee", value: "$75 per adult" },
  { label: "Security Deposit", value: "Up to 2 months' rent" },
  { label: "Pet Deposit", value: "$150 (one-time)" },
];

export default function Tenants() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <span>Tenants</span>
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            Find Your Next Home
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Premium properties. Responsive management. Flexible lease terms. Housing Choice Vouchers welcome.
            We make renting straightforward.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link href="/properties">
              <span className="inline-block px-8 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                View Available Properties
              </span>
            </Link>
            <Link href="/rental-process">
              <span className="inline-block px-8 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                How It Works
              </span>
            </Link>
            <Link href="/apply">
              <span className="inline-block px-8 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                Apply Now
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Rent With Us ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="mb-14">
            <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
              Why Luxe
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Renting Done Right
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl">
              We manage properties the way we'd want our own home managed — well-maintained, responsive, and
              built around your life, not just the lease.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="flex items-start gap-5 p-7 rounded-xl border border-gray-100 hover:border-[var(--luxe-gold)]/40 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[var(--luxe-navy)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-[var(--luxe-gold)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--luxe-navy)] mb-1.5" style={{ fontFamily: "var(--font-heading)" }}>{s.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Quick Requirements ── */}
      <section className="py-20 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4">At a Glance</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--luxe-navy)] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                Basic Rental Requirements
              </h2>
              <p className="text-gray-500">We keep our requirements clear and straightforward.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {quickReqs.map((r) => (
                <div key={r.label} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-[var(--luxe-gold)] text-xs font-bold uppercase tracking-[2px] mb-2">{r.label}</p>
                  <p className="text-[var(--luxe-navy)] font-bold text-lg">{r.value}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/rental-process">
                <span className="inline-block px-8 py-4 bg-[var(--luxe-navy)] text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-navy)]/90 transition-colors rounded-sm">
                  See Full Process & Requirements →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Voucher Section ── */}
      <section className="py-24 bg-[var(--luxe-navy)]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--luxe-gold)]/20 border border-[var(--luxe-gold)]/40 text-[var(--luxe-gold)] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                <CheckCircle className="w-4 h-4" /> Vouchers Welcome
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                We Accept Housing Choice Vouchers
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Luxe Property Solutions proudly works with HCV holders, including Section 8, VASH, and other
                housing assistance programs. All eligible properties are voucher-ready.
              </p>
              <ul className="space-y-3 mb-8">
                {voucherTypes.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-4 h-4 text-[var(--luxe-gold)] flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/vouchers">
                  <span className="inline-block px-7 py-3 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                    Voucher Holder Info
                  </span>
                </Link>
                <Link href="/apply">
                  <span className="inline-block px-7 py-3 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                    Apply Now
                  </span>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {voucherCards.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="bg-white/10 border border-white/20 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--luxe-gold)]/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[var(--luxe-gold)]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-1" style={{ fontFamily: "var(--font-heading)" }}>{c.title}</h3>
                        <p className="text-white/60 text-sm leading-relaxed">{c.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Portal CTA ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <div className="bg-[var(--luxe-light)] rounded-2xl p-10 md:p-14 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-[var(--luxe-navy)] flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-[var(--luxe-gold)]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--luxe-navy)] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                  Already a Tenant?
                </h3>
                <p className="text-gray-500 text-sm">
                  Access your portal to pay rent, submit maintenance requests, and view your lease documents.
                </p>
              </div>
            </div>
            <Link href="/login">
              <span className="inline-block px-8 py-4 bg-[var(--luxe-navy)] text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-navy)]/90 transition-colors rounded-lg whitespace-nowrap">
                Tenant Portal Login
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-[var(--luxe-navy)]">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to Find Your New Home?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Browse our available properties or start your application today. The $75 fee covers processing
            and your comprehensive background &amp; credit check.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/properties">
              <span className="inline-block px-10 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                View Properties
              </span>
            </Link>
            <Link href="/rental-process">
              <span className="inline-block px-10 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                How It Works
              </span>
            </Link>
            <Link href="/apply">
              <span className="inline-block px-10 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                Apply Now
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
