import { Link } from "wouter";
import Layout from "@/components/Layout";

const neighborhoods = [
  {
    num: "01",
    name: "North County",
    slug: "north-county",
    sub: "Florissant · Ferguson · Hazelwood · Jennings",
    desc: "St. Louis's most active single-family rental investment corridor. Affordable acquisitions, strong renter demand, and consistent rent growth make North County one of the highest cash-on-cash return markets in the metro.",
    stats: [
      { label: "Avg. Rent", value: "$1,265/mo" },
      { label: "Cap Rates", value: "6–8%" },
      { label: "Vacancy", value: "~5%" },
    ],
    tags: ["High Yield", "Single-Family", "Investor Demand"],
  },
  {
    num: "02",
    name: "St. Charles County",
    slug: "st-charles",
    sub: "O'Fallon · Wentzville · St. Peters · Lake St. Louis",
    desc: "The fastest-growing county in Missouri. Corporate relocations, top-rated schools, and new construction demand drive premium rents and strong appreciation. Best appreciation play in the STL metro.",
    stats: [
      { label: "Avg. Rent", value: "$1,650/mo" },
      { label: "Growth", value: "Top 5 MO" },
      { label: "Vacancy", value: "~4%" },
    ],
    tags: ["Appreciation", "Corporate Tenants", "New Construction"],
  },
  {
    num: "03",
    name: "Kirkwood",
    slug: "kirkwood",
    sub: "Kirkwood · Sunset Hills · Crestwood",
    desc: "Premium single-family rentals with exceptionally low turnover. Corporate relocation demand, one of STL's top-rated school districts, and a walkable downtown make Kirkwood a landlord's ideal hold-forever market.",
    stats: [
      { label: "Avg. Rent", value: "$1,900/mo" },
      { label: "Turnover", value: "Very Low" },
      { label: "Vacancy", value: "~3%" },
    ],
    tags: ["Premium Rentals", "Low Turnover", "Top Schools"],
  },
  {
    num: "04",
    name: "Webster Groves",
    slug: "webster-groves",
    sub: "Webster Groves · Shrewsbury · Rock Hill",
    desc: "Historic brick homes, long-term tenants, and steady university demand from Webster University. One of STL's most desirable suburban markets with a tight rental inventory and consistent appreciation.",
    stats: [
      { label: "Avg. Rent", value: "$1,750/mo" },
      { label: "Tenure", value: "2–4 yrs avg" },
      { label: "Vacancy", value: "~3.5%" },
    ],
    tags: ["University Demand", "Brick Homes", "Long-Term Tenants"],
  },
  {
    num: "05",
    name: "South City & South County",
    slug: "south-city",
    sub: "Soulard · Bevo Mill · Mehlville · Oakville · Tower Grove",
    desc: "Brick duplex country with strong STR opportunity in gentrifying pockets like Soulard and Tower Grove. South County's suburban corridor offers solid cash flow and steady family tenant demand.",
    stats: [
      { label: "Avg. Rent", value: "$1,150/mo" },
      { label: "STR Potential", value: "High (City)" },
      { label: "Vacancy", value: "~5%" },
    ],
    tags: ["Brick Duplexes", "STR Opportunity", "Gentrification"],
  },
];

export default function Neighborhoods() {
  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <span>Neighborhoods</span>
          </p>
          <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4">
            Greater St. Louis
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Markets We Serve
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            We manage properties across five core submarkets in the St. Louis metro. Each has its own
            investment profile — and we know all of them because we work in them every day.
          </p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="bg-[var(--luxe-gold)]">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--luxe-navy)]/20">
            {[
              { value: "5", label: "Core Markets" },
              { value: "25+", label: "Years in STL" },
              { value: "~95%", label: "Avg. Occupancy" },
              { value: "500+", label: "Units Managed" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center py-9 px-6">
                <span className="text-[36px] font-bold text-[var(--luxe-navy)]" style={{ fontFamily: "var(--font-heading)" }}>
                  {s.value}
                </span>
                <span className="text-[var(--luxe-navy)]/60 text-[0.8rem] uppercase tracking-[1px] mt-2 text-center">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Neighborhood Cards ── */}
      <section className="py-20 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-[2.75rem] font-bold text-[var(--luxe-navy)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Explore Our Markets
            </h2>
            <div className="w-[60px] h-[3px] bg-[var(--luxe-gold)] mx-auto mt-4 mb-5" />
            <p className="text-gray-600 text-[1.1rem] max-w-[600px] mx-auto">
              Click any market below to see investment data, market analysis, and how Luxe serves that area.
            </p>
          </div>

          <div className="space-y-6">
            {neighborhoods.map((n) => (
              <Link key={n.slug} href={`/neighborhoods/${n.slug}`}>
                <div className="bg-white rounded-xl p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all cursor-pointer group">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Number + Name */}
                    <div className="lg:w-64 flex-shrink-0">
                      <span
                        className="text-[22px] font-bold text-[var(--luxe-gold)] block mb-1"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {n.num}
                      </span>
                      <h3
                        className="text-2xl font-bold text-[var(--luxe-navy)] group-hover:text-[var(--luxe-gold)] transition-colors mb-1"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {n.name}
                      </h3>
                      <p className="text-[var(--luxe-gold)] text-xs font-semibold tracking-wide">{n.sub}</p>
                    </div>

                    {/* Description */}
                    <div className="flex-1">
                      <p className="text-gray-600 leading-relaxed mb-4">{n.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {n.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-[var(--luxe-navy)]/8 text-[var(--luxe-navy)] text-xs font-semibold rounded-full"
                            style={{ background: "rgba(10,22,40,0.07)" }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="lg:w-56 flex-shrink-0">
                      <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                        {n.stats.map((s) => (
                          <div key={s.label} className="bg-[var(--luxe-light)] rounded-lg p-3 text-center lg:text-left">
                            <div
                              className="text-[var(--luxe-navy)] font-bold text-sm"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              {s.value}
                            </div>
                            <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden lg:flex items-center flex-shrink-0">
                      <span className="text-[var(--luxe-gold)] text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #0A1628 0%, #1A2F45 100%)", borderTop: "1px solid rgba(201,168,76,0.2)" }}>
        <div className="container mx-auto text-center">
          <h2
            className="text-[2.75rem] font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Don't See Your Area?
          </h2>
          <p className="text-white/60 text-[1.1rem] mb-10 max-w-[600px] mx-auto leading-relaxed">
            We manage properties throughout the St. Louis metro. Contact us to find out if we serve your
            neighborhood — chances are, we do.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <span className="inline-block px-10 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[#A88830] transition-colors rounded-sm">
                Contact Us
              </span>
            </Link>
            <Link href="/services">
              <span className="inline-block px-10 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                Our Services
              </span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
