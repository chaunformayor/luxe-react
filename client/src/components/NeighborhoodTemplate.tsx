import { useState } from "react";
import { Link } from "wouter";
import { CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export interface NeighborhoodStat {
  value: string;
  label: string;
}

export interface NeighborhoodHighlight {
  title: string;
  desc: string;
}

export interface NeighborhoodService {
  emoji: string;
  title: string;
  desc: string;
}

export interface NeighborhoodFaq {
  q: string;
  a: string;
}

export interface NeighborhoodData {
  badge: string;
  headline: string;
  headlineGold: string;
  subtitle: string;
  stats: NeighborhoodStat[];
  marketLabel: string;
  marketTitle: string;
  marketBody: string[];
  highlightsLabel: string;
  highlightsTitle: string;
  highlights: NeighborhoodHighlight[];
  servicesLabel?: string;
  servicesTitle?: string;
  services?: NeighborhoodService[];
  faqLabel: string;
  faqTitle: string;
  faqs: NeighborhoodFaq[];
  formTitle: string;
  formSubtitle: string;
  locationName: string;
}

export default function NeighborhoodTemplate({ data }: { data: NeighborhoodData }) {
  const [form, setForm] = useState({ address: "", name: "", email: "", phone: "", role: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = trpc.contact.submitForm.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setForm({ address: "", name: "", email: "", phone: "", role: "" });
      setError(null);
    },
    onError: (e) => setError(e.message || "Failed to submit. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    submitMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      message: `[Rental Analysis Request — ${data.locationName}]\n\nProperty Address: ${form.address}\nI am a: ${form.role}`,
    });
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--luxe-gold)] focus:ring-1 focus:ring-[var(--luxe-gold)] bg-white transition-colors";
  const labelCls = "block text-xs font-bold uppercase tracking-[2px] text-gray-500 mb-2";

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white pt-8 pb-0">
        <div className="container mx-auto">
          {/* Breadcrumb */}
          <p className="text-white/40 text-xs mb-8 flex items-center gap-2">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Luxe Property Solutions</span></Link>
            <span>›</span>
            <span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Property Management</span>
            <span>›</span>
            <span>{data.locationName}</span>
          </p>

          {/* Badge */}
          <div className="inline-block border border-[var(--luxe-gold)]/50 text-[var(--luxe-gold)] text-xs font-bold uppercase tracking-[3px] px-4 py-2 rounded-full mb-6">
            {data.badge}
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            {data.headline}
            <br />
            <span className="text-[var(--luxe-gold)]">{data.headlineGold}</span>
          </h1>

          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-10">{data.subtitle}</p>

          <div className="flex flex-wrap gap-4 mb-12">
            <a href="#analysis" className="inline-block px-8 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-bold text-sm uppercase tracking-wide hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
              Get a Free Rental Analysis
            </a>
            <a href="tel:6362011239" className="inline-block px-8 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
              Call 636-201-1239
            </a>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/10">
            {data.stats.map((s, i) => (
              <div key={i} className="py-8 px-4 text-center border-r border-white/10 last:border-r-0">
                <div className="text-3xl md:text-4xl font-bold text-[var(--luxe-gold)] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                  {s.value}
                </div>
                <div className="text-white/50 text-xs uppercase tracking-widest leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Market ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4 flex items-center gap-3">
            <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
            {data.marketLabel}
          </p>
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--luxe-navy)] mb-8" style={{ fontFamily: "var(--font-heading)" }}>
                {data.marketTitle}
              </h2>
              <div className="space-y-5 text-gray-600 leading-relaxed">
                {data.marketBody.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            {/* Investment Highlights */}
            <div>
              <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
                {data.highlightsLabel}
              </p>
              <h3 className="text-2xl font-bold text-[var(--luxe-navy)] mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                {data.highlightsTitle}
              </h3>
              <ul className="space-y-4">
                {data.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--luxe-gold)] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[var(--luxe-navy)] text-sm">{h.title}</span>
                      {h.desc && <span className="text-gray-600 text-sm"> {h.desc}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services (optional) ── */}
      {data.services && data.services.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto">
            <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
              {data.servicesLabel}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--luxe-navy)] mb-12" style={{ fontFamily: "var(--font-heading)" }}>
              {data.servicesTitle}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.services.map((s, i) => (
                <div key={i} className="p-8 rounded-xl border border-gray-100 hover:border-[var(--luxe-gold)]/40 hover:shadow-md transition-all">
                  <div className="text-3xl mb-4">{s.emoji}</div>
                  <h3 className="font-bold text-[var(--luxe-navy)] mb-2" style={{ fontFamily: "var(--font-heading)" }}>{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto max-w-3xl">
          <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4 flex items-center gap-3">
            <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
            {data.faqLabel}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--luxe-navy)] mb-10" style={{ fontFamily: "var(--font-heading)" }}>
            {data.faqTitle}
          </h2>
          <div className="space-y-3">
            {data.faqs.map((faq, i) => (
              <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden bg-white">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-[var(--luxe-navy)] hover:bg-[var(--luxe-light)] transition-colors list-none text-sm">
                  <span className="pr-4 leading-snug">{faq.q}</span>
                  <span className="text-[var(--luxe-gold)] text-2xl font-light flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rental Analysis Form ── */}
      <section id="analysis" className="py-24 bg-[var(--luxe-navy)]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                {data.formTitle}
              </h2>
              <p className="text-white/60 text-lg mb-8">{data.formSubtitle}</p>

              {/* Luxe Ecosystem */}
              <div className="mt-10 space-y-3">
                <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[3px] uppercase mb-6">The Luxe Ecosystem</p>
                {[
                  { num: "01", name: "Midwest Investor Services", desc: "Deal sourcing · Underwriting · Investment consulting" },
                  { num: "02", name: "Missouri Construction Service", desc: "Full rehab · GC services · 25+ years experience" },
                  { num: "03", name: "Luxe Property Solutions", desc: "Traditional & STR management" },
                ].map((c) => (
                  <div key={c.num} className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xl font-bold text-[var(--luxe-gold)]" style={{ fontFamily: "var(--font-heading)" }}>{c.num}</span>
                    <div>
                      <div className="font-semibold text-white text-sm">{c.name}</div>
                      <div className="text-white/40 text-xs">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[var(--luxe-navy)] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    Request Received!
                  </h3>
                  <p className="text-gray-500 text-sm">We'll be in touch within one business day with your free rental analysis.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className={labelCls}>Property Address</label>
                    <input required value={form.address} onChange={set("address")} placeholder="123 Main St, Florissant, MO" className={inputCls} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Your Name</label>
                      <input required value={form.name} onChange={set("name")} placeholder="Full name" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input value={form.phone} onChange={set("phone")} placeholder="(314) 000-0000" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input required type="email" value={form.email} onChange={set("email")} placeholder="your@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>I'm A...</label>
                    <select required value={form.role} onChange={set("role")} className={inputCls}>
                      <option value="">Select one...</option>
                      <option value="Out-of-state investor">Out-of-state investor</option>
                      <option value="Local landlord">Local landlord</option>
                      <option value="Considering purchasing">Considering purchasing</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full py-4 bg-[var(--luxe-navy)] text-white font-bold text-sm uppercase tracking-wide rounded-lg hover:bg-[var(--luxe-navy)]/90 transition-colors disabled:opacity-50"
                  >
                    {submitMutation.isPending ? "Sending..." : "Request Free Analysis"}
                  </button>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Contact strip */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 border-t border-white/10 pt-12">
            {[
              { emoji: "📞", label: "PHONE", value: "636-201-1239", href: "tel:6362011239" },
              { emoji: "✉️", label: "EMAIL", value: "info@luxestl.com", href: "mailto:info@luxestl.com" },
              { emoji: "📍", label: "BASED IN", value: "555 Washington Ave, St. Louis, MO", href: undefined },
            ].map((c) => (
              <div key={c.label} className="text-center">
                <div className="text-2xl mb-2">{c.emoji}</div>
                <div className="text-[var(--luxe-gold)] text-xs font-bold uppercase tracking-[3px] mb-1">{c.label}</div>
                {c.href ? (
                  <a href={c.href} className="text-white/70 text-sm hover:text-[var(--luxe-gold)] transition-colors">{c.value}</a>
                ) : (
                  <p className="text-white/70 text-sm">{c.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
