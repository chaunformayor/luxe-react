import { useState } from "react";
import { Link } from "wouter";
import { CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const NEIGHBORHOOD_NAV = [
  { slug: "north-county", name: "North County" },
  { slug: "st-charles", name: "St. Charles County" },
  { slug: "kirkwood", name: "Kirkwood" },
  { slug: "webster-groves", name: "Webster Groves" },
  { slug: "south-city", name: "South City / County" },
];

export interface NeighborhoodStat { value: string; label: string; }
export interface NeighborhoodHighlight { title: string; desc: string; }
export interface NeighborhoodService { emoji: string; title: string; desc: string; }
export interface NeighborhoodFaq { q: string; a: string; }

export interface NeighborhoodData {
  slug: string;
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

const inputCls = "w-full border border-[rgba(27,58,92,0.12)] rounded-sm py-[9px] px-[11px] text-[13px] text-gray-800 focus:outline-none focus:border-[var(--luxe-gold)] bg-white transition-colors";
const labelCls = "block text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-1.5";

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

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div>
      {/* ── Fixed Left Sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[220px] flex-col overflow-y-auto z-40" style={{ background: "#122A45" }}>
        {/* Logo */}
        <div className="px-6 pt-[22px] pb-4">
          <Link href="/">
            <span className="text-[var(--luxe-gold)] font-bold text-sm tracking-[3px] cursor-pointer">LUXE.STL</span>
          </Link>
        </div>

        {/* Neighborhood Pages */}
        <div className="px-6 pb-4">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[3px] mb-3">Neighborhood Pages</p>
          {NEIGHBORHOOD_NAV.map((n) => (
            <Link key={n.slug} href={`/neighborhoods/${n.slug}`}>
              <span
                className={`block py-[10px] text-sm transition-colors cursor-pointer ${
                  data.slug === n.slug ? "text-[#E8C97A]" : "text-white/60 hover:text-white"
                }`}
              >
                {n.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="px-6 pt-4 pb-4 border-t border-white/10">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[3px] mb-3">Quick Links</p>
          <Link href="/"><span className="block py-[10px] text-sm text-white/60 hover:text-white transition-colors cursor-pointer">← Main Site</span></Link>
          <Link href="/services"><span className="block py-[10px] text-sm text-white/60 hover:text-white transition-colors cursor-pointer">Our Services</span></Link>
          <a href="#analysis" className="block py-[10px] text-sm text-white/60 hover:text-white transition-colors">Free Rental Analysis</a>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto px-6 py-4 border-t border-white/10">
          <p className="text-white/20 text-[10px] leading-5">Missouri Construction Service</p>
          <p className="text-white/20 text-[10px]">Midwest Investor Services</p>
        </div>
      </aside>

      {/* ── Main Content (shifted right on lg) ── */}
      <div className="lg:ml-[220px]">

        {/* ── Hero ── */}
        <section className="text-white pt-[136px] pb-12 px-6" style={{ background: "#122A45" }}>
          <div className="max-w-[900px]">
            {/* Breadcrumb */}
            <p className="text-white/40 text-xs mb-8 flex items-center gap-2">
              <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Luxe Property Solutions</span></Link>
              <span>›</span>
              <span>Property Management</span>
              <span>›</span>
              <span>{data.locationName}</span>
            </p>

            {/* Badge */}
            <div
              className="inline-block text-[var(--luxe-gold)] text-xs font-bold uppercase tracking-[2px] px-[14px] py-[5px] rounded-full mb-6"
              style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)" }}
            >
              {data.badge}
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {data.headline}
              <br />
              <span className="text-[var(--luxe-gold)]">{data.headlineGold}</span>
            </h1>

            <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-10">{data.subtitle}</p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#analysis"
                className="inline-block px-8 py-4 bg-[var(--luxe-gold)] text-[#122A45] font-bold text-sm uppercase tracking-wide hover:bg-[#A88830] transition-colors rounded-sm"
              >
                Get a Free Rental Analysis
              </a>
              <a
                href="tel:6362011239"
                className="inline-block px-8 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm"
              >
                Call 636-201-1239
              </a>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <div className="px-6 py-[22px]" style={{ background: "#1B3A5C" }}>
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            {data.stats.map((s, i) => (
              <div key={i} className="flex items-baseline gap-2.5">
                <span
                  className="text-[24px] font-bold text-[var(--luxe-gold)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {s.value}
                </span>
                <span className="text-[11px] text-white/40 tracking-[0.5px]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Content Grid: body sections + right sidebar cards ── */}
        <div className="flex flex-col lg:flex-row bg-[#F8F7F4]">

          {/* Left: body sections */}
          <div className="flex-1 py-14 px-6 min-w-0">

            {/* The Market */}
            <div className="mb-12">
              <span className="text-[10px] font-bold text-[var(--luxe-gold)] uppercase tracking-[4px] block mb-4">
                {data.marketLabel}
              </span>
              <h2 className="text-[20px] font-bold mb-5" style={{ fontFamily: "var(--font-heading)", color: "#122A45" }}>
                {data.marketTitle}
              </h2>
              <div className="space-y-4">
                {data.marketBody.map((p, i) => (
                  <p key={i} className="text-[15px] text-gray-600 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>

            {/* Investment Highlights */}
            <div className="mb-12">
              <span className="text-[10px] font-bold text-[var(--luxe-gold)] uppercase tracking-[4px] block mb-4">
                {data.highlightsLabel}
              </span>
              <h2 className="text-[20px] font-bold mb-5" style={{ fontFamily: "var(--font-heading)", color: "#122A45" }}>
                {data.highlightsTitle}
              </h2>
              <ul>
                {data.highlights.map((h, i) => (
                  <li key={i} className="py-[13px] border-b border-gray-200 text-[15px] text-gray-600 leading-relaxed">
                    <span className="font-semibold" style={{ color: "#122A45" }}>{h.title}</span>
                    {h.desc && <span> {h.desc}</span>}
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            {data.services && data.services.length > 0 && (
              <div className="mb-12">
                <span className="text-[10px] font-bold text-[var(--luxe-gold)] uppercase tracking-[4px] block mb-4">
                  {data.servicesLabel}
                </span>
                <h2 className="text-[20px] font-bold mb-5" style={{ fontFamily: "var(--font-heading)", color: "#122A45" }}>
                  {data.servicesTitle}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">
                  {data.services.map((s, i) => (
                    <div
                      key={i}
                      className="bg-white p-[18px] rounded-sm"
                      style={{ border: "1px solid rgba(27,58,92,0.08)" }}
                    >
                      <div className="text-[20px] mb-3">{s.emoji}</div>
                      <div
                        className="text-[14px] font-bold mb-1.5"
                        style={{ fontFamily: "var(--font-heading)", color: "#122A45" }}
                      >
                        {s.title}
                      </div>
                      <div className="text-[12px] text-gray-500 leading-relaxed">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            <div>
              <span className="text-[10px] font-bold text-[var(--luxe-gold)] uppercase tracking-[4px] block mb-4">
                {data.faqLabel}
              </span>
              <h2 className="text-[20px] font-bold mb-5" style={{ fontFamily: "var(--font-heading)", color: "#122A45" }}>
                {data.faqTitle}
              </h2>
              <div>
                {data.faqs.map((faq, i) => (
                  <div key={i} className="py-4 border-b border-gray-200">
                    <div className="text-[14px] font-semibold mb-2" style={{ color: "#122A45" }}>{faq.q}</div>
                    <div className="text-[13px] text-gray-500 leading-relaxed">{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: sidebar cards */}
          <div id="analysis" className="lg:w-[300px] xl:w-[320px] flex-shrink-0 py-14 px-6 space-y-4">

            {/* Form card */}
            <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(27,58,92,0.1)" }}>
              <div className="px-[22px] py-[18px]" style={{ background: "#1B3A5C" }}>
                <h3 className="text-white font-semibold text-[16px]" style={{ fontFamily: "var(--font-heading)" }}>
                  {data.formTitle}
                </h3>
                <p className="text-white/50 text-xs mt-1">{data.formSubtitle}</p>
              </div>
              <div className="bg-white p-[22px]">
                {success ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <p className="font-semibold text-sm" style={{ color: "#122A45" }}>
                      Request received! We'll be in touch within one business day.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className={labelCls}>Property Address</label>
                      <input required value={form.address} onChange={set("address")} placeholder="123 Main St..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Your Name</label>
                      <input required value={form.name} onChange={set("name")} placeholder="Full name" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input required type="email" value={form.email} onChange={set("email")} placeholder="your@email.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input value={form.phone} onChange={set("phone")} placeholder="(314) 000-0000" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>I'm a...</label>
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
                      className="w-full py-3 font-bold text-sm uppercase tracking-wide rounded-sm transition-colors disabled:opacity-50"
                      style={{ background: "var(--luxe-gold)", color: "#122A45" }}
                    >
                      {submitMutation.isPending ? "Sending..." : "Request Free Analysis"}
                    </button>
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-xs">{error}</p>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Luxe Ecosystem card */}
            <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(27,58,92,0.1)" }}>
              <div className="px-[22px] py-[18px]" style={{ background: "#1B3A5C" }}>
                <h3 className="text-white font-semibold text-[16px]" style={{ fontFamily: "var(--font-heading)" }}>
                  The Luxe Ecosystem
                </h3>
                <p className="text-white/50 text-xs mt-1">One call — three companies</p>
              </div>
              <div className="bg-white p-[22px] space-y-2">
                {[
                  { num: "01", name: "Midwest Investor Services", desc: "Deal sourcing · Underwriting" },
                  { num: "02", name: "Missouri Construction Service", desc: "Full rehab · GC services" },
                  { num: "03", name: "Luxe Property Solutions", desc: "Traditional & STR management" },
                ].map((c) => (
                  <div
                    key={c.num}
                    className="rounded-sm flex items-start gap-3"
                    style={{ background: "rgba(27,58,92,0.04)", padding: "11px 13px" }}
                  >
                    <span
                      className="text-[15px] font-bold text-[var(--luxe-gold)] flex-shrink-0"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {c.num}
                    </span>
                    <div>
                      <div className="text-[12px] font-semibold" style={{ color: "#122A45" }}>{c.name}</div>
                      <div className="text-[11px] text-gray-500">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact card */}
            <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(27,58,92,0.1)" }}>
              <div className="px-[22px] py-[18px]" style={{ background: "#1B3A5C" }}>
                <h3 className="text-white font-semibold text-[16px]" style={{ fontFamily: "var(--font-heading)" }}>
                  Contact Us
                </h3>
              </div>
              <div className="bg-white p-[22px] space-y-4">
                {[
                  { emoji: "📞", label: "Phone", value: "636-201-1239", href: "tel:6362011239" },
                  { emoji: "✉️", label: "Email", value: "info@luxestl.com", href: "mailto:info@luxestl.com" },
                  { emoji: "📍", label: "Based In", value: "555 Washington Ave, St. Louis, MO", href: undefined },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-3">
                    <span className="text-base mt-0.5">{c.emoji}</span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 mb-0.5">{c.label}</div>
                      {c.href ? (
                        <a href={c.href} className="text-[13px] hover:text-[var(--luxe-gold)] transition-colors" style={{ color: "#122A45" }}>
                          {c.value}
                        </a>
                      ) : (
                        <p className="text-[13px]" style={{ color: "#122A45" }}>{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
