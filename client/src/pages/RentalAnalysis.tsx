import { useState } from "react";
import { Link } from "wouter";
import { CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  street: string;
  city: string;
  zip: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  currentRent: string;
  occupied: string;
  yearBuilt: string;
  goal: string;
  notes: string;
}

const empty: FormData = {
  firstName: "", lastName: "", email: "", phone: "", company: "",
  street: "", city: "", zip: "",
  propertyType: "", bedrooms: "", bathrooms: "", sqft: "", currentRent: "", occupied: "", yearBuilt: "",
  goal: "", notes: "",
};

export default function RentalAnalysis() {
  const [form, setForm] = useState<FormData>(empty);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = trpc.contact.submitForm.useMutation({
    onSuccess: () => { setSuccess(true); setForm(empty); setError(null); },
    onError: (e) => setError(e.message || "Something went wrong. Please try again."),
  });

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = `${form.firstName} ${form.lastName}`.trim();
    const address = `${form.street}, ${form.city}, MO ${form.zip}`;
    const lines = [
      `[Rental Analysis Request]`,
      ``,
      `Property Address: ${address}`,
      `Property Type: ${form.propertyType}`,
      `Bedrooms: ${form.bedrooms}  |  Bathrooms: ${form.bathrooms}`,
      form.sqft ? `Square Footage: ${form.sqft}` : null,
      form.currentRent ? `Current Rent: $${form.currentRent}/mo` : null,
      `Currently Occupied: ${form.occupied || "Not specified"}`,
      form.yearBuilt ? `Year Built: ${form.yearBuilt}` : null,
      form.company ? `Company: ${form.company}` : null,
      ``,
      `Goal: ${form.goal}`,
      form.notes ? `Additional Notes: ${form.notes}` : null,
    ].filter(Boolean).join("\n");

    submit.mutate({
      name,
      email: form.email,
      phone: form.phone || undefined,
      propertyType: form.propertyType || undefined,
      message: lines,
    });
  };

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--luxe-gold)] focus:ring-1 focus:ring-[var(--luxe-gold)] transition-colors bg-white";
  const labelCls = "block text-sm font-semibold text-[var(--luxe-navy)] mb-2";
  const sectionHead = "text-xs font-bold uppercase tracking-[3px] text-[var(--luxe-gold)] mb-4 mt-2";

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <span>Free Rental Analysis</span>
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            Free Rental Analysis
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Find out exactly what your St. Louis property can earn. We'll review your details and deliver a
            custom market analysis — no obligation, no fluff.
          </p>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            {success ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-[var(--luxe-navy)] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                  Request Received!
                </h2>
                <p className="text-gray-500 mb-8">
                  We'll review your property details and reach out within one business day with your rental analysis.
                </p>
                <Link href="/">
                  <span className="inline-block px-8 py-3 bg-[var(--luxe-navy)] text-white font-semibold text-sm uppercase tracking-wide rounded-lg cursor-pointer hover:bg-[var(--luxe-navy)]/90 transition-colors">
                    Back to Home
                  </span>
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-[var(--luxe-navy)] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Tell Us About Your Property
                </h2>
                <p className="text-gray-500 text-sm mb-8">Fields marked <span className="text-[var(--luxe-gold)]">*</span> are required.</p>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* ── Owner Info ── */}
                  <p className={sectionHead}>Your Information</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>First Name <span className="text-[var(--luxe-gold)]">*</span></label>
                      <input required className={inputCls} placeholder="First name" value={form.firstName} onChange={set("firstName")} />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name <span className="text-[var(--luxe-gold)]">*</span></label>
                      <input required className={inputCls} placeholder="Last name" value={form.lastName} onChange={set("lastName")} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Email <span className="text-[var(--luxe-gold)]">*</span></label>
                      <input required type="email" className={inputCls} placeholder="your@email.com" value={form.email} onChange={set("email")} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input type="tel" className={inputCls} placeholder="(314) 000-0000" value={form.phone} onChange={set("phone")} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Company Name <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input className={inputCls} placeholder="Business or LLC name" value={form.company} onChange={set("company")} />
                  </div>

                  {/* ── Property Info ── */}
                  <p className={sectionHead}>Property Information</p>

                  <div>
                    <label className={labelCls}>Street Address <span className="text-[var(--luxe-gold)]">*</span></label>
                    <input required className={inputCls} placeholder="123 Main St" value={form.street} onChange={set("street")} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>City <span className="text-[var(--luxe-gold)]">*</span></label>
                      <input required className={inputCls} placeholder="St. Louis" value={form.city} onChange={set("city")} />
                    </div>
                    <div>
                      <label className={labelCls}>ZIP Code <span className="text-[var(--luxe-gold)]">*</span></label>
                      <input required className={inputCls} placeholder="63101" value={form.zip} onChange={set("zip")} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Property Type <span className="text-[var(--luxe-gold)]">*</span></label>
                    <select required className={inputCls} value={form.propertyType} onChange={set("propertyType")}>
                      <option value="">Select type...</option>
                      <option value="Single Family">Single Family Home</option>
                      <option value="Multi-Family">Multi-Family (2–4 units)</option>
                      <option value="Condo / Townhome">Condo / Townhome</option>
                      <option value="Large Multifamily">Large Multifamily (5+ units)</option>
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Bedrooms <span className="text-[var(--luxe-gold)]">*</span></label>
                      <select required className={inputCls} value={form.bedrooms} onChange={set("bedrooms")}>
                        <option value="">Select...</option>
                        <option>Studio</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5+</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Bathrooms <span className="text-[var(--luxe-gold)]">*</span></label>
                      <select required className={inputCls} value={form.bathrooms} onChange={set("bathrooms")}>
                        <option value="">Select...</option>
                        <option>1</option>
                        <option>1.5</option>
                        <option>2</option>
                        <option>2.5</option>
                        <option>3+</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Sq Ft <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input type="number" className={inputCls} placeholder="1,200" value={form.sqft} onChange={set("sqft")} />
                    </div>
                    <div>
                      <label className={labelCls}>Current Rent <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input type="number" className={inputCls} placeholder="$1,400" value={form.currentRent} onChange={set("currentRent")} />
                    </div>
                    <div>
                      <label className={labelCls}>Year Built <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input type="number" className={inputCls} placeholder="1998" value={form.yearBuilt} onChange={set("yearBuilt")} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Is the property currently occupied? <span className="text-[var(--luxe-gold)]">*</span></label>
                    <select required className={inputCls} value={form.occupied} onChange={set("occupied")}>
                      <option value="">Select...</option>
                      <option value="Yes — tenant in place">Yes — tenant in place</option>
                      <option value="Yes — owner occupied">Yes — owner occupied</option>
                      <option value="No — vacant">No — vacant</option>
                    </select>
                  </div>

                  {/* ── Situation ── */}
                  <p className={sectionHead}>Your Situation</p>

                  <div>
                    <label className={labelCls}>What's your primary goal? <span className="text-[var(--luxe-gold)]">*</span></label>
                    <select required className={inputCls} value={form.goal} onChange={set("goal")}>
                      <option value="">Select...</option>
                      <option value="Get a max rent estimate">Get a max rent estimate</option>
                      <option value="Considering hiring a property manager">Considering hiring a property manager</option>
                      <option value="Evaluating whether to sell or rent">Evaluating whether to sell or rent</option>
                      <option value="Just researching the market">Just researching the market</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea
                      className={inputCls}
                      rows={4}
                      placeholder="Anything else we should know about the property or your situation..."
                      value={form.notes}
                      onChange={set("notes")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submit.isPending}
                    className="w-full py-4 bg-[var(--luxe-navy)] hover:bg-[var(--luxe-navy)]/90 text-white font-semibold text-sm uppercase tracking-widest rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submit.isPending ? "Submitting..." : "Request My Free Analysis"}
                  </button>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
