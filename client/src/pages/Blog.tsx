import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const categoryColor: Record<string, string> = {
  "Market Update": "bg-blue-100 text-blue-800",
  "Property Management": "bg-[var(--luxe-gold)]/20 text-[var(--luxe-navy)]",
  "Neighborhood Guide": "bg-green-100 text-green-800",
  "Short-Term Rental": "bg-purple-100 text-purple-800",
  "Rehab & Renovation": "bg-orange-100 text-orange-800",
  "Tenant Management": "bg-red-100 text-red-800",
};

type DbPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string | null;
  publishedAt: string | Date | null;
  createdAt: string | Date | null;
};

function formatDate(d: string | Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function NewsletterForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => { setStatus("success"); setForm({ firstName: "", lastName: "", email: "" }); },
    onError: () => setStatus("error"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    subscribe.mutate({ firstName: form.firstName, lastName: form.lastName, email: form.email });
  };

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-sm text-sm font-medium">
          ✓ You're subscribed! We'll be in touch.
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm rounded-sm focus:outline-none focus:border-[var(--luxe-gold)] focus:bg-white/15 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="First name"
          required
          value={form.firstName}
          onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
          className={inputCls}
        />
        <input
          type="text"
          placeholder="Last name"
          value={form.lastName}
          onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
          className={inputCls}
        />
      </div>
      <input
        type="email"
        placeholder="Email address"
        required
        value={form.email}
        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
        className={inputCls}
      />
      <button
        type="submit"
        disabled={subscribe.isPending}
        className="w-full py-3 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-[var(--luxe-gold)]/90 transition-colors disabled:opacity-60"
      >
        {subscribe.isPending ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-red-300 text-xs text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}

export default function Blog() {
  const { data: dbPosts = [], isLoading } = trpc.blog.getPosts.useQuery();

  const featured = (dbPosts as DbPost[])[0] ?? null;
  const grid = (dbPosts as DbPost[]).slice(1);

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

      {/* ── Loading ── */}
      {isLoading && (
        <section className="py-24 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--luxe-gold)] border-t-transparent rounded-full animate-spin" />
        </section>
      )}

      {/* ── Featured Post ── */}
      {featured && (
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="container mx-auto">
            <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-8 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
              Latest Article
            </p>
            <Link href={`/blog/${featured.slug}`} className="block group">
              <div className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                <div className="h-64 lg:h-auto min-h-[280px] bg-[var(--luxe-navy)] relative flex items-center justify-center overflow-hidden">
                  {featured.coverImageUrl ? (
                    <img src={featured.coverImageUrl} alt={featured.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--luxe-navy)] to-[var(--luxe-navy)]/70" />
                      <svg className="w-20 h-20 text-[var(--luxe-gold)]/20 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </>
                  )}
                </div>
                <div className="p-10 lg:p-12 flex flex-col justify-center bg-white">
                  {featured.category && (
                    <span className={`inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4 w-fit ${categoryColor[featured.category] || "bg-gray-100 text-gray-700"}`}>
                      {featured.category}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--luxe-navy)] mb-4 leading-snug group-hover:text-[var(--luxe-gold)] transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
                    {featured.title}
                  </h2>
                  {featured.excerpt && <p className="text-gray-500 leading-relaxed mb-6 text-sm">{featured.excerpt}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{formatDate(featured.publishedAt ?? featured.createdAt)}</span>
                    <span className="text-sm font-semibold text-[var(--luxe-gold)] group-hover:translate-x-1 transition-transform inline-block">Read Article →</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── Post Grid ── */}
      {grid.length > 0 && (
        <section className="py-16 pb-24 bg-white">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {grid.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block bg-[var(--luxe-light)] rounded-xl overflow-hidden border border-gray-100 hover:border-[var(--luxe-gold)]/40 hover:shadow-lg transition-all">
                  <div className="h-48 bg-[var(--luxe-navy)]/90 flex items-center justify-center overflow-hidden relative">
                    {post.coverImageUrl ? (
                      <img src={post.coverImageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    ) : (
                      <svg className="w-12 h-12 text-[var(--luxe-gold)]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    )}
                  </div>
                  <div className="p-6">
                    {post.category && (
                      <span className={`inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3 ${categoryColor[post.category] || "bg-gray-100 text-gray-700"}`}>
                        {post.category}
                      </span>
                    )}
                    <h3 className="font-bold text-[var(--luxe-navy)] mb-3 leading-snug group-hover:text-[var(--luxe-gold)] transition-colors" style={{ fontFamily: "var(--font-heading)" }}>{post.title}</h3>
                    {post.excerpt && <p className="text-gray-500 text-sm leading-relaxed mb-5">{post.excerpt}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{formatDate(post.publishedAt ?? post.createdAt)}</span>
                      <span className="text-xs font-semibold text-[var(--luxe-gold)] group-hover:translate-x-1 transition-transform inline-block">Read →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
