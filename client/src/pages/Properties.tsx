import { useState } from "react";
import { Link } from "wouter";

const allProperties = [
  {
    id: 1,
    price: "$1,850",
    period: "/mo",
    type: "rent",
    name: "Modern Loft – Central West End",
    address: "St. Louis, MO 63108",
    neighborhood: "Central West End",
    beds: 2,
    baths: 2,
    sqft: "1,100",
    tag: "For Rent",
    tagColor: "bg-[var(--luxe-gold)] text-[var(--luxe-navy)]",
    section8: true,
  },
  {
    id: 2,
    price: "$325,000",
    period: "",
    type: "sale",
    name: "Elegant Townhome – Clayton",
    address: "Clayton, MO 63105",
    neighborhood: "Clayton",
    beds: 3,
    baths: 2.5,
    sqft: "2,200",
    tag: "For Sale",
    tagColor: "bg-[var(--luxe-navy)] text-white",
    section8: false,
  },
  {
    id: 3,
    price: "$2,400",
    period: "/mo",
    type: "rent",
    name: "Luxury Condo – Ladue",
    address: "Ladue, MO 63124",
    neighborhood: "Ladue",
    beds: 3,
    baths: 2,
    sqft: "1,650",
    tag: "For Rent",
    tagColor: "bg-[var(--luxe-gold)] text-[var(--luxe-navy)]",
    section8: true,
  },
];

type Filter = "all" | "rent" | "sale";

export default function Properties() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = allProperties.filter((p) =>
    filter === "all" ? true : p.type === filter
  );

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/">
              <span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span>
            </Link>
            <span className="mx-2">/</span>
            <span>Properties</span>
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Properties
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Discover our handpicked selection of premium properties available for lease and sale across the
            greater St. Louis area.
          </p>
        </div>
      </section>

      {/* ── Listings ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">

          {/* Section 8 badge */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-5 py-3 rounded-lg text-sm font-semibold mb-10 w-fit">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            All eligible properties accept Housing Choice Vouchers (Section 8) —{" "}
            <Link href="/vouchers">
              <span className="underline cursor-pointer hover:text-green-900">Learn more</span>
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-0 mb-10">
            {(["all", "rent", "sale"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-7 py-3 text-sm font-semibold border transition-all capitalize ${
                  filter === f
                    ? "bg-[var(--luxe-navy)] text-white border-[var(--luxe-navy)]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[var(--luxe-navy)] border-l-0 first:border-l"
                }`}
                style={f !== "all" ? { borderLeft: "none" } : {}}
              >
                {f === "all" ? "All Properties" : f === "rent" ? "For Rent" : "For Sale"}
              </button>
            ))}
            <span className="ml-auto text-gray-400 text-sm">{filtered.length} propert{filtered.length === 1 ? "y" : "ies"}</span>
          </div>

          {/* Property cards */}
          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
                >
                  {/* Image placeholder */}
                  <div className="relative h-56 bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-14 h-14 text-gray-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    {/* Tag */}
                    <span className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${p.tagColor}`}>
                      {p.tag}
                    </span>
                    {/* Section 8 badge */}
                    {p.section8 && (
                      <span className="absolute top-3 right-3 text-xs font-semibold bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
                        HCV OK
                      </span>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-6">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span
                        className="text-2xl font-bold text-[var(--luxe-navy)]"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {p.price}
                      </span>
                      {p.period && <span className="text-gray-400 text-sm">{p.period}</span>}
                    </div>

                    <h3
                      className="font-bold text-[var(--luxe-navy)] mb-1 group-hover:text-[var(--luxe-gold)] transition-colors"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {p.name}
                    </h3>

                    <p className="text-gray-400 text-sm flex items-center gap-1 mb-5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {p.address}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 pb-5 mb-5 border-b border-gray-100">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {p.beds} Beds
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        {p.baths} Baths
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        {p.sqft} sqft
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Link href="/contact">
                        <span className="flex-1 block text-center py-2.5 px-4 border border-gray-200 text-[var(--luxe-navy)] text-sm font-semibold rounded-lg cursor-pointer hover:border-[var(--luxe-gold)] transition-colors">
                          Inquire
                        </span>
                      </Link>
                      {p.type === "rent" && (
                        <Link href="/apply">
                          <span className="flex-1 block text-center py-2.5 px-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] text-sm font-semibold rounded-lg cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors">
                            Apply Now
                          </span>
                        </Link>
                      )}
                      {p.type === "sale" && (
                        <Link href="/contact">
                          <span className="flex-1 block text-center py-2.5 px-4 bg-[var(--luxe-navy)] text-white text-sm font-semibold rounded-lg cursor-pointer hover:bg-[var(--luxe-navy)]/90 transition-colors">
                            Schedule Tour
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No properties match your current filter.</p>
              <button onClick={() => setFilter("all")} className="mt-4 text-[var(--luxe-gold)] underline text-sm">
                View all properties
              </button>
            </div>
          )}

          {/* More coming soon */}
          <div className="mt-12 p-8 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-2">More Properties Coming Soon</p>
            <p className="text-gray-500 text-sm">
              New listings are added regularly.{" "}
              <Link href="/contact">
                <span className="text-[var(--luxe-gold)] underline cursor-pointer">Contact us</span>
              </Link>{" "}
              to be notified when new properties become available.
            </p>
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
            Ready to Apply?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Complete our online rental application today. A $75 fee covers application processing and a
            comprehensive background &amp; credit check.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/apply">
              <span className="inline-block px-10 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Apply Online Now
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
