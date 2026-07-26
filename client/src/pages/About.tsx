import { Link } from "wouter";

const values = [
  {
    num: "01",
    title: "Integrity",
    desc: "We operate with complete transparency and honesty in all our dealings. No hidden fees, no surprises — just straightforward, ethical service you can rely on.",
  },
  {
    num: "02",
    title: "Excellence",
    desc: "We strive for perfection in every aspect of property management — from the quality of tenants we place to the responsiveness of our maintenance team.",
  },
  {
    num: "03",
    title: "Care",
    desc: "We treat every property as if it were our own, with meticulous attention to detail and a genuine investment in its long-term success.",
  },
  {
    num: "04",
    title: "Results",
    desc: "We deliver measurable outcomes that exceed our clients' expectations — higher occupancy rates, faster leasing, and stronger returns on investment.",
  },
];

export default function About() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white py-20">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <span>About</span>
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            About Us
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Your trusted partner in premium property management across the greater St. Louis area.
          </p>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
                Our Story
              </p>
              <h2
                className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                St. Louis's Only End-to-End Investor Platform
              </h2>
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p>
                  Luxe Property Solutions is part of a three-company platform built specifically for real estate
                  investors — local and out-of-state alike. Together with{" "}
                  <strong className="text-[var(--luxe-navy)]">Midwest Investor Services</strong> (deal sourcing &
                  underwriting) and{" "}
                  <strong className="text-[var(--luxe-navy)]">Missouri Construction Service</strong> (full rehab &
                  GC), we offer something no other property management company in St. Louis can: a single trusted
                  team for every stage of ownership.
                </p>
                <p>
                  With over 25 years of boots-on-the-ground experience in the St. Louis market, we know which
                  streets to buy on, which properties to skip, and how to turn a vacant unit into a stabilized
                  income-producer fast. Our investors never have to wonder what's happening with their property —
                  because we handle it start to finish.
                </p>
                <p>
                  Based in St. Louis, Missouri, we serve property owners across the metro — from North County and
                  St. Charles to Kirkwood, Webster Groves, and South City.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="lg:pt-16">
              <div className="grid grid-cols-2 gap-6">
                <div
                  className="p-8 rounded-xl text-center"
                  style={{ background: "var(--luxe-navy)" }}
                >
                  <div
                    className="text-5xl font-bold text-[var(--luxe-gold)] mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    25+
                  </div>
                  <div className="text-white/60 text-xs uppercase tracking-widest">Years in St. Louis</div>
                </div>
                <div
                  className="p-8 rounded-xl text-center"
                  style={{ background: "var(--luxe-gold)" }}
                >
                  <div
                    className="text-5xl font-bold text-[var(--luxe-navy)] mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    3
                  </div>
                  <div className="text-[var(--luxe-navy)]/60 text-xs uppercase tracking-widest">
                    Companies, One Team
                  </div>
                </div>

                {/* Three company cards */}
                <div className="col-span-2 space-y-3 mt-2">
                  {[
                    { num: "01", name: "Midwest Investor Services", desc: "Deal sourcing · Underwriting · Investment consulting" },
                    { num: "02", name: "Missouri Construction Service", desc: "Full rehab · Estimating · 25+ years GC experience" },
                    { num: "03", name: "Luxe Property Solutions", desc: "Traditional & short-term rental management" },
                  ].map((c) => (
                    <div
                      key={c.num}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-100"
                    >
                      <span
                        className="text-xl font-bold text-[var(--luxe-gold)]"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {c.num}
                      </span>
                      <div>
                        <div className="font-semibold text-[var(--luxe-navy)] text-sm">{c.name}</div>
                        <div className="text-gray-400 text-xs">{c.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-10 border-t-4 border-[var(--luxe-gold)] shadow-sm">
              <h3
                className="text-2xl font-bold text-[var(--luxe-navy)] mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To provide property owners with comprehensive, transparent, and results-driven management
                services that maximize investment returns while delivering exceptional experiences for every
                tenant we serve.
              </p>
            </div>
            <div className="bg-white rounded-xl p-10 border-t-4 border-[var(--luxe-gold)] shadow-sm">
              <h3
                className="text-2xl font-bold text-[var(--luxe-navy)] mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To be the most trusted property management company in St. Louis, known for our unwavering
                commitment to excellence, our innovative technology-driven approach, and our genuine care for
                every client relationship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Our Core Values
            </h2>
            <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mx-auto mb-4" />
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              The principles that guide every decision we make and every interaction we have.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((v) => (
              <div
                key={v.num}
                className="flex items-start gap-6 p-8 rounded-xl border border-gray-100 hover:border-[var(--luxe-gold)]/40 hover:shadow-md transition-all"
              >
                <span
                  className="text-3xl font-bold text-[var(--luxe-gold)] flex-shrink-0"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {v.num}
                </span>
                <div>
                  <h3
                    className="text-xl font-bold text-[var(--luxe-navy)] mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{v.desc}</p>
                </div>
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
            Ready to Partner With Us?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Schedule a free consultation and discover how Luxe Property Solutions can transform your property
            management experience.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <span className="inline-block px-10 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Request Free Consultation
              </span>
            </Link>
            <Link href="/services">
              <span className="inline-block px-10 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                Explore Our Services
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
