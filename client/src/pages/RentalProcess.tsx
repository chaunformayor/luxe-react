import { Link } from "wouter";
import { CheckCircle, AlertCircle } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Browse Properties",
    desc: "Start on our Properties page. Filter by For Rent or For Sale. Look for the HCV OK badge if you're using a Housing Choice Voucher. Each listing shows price, beds, baths, square footage, and property type.",
    tip: "Contact us if you don't see what you need — new listings are added regularly and we may have unlisted properties that fit your situation.",
  },
  {
    num: "02",
    title: "Submit Your Application",
    desc: "Apply online in minutes. Each adult (18+) on the lease must submit a separate application and pay the $75 application fee. This covers your background check, credit check, and rental history verification.",
    tip: "Have your ID, proof of income (pay stubs or bank statements), and current landlord contact info ready to speed things up.",
  },
  {
    num: "03",
    title: "Screening & Review",
    desc: "We review every application within 2–3 business days. Our screening looks at credit, income, rental history, and background. We'll contact your employer and previous landlord as part of the process.",
    tip: "If something in your history gives you concern, reach out before applying — we evaluate applications holistically and appreciate transparency.",
  },
  {
    num: "04",
    title: "Approval & Lease Signing",
    desc: "Approved applicants receive a lease agreement to review and sign electronically. You'll also pay your security deposit at this stage to hold the unit.",
    tip: "Review your lease carefully. Our team is available to walk you through any terms you have questions about.",
  },
  {
    num: "05",
    title: "Move-In",
    desc: "On your move-in date, we conduct a walk-through inspection together and document the property's condition. You'll receive your keys, access to your Tenant Portal, and all the info you need to get settled.",
    tip: "The move-in inspection protects you — it's the baseline we compare against at move-out. Take your own photos too.",
  },
];

const requirements = [
  {
    category: "Credit",
    items: [
      "Minimum credit score of 580",
      "We review full credit history — a low score alone won't automatically disqualify you",
      "No open evictions or unpaid landlord debts",
    ],
  },
  {
    category: "Income",
    items: [
      "Gross monthly income must be at least 3× the monthly rent",
      "Acceptable sources: employment, self-employment, Social Security, disability, child support, alimony, housing assistance",
      "Income verification required (pay stubs, bank statements, or benefit letters)",
    ],
  },
  {
    category: "Background",
    items: [
      "Full background check run on every adult applicant",
      "No violent felony convictions",
      "Other criminal history reviewed on a case-by-case basis",
      "We comply with all Fair Housing and source-of-income non-discrimination laws",
    ],
  },
  {
    category: "Rental History",
    items: [
      "Previous landlord references required",
      "No evictions within the past 5 years",
      "No history of property damage or lease violations",
    ],
  },
];

const fees = [
  { label: "Application Fee", value: "$75 per adult", note: "Non-refundable. Covers background, credit, and rental history check." },
  { label: "Security Deposit", value: "Up to 2 months' rent", note: "Amount determined based on application. Held per Missouri security deposit law." },
  { label: "Pet Deposit", value: "$150 (one-time)", note: "Required for all pets. Ask about breed/size restrictions per property." },
  { label: "First Month's Rent", value: "Due at lease signing", note: "Pro-rated if move-in falls mid-month." },
];

const leaseTypes = [
  { type: "Standard 12-Month", desc: "Our most common lease. Locks in your rate for the full year with renewal options at term end." },
  { type: "Month-to-Month", desc: "Available on select properties. Offers flexibility with a 30-day notice to vacate. Typically a small premium over the 12-month rate." },
  { type: "Mid-Term (3–6 months)", desc: "Ideal for relocations, travel professionals, or anyone in transition. Available on select furnished and unfurnished properties." },
  { type: "Short-Term (30–90 days)", desc: "Available on select properties. Contact us to discuss availability and pricing." },
];

