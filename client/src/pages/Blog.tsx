import { Link } from "wouter";

const featured = {
  category: "Market Update",
  title: "Why St. Louis Is the Midwest's Best Market for Real Estate Investors in 2026",
  excerpt:
    "Rent growth outpacing the national average, inventory at historic lows, and cap rates that coastal markets haven't seen in a decade. Here's what the data says about St. Louis right now.",
  date: "May 8, 2026",
  readTime: "8 min read",
  href: "https://luxestl.com/blog/stl-real-estate-investing-2026.html",
};

const posts = [
  {
    category: "Property Management",
    title: "10 Questions to Ask Before Hiring a Property Manager in St. Louis",
    excerpt:
      "Most investors hire the wrong manager because they ask the wrong questions. Here's the exact checklist we recommend before signing any management agreement.",
    date: "April 22, 2026",
    href: "https://luxestl.com/blog/choosing-property-manager-stl.html",
  },
  {
    category: "Neighborhood Guide",
    title: "North County, St. Louis: The Investor's Guide to Florissant, Ferguson & Hazelwood",
    excerpt:
      "Cash flow potential, school districts, vacancy rates, and what we're actually seeing on the ground in North County's most active submarkets.",
    date: "April 10, 2026",
    href: "/neighborhoods/north-county",
  },
  {
    category: "Short-Term Rental",
    title: "STR vs. Long-Term Rental in St. Louis: Which Strategy Makes More Money?",
    excerpt:
      "We ran the numbers on identical properties managed both ways. The results might surprise you — and they depend heavily on neighborhood.",
    date: "March 28, 2026",
    href: "https://luxestl.com/blog/str-vs-ltr-stl.html",
  },
  {
    category: "Rehab & Renovation",
    title: "Which Renovations Actually Increase Rent in St. Louis? A Data-Driven Look",
    excerpt:
      "Not all upgrades are created equal. We break down ROI on kitchens, bathrooms, flooring, and more — backed by real numbers from our managed portfolio.",
    date: "March 14, 2026",
    href: "https://luxestl.com/blog/rehab-roi-stl.html",
  },
  {
    category: "Tenant Management",
    title: "The 5-Step Tenant Screening Process We Use on Every Single Application",
    excerpt:
      "A bad tenant can cost you $8,000–$15,000. Here's the exact process that keeps our eviction rate below 1% across the entire portfolio.",
    date: "February 27, 2026",
    href: "https://luxestl.com/blog/tenant-screening-guide.html",
  },
  {
    category: "Neighborhood Guide",
    title: "St. Charles County: Why O'Fallon & Wentzville Are STL's Fastest-Growing Rental Markets",
    excerpt:
      "Population growth, corporate relocations, and top-rated schools are driving demand that supply can't keep up with. Here's how investors are capitalizing.",
    date: "February 12, 2026",
    href: "/neighborhoods/st-charles",
  },
];

const categoryColor: Record<string, string> = {
  "Market Update": "bg-blue-100 text-blue-800",
  "Property Management": "bg-[var(--luxe-gold)]/20 text-[var(--luxe-navy)]",
  "Neighborhood Guide": "bg-green-100 text-green-800",
  "Short-Term Rental": "bg-purple-100 text-purple-800",
  "Rehab & Renovation": "bg-orange-100 text-orange-800",
  "Tenant Management": "bg-red-100 text-red-800",
};

export default function Blog() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <span>Blog</span>
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Insights &amp; Resources
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Market updates, investing tips, and property management insights for St. Louis real estate
            investors.
          </p>
        </div>
      </section>

      {/* ── Featured Post ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-8 flex items-center gap-3">
            <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
            Featured Article
          </p>
          <a
            href={featured.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              {/* Image placeholder */}
              <div className="h-64 lg:h-auto bg-[var(--luxe-navy)] flex items-center justify-center relative min-h-[280px]">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--luxe-navy)] to-[var(--luxe-navy)]/70" />
                <svg className="w-20 h-20 text-[var(--luxe-gold)]/20 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span
                  className="absolute bottom-6 left-6 text-xs font-bold uppercase tracking-[3px] text-[var(--luxe-gold)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  St. Louis Real Estate
                </span>
              </div>
              {/* Content */}
              <div className="p-10 lg:p-12 flex flex-col justify-center bg-white">
                <span className={`inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4 w-fit ${categoryColor[featured.category] || "bg-gray-100 text-gray-700"}`}>
                  {featured.category}
                </span>
                <h2
                  className="text-2xl md:text-3xl font-bold text-[var(--luxe-navy)] mb-4 group-hover:text-[var(--luxe-gold)] transition-colors leading-snug"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {featured.title}
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6 text-sm">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{featured.date}</span>
                    <span>·</span>
                    <span>{featured.readTime}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--luxe-gold)] group-hover:translate-x-1 transition-transform inline-block">
                    Read Article →
                  </span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* ── Post Grid ── */}
      <section className="py-8 pb-24 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const isInternal = post.href.startsWith("/");
              const cardCls = "group block bg-[var(--luxe-light)] rounded-xl overflow-hidden border border-gray-100 hover:border-[var(--luxe-gold)]/40 hover:shadow-lg transition-all";
              const cardInner = (
                <>
                  {/* Image placeholder */}
                  <div className="h-48 bg-[var(--luxe-navy)]/90 flex items-center justify-center">
                    <svg className="w-12 h-12 text-[var(--luxe-gold)]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  {/* Content */}
                  <div className="p-6">
                    <span className={`inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3 ${categoryColor[post.category] || "bg-gray-100 text-gray-700"}`}>
                      {post.category}
                    </span>
                    <h3
                      className="font-bold text-[var(--luxe-navy)] mb-3 leading-snug group-hover:text-[var(--luxe-gold)] transition-colors"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{post.date}</span>
                      <span className="text-[var(--luxe-gold)] font-semibold group-hover:translate-x-1 transition-transform inline-block">
                        Read →
                      </span>
                    </div>
                  </div>
                </>
              );
              return isInternal ? (
                <Link key={post.title} href={post.href} className={cardCls}>
                  {cardInner}
                </Link>
              ) : (
                <a
                  key={post.title}
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardCls}
                >
                  {cardInner}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <section className="py-24 bg-[var(--luxe-navy)]">
        <div className="container mx-auto text-center">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Get Market Updates in Your Inbox
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Monthly St. Louis market data, investment opportunities, and property management insights —
            no spam, no fluff.
          </p>
          <Link href="/contact">
            <span className="inline-block px-10 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
              Contact Us to Subscribe
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
