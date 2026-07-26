import { Link } from "wouter";
import { Home, Wrench, CreditCard, MessageCircle, CheckCircle, Shield, FileText } from "lucide-react";

const services = [
  {
    icon: Home,
    title: "Quality Properties",
    desc: "Access to well-maintained, premium properties in desirable St. Louis neighborhoods — single-family homes, condos, and multi-family units.",
  },
  {
    icon: Wrench,
    title: "24/7 Maintenance",
    desc: "Submit maintenance requests online any time. Our team dispatches vetted, licensed contractors fast — including emergency response after hours.",
  },
  {
    icon: CreditCard,
    title: "Easy Online Payments",
    desc: "Pay rent securely through your Tenant Portal. Set up auto-pay, view your payment history, and download receipts — all in one place.",
  },
  {
    icon: MessageCircle,
    title: "Responsive Support",
    desc: "A real team answers your questions. No voicemail loops. Our leasing and management staff respond within one business day.",
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
    icon: CreditCard,
    title: "PHA Coordination",
    desc: "Our leasing team handles all coordination with your PHA — from the RFTA form to HAP contract execution — so you can focus on your move.",
  },
];

const steps = [
  { num: "01", title: "Browse Properties", desc: "View available rentals on our Properties page. Look for the HCV OK badge on voucher-eligible units." },
  { num: "02", title: "Submit Application", desc: "Complete our online application in minutes. Include your voucher details in the Voucher section. The $75 fee covers your background and credit check." },
  { num: "03", title: "PHA Coordination", desc: "Once approved, our team contacts your housing authority to schedule the HQS inspection and execute the HAP contract." },
  { num: "04", title: "Sign & Move In", desc: "Sign your lease, pay any tenant-share deposit, and get your keys. We'll walk you through everything." },
];

export default function Tenants() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white py-20">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <span>Tenants</span>
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            For Tenants
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Premium properties. Responsive management. A rental experience that actually feels like home.
            Housing Choice Vouchers welcome.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link href="/apply">
              <span className="inline-block px-8 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Apply Now — $75 Fee
              </span>
            </Link>
            <Link href="/properties">
              <span className="inline-block px-8 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                View Properties
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── What We Offer ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="mb-14">
            <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
              Tenant Experience
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              What We Offer Our Tenants
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl">
              We manage properties the way we'd want our own home managed — maintained, responsive, and
              handled with care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
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
                      {s.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Voucher Section ── */}
      <section className="py-24 bg-[var(--luxe-navy)]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--luxe-gold)]/20 border border-[var(--luxe-gold)]/40 text-[var(--luxe-gold)] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                <CheckCircle className="w-4 h-4" /> Vouchers Welcome
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold text-white mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                We Accept Housing Choice Vouchers
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Luxe Property Solutions proudly works with Housing Choice Voucher (HCV) holders, including
                Section 8, VASH, and other housing assistance programs. All eligible properties are
                voucher-ready.
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

            {/* Right — info cards */}
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
                        <h3
                          className="font-bold text-white mb-1"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {c.title}
                        </h3>
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

      {/* ── How Voucher Process Works ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              How the Voucher Process Works
            </h2>
            <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mx-auto mb-4" />
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              We make the HCV process straightforward. Here's what to expect from application to move-in.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-white rounded-xl p-8 border border-gray-100 hover:border-[var(--luxe-gold)]/40 hover:shadow-md transition-all"
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* ── Tenant Portal CTA ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <div className="bg-[var(--luxe-light)] rounded-2xl p-10 md:p-14 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-[var(--luxe-navy)] flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-[var(--luxe-gold)]" />
              </div>
              <div>
                <h3
                  className="text-2xl font-bold text-[var(--luxe-navy)] mb-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Already a Tenant?
                </h3>
                <p className="text-gray-500 text-sm">
                  Access your Tenant Portal to pay rent, submit maintenance requests, and view your lease documents.
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
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to Find Your New Home?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Start your application online in minutes. A $75 fee covers processing and your comprehensive
            background &amp; credit check.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/apply">
              <span className="inline-block px-10 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Apply Now
              </span>
            </Link>
            <Link href="/properties">
              <span className="inline-block px-10 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                View Properties
              </span>
            </Link>
            <Link href="/contact">
              <span className="inline-block px-10 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                Contact Us
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