const faqs = [
  {
    q: "Can I apply if I have no credit history?",
    a: "Yes. No credit history is treated differently than bad credit. We'll look at your income, rental history, and references more heavily. A co-signer may also be an option.",
  },
  {
    q: "Can I get a co-signer?",
    a: "Yes. Co-signers must complete a full application and meet income requirements independently (typically 4–5× the monthly rent). Co-signers are equally responsible for the lease.",
  },
  {
    q: "Do you accept Housing Choice Vouchers?",
    a: "Yes. We accept Section 8 / HCV, VASH, Emergency Housing Vouchers, and other local assistance programs. Look for the HCV OK badge on eligible listings.",
  },
  {
    q: "How long does the approval process take?",
    a: "Most applications are reviewed within 2–3 business days. If your employer or previous landlord is slow to respond, it may take slightly longer. We'll keep you updated throughout.",
  },
  {
    q: "Are pets allowed?",
    a: "Yes — we are pet-friendly. A one-time $150 pet deposit applies. Specific breed or size restrictions may apply on individual properties. Ask before applying.",
  },
  {
    q: "What happens to my security deposit?",
    a: "Your deposit is held in a separate account per Missouri law. It's returned within 30 days of move-out, minus any documented damages beyond normal wear and tear. We conduct a move-out inspection and provide an itemized statement.",
  },
  {
    q: "Can I transfer to another Luxe property?",
    a: "Yes. Current tenants in good standing (on-time payments, no lease violations) can request a transfer to another available property. A new application is required.",
  },
  {
    q: "What's your maintenance response time?",
    a: "We target same or next business day for non-emergency requests. Emergency issues (no heat in winter, water leak, no hot water) are handled within hours. An after-hours emergency line is available 24/7.",
  },
];

export default function RentalProcess() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <Link href="/tenants"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Tenants</span></Link>
            <span className="mx-2">/</span>
            <span>Rental Process</span>
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            The Rental Process
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Everything you need to know — from browsing properties to getting your keys. No surprises, no
            hidden steps.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link href="/properties">
              <span className="inline-block px-8 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Browse Properties
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

      {/* ── Step-by-Step ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4">From Search to Keys</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              How It Works
            </h2>
            <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mx-auto" />
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {steps.map((s, i) => (
              <div key={s.num} className="flex gap-6 p-8 rounded-xl border border-gray-100 hover:border-[var(--luxe-gold)]/30 hover:shadow-md transition-all">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-[var(--luxe-navy)] flex items-center justify-center">
                    <span className="text-[var(--luxe-gold)] font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>{s.num}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-100 mx-auto mt-3" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <h3 className="text-xl font-bold text-[var(--luxe-navy)] mb-3" style={{ fontFamily: "var(--font-heading)" }}>{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{s.desc}</p>
                  <div className="flex items-start gap-2 bg-[var(--luxe-gold)]/10 border border-[var(--luxe-gold)]/20 rounded-lg p-4">
                    <CheckCircle className="w-4 h-4 text-[var(--luxe-gold)] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">{s.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Requirements ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4">What We Look For</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Rental Requirements
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We keep our requirements straightforward and apply them consistently and fairly to every applicant.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {requirements.map((r) => (
              <div key={r.category} className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                <p className="text-[var(--luxe-gold)] text-xs font-bold uppercase tracking-[3px] mb-4">{r.category}</p>
                <ul className="space-y-3">
                  {r.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[var(--luxe-navy)] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 max-w-4xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>We evaluate applications holistically.</strong> Meeting the minimum requirements doesn't guarantee approval, and not meeting one factor doesn't automatically disqualify you. If you have concerns, contact us before applying.
            </p>
          </div>
        </div>
      </section>

      {/* ── Fees ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4">Upfront Costs</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Fees & Deposits
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">No hidden fees. Here's exactly what to expect.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {fees.map((f) => (
              <div key={f.label} className="bg-[var(--luxe-light)] rounded-xl p-7 border border-gray-100">
                <p className="text-[var(--luxe-gold)] text-xs font-bold uppercase tracking-[2px] mb-3">{f.label}</p>
                <p className="text-[var(--luxe-navy)] font-bold text-xl mb-3" style={{ fontFamily: "var(--font-heading)" }}>{f.value}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{f.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lease Types ── */}
      <section className="py-24 bg-[var(--luxe-navy)]">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4">Flexible Options</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Lease Terms We Offer
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">We work with your situation — not just the standard 12-month lease.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {leaseTypes.map((l) => (
              <div key={l.type} className="bg-white/10 border border-white/20 rounded-xl p-7">
                <p className="text-[var(--luxe-gold)] font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>{l.type}</p>
                <p className="text-white/70 text-sm leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4">Common Questions</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-white rounded-xl p-7 border border-gray-100 shadow-sm">
                <p className="font-bold text-[var(--luxe-navy)] mb-3" style={{ fontFamily: "var(--font-heading)" }}>{f.q}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-[var(--luxe-navy)]">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to Get Started?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Browse available properties or submit your application today. Have questions? We're here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/properties">
              <span className="inline-block px-10 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Browse Properties
              </span>
            </Link>
            <Link href="/apply">
              <span className="inline-block px-10 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                Apply Now
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
