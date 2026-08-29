import { useState, useRef } from "react";
import { Link } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ChevronRight, ChevronLeft, User, Home, Briefcase, Users, CreditCard, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const APPLICATION_FEE = 75;

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Residence", icon: Home },
  { label: "Employment", icon: Briefcase },
  { label: "References", icon: Users },
  { label: "Payment", icon: CreditCard },
];

type CoApplicant = { firstName: string; lastName: string; email: string; phone: string; dateOfBirth: string };

type FormData = {
  // Property & preferences
  propertyId: string;
  desiredMoveInDate: string;
  leaseTermPreference: string;

  // Personal
  firstName: string; lastName: string; email: string; phone: string; dateOfBirth: string; ssn: string;

  // Co-applicant
  hasCoApplicant: boolean;
  coApplicant: CoApplicant;

  // Residence
  currentAddress: string; currentCity: string; currentState: string; currentZip: string;
  currentLengthOfResidence: string; currentLandlordName: string; currentLandlordPhone: string;
  currentMonthlyRent: string; reasonForLeaving: string;

  // Employment
  employmentStatus: "employed" | "self_employed" | "unemployed" | "retired" | "student";
  employerName: string; employerPhone: string; employerAddress: string; jobTitle: string;
  monthsEmployed: string; monthlyIncome: string; additionalIncome: string; additionalIncomeSource: string;

  // Documents
  idDocumentBase64: string;
  incomeDocumentBase64: string;

  // References
  ref1Name: string; ref1Phone: string; ref1Relationship: string;
  ref2Name: string; ref2Phone: string; ref2Relationship: string;

  // Additional
  hasPets: boolean; petDetails: string;
  hasEviction: boolean; evictionDetails: string;
  hasCriminalHistory: boolean; criminalDetails: string;
  hasBankruptcy: boolean; bankruptcyDetails: string;

  // Voucher
  hasVoucher: boolean; voucherType: "section8_hcv" | "vash" | "other" | "";
  phaName: string; phaPhone: string; phaEmail: string;
  voucherNumber: string; voucherAmount: string; voucherBedrooms: string; voucherExpirationDate: string;
};

const defaultCoApplicant: CoApplicant = { firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "" };

const defaultForm: FormData = {
  propertyId: "", desiredMoveInDate: "", leaseTermPreference: "",
  firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", ssn: "",
  hasCoApplicant: false, coApplicant: defaultCoApplicant,
  currentAddress: "", currentCity: "", currentState: "MO", currentZip: "",
  currentLengthOfResidence: "", currentLandlordName: "", currentLandlordPhone: "",
  currentMonthlyRent: "", reasonForLeaving: "",
  employmentStatus: "employed", employerName: "", employerPhone: "", employerAddress: "",
  jobTitle: "", monthsEmployed: "", monthlyIncome: "", additionalIncome: "", additionalIncomeSource: "",
  idDocumentBase64: "", incomeDocumentBase64: "",
  ref1Name: "", ref1Phone: "", ref1Relationship: "",
  ref2Name: "", ref2Phone: "", ref2Relationship: "",
  hasPets: false, petDetails: "",
  hasEviction: false, evictionDetails: "",
  hasCriminalHistory: false, criminalDetails: "",
  hasBankruptcy: false, bankruptcyDetails: "",
  hasVoucher: false, voucherType: "", phaName: "", phaPhone: "", phaEmail: "",
  voucherNumber: "", voucherAmount: "", voucherBedrooms: "", voucherExpirationDate: "",
};

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold mb-1.5 text-gray-700">
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function StepIndicator({ step, current }: { step: number; current: number }) {
  const done = step < current;
  const active = step === current;
  const Icon = STEPS[step].icon;
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done ? "bg-[var(--luxe-gold)] border-[var(--luxe-gold)]" : active ? "bg-[var(--luxe-navy)] border-[var(--luxe-navy)]" : "bg-white border-gray-300"}`}>
        {done ? <CheckCircle className="w-5 h-5 text-[var(--luxe-navy)]" /> : <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-400"}`} />}
      </div>
      <span className={`text-xs mt-1 font-medium hidden md:block ${active ? "text-[var(--luxe-navy)]" : done ? "text-[var(--luxe-gold)]" : "text-gray-400"}`}>{STEPS[step].label}</span>
    </div>
  );
}

// ── File upload helper ─────────────────────────────────────────────────────────
function compressImageToBase64(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function FileUploadField({ label, value, onChange, note }: { label: string; value: string; onChange: (b64: string) => void; note?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [filename, setFilename] = useState("");

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (file.type.startsWith("image/")) {
        const b64 = await compressImageToBase64(file);
        onChange(b64);
      } else {
        // PDF — read as base64
        const reader = new FileReader();
        reader.onload = () => onChange(reader.result as string);
        reader.readAsDataURL(file);
      }
      setFilename(file.name);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div
        onClick={() => ref.current?.click()}
        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${value ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-[var(--luxe-gold)] bg-gray-50"}`}
      >
        {value ? (
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{filename} — uploaded</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <Upload className="w-6 h-6" />
            <span className="text-sm">{uploading ? "Processing..." : "Click to upload (JPG, PNG, or PDF)"}</span>
          </div>
        )}
      </div>
      {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
      <input ref={ref} type="file" accept="image/*,.pdf" className="hidden" onChange={handle} />
    </div>
  );
}

// ── Payment Step ───────────────────────────────────────────────────────────────
function PaymentStep({ clientSecret, applicationId, onSuccess, onError }: { clientSecret: string | null; applicationId: string; onSuccess: () => void; onError: (msg: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const confirm = trpc.application.confirmPayment.useMutation({ onSuccess, onError: (e) => onError(e.message) });

  const handlePay = async () => {
    setProcessing(true);
    try {
      if (stripe && elements && clientSecret) {
        const card = elements.getElement(CardElement);
        if (!card) throw new Error("Card element not found");
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
        if (error) throw new Error(error.message);
        if (paymentIntent?.status !== "succeeded") throw new Error("Payment did not succeed");
      }
      await confirm.mutateAsync({ applicationId });
    } catch (err: any) {
      onError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--luxe-navy)]/5 border border-[var(--luxe-navy)]/20 rounded-lg p-5">
        <h3 className="font-bold text-[var(--luxe-navy)] mb-3">Application Fee — Per Adult Applicant</h3>
        <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Rental Application Processing</span><span className="font-semibold">$50.00</span></div>
        <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Background & Credit Check</span><span className="font-semibold">$25.00</span></div>
        <div className="flex justify-between py-3 font-bold text-lg"><span>Total Due</span><span className="text-[var(--luxe-gold)]">${APPLICATION_FEE}.00</span></div>
        <p className="text-xs text-gray-500 mt-1">Non-refundable. Each adult (18+) on the lease must submit a separate application and fee.</p>
      </div>
      {stripePromise && clientSecret ? (
        <div className="space-y-4">
          <div>
            <Label required>Card Information</Label>
            <div className="border rounded-md p-3 bg-white">
              <CardElement options={{ style: { base: { fontSize: "16px", color: "#1a2744", "::placeholder": { color: "#9ca3af" } } } }} />
            </div>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1"><span>🔒</span> Encrypted and secure via Stripe.</p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <strong>Demo Mode:</strong> Stripe is not configured. Click below to submit without a real charge.
        </div>
      )}
      <Button onClick={handlePay} disabled={processing || confirm.isPending} className="w-full bg-[var(--luxe-gold)] hover:bg-[var(--luxe-gold)]/90 text-[var(--luxe-navy)] font-bold text-lg py-6">
        {processing || confirm.isPending ? "Processing..." : stripePromise ? `Pay $${APPLICATION_FEE}.00 & Submit` : "Submit Application"}
      </Button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Apply() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: properties = [] } = trpc.properties.getAll.useQuery();

  const initiate = trpc.application.initiate.useMutation({
    onSuccess: (data) => { setApplicationId(data.applicationId); setClientSecret(data.clientSecret); setStep(4); },
    onError: (e) => setError(e.message),
  });

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setCoApp = (field: keyof CoApplicant) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, coApplicant: { ...prev.coApplicant, [field]: e.target.value } }));

  const goNext = () => {
    setError(null);
    if (step === 3) {
      initiate.mutate({
        propertyId: form.propertyId || undefined,
        desiredMoveInDate: form.desiredMoveInDate || undefined,
        leaseTermPreference: form.leaseTermPreference || undefined,
        firstName: form.firstName, lastName: form.lastName, email: form.email,
        phone: form.phone, dateOfBirth: form.dateOfBirth, ssn: form.ssn || undefined,
        coApplicantInfo: form.hasCoApplicant && form.coApplicant.firstName ? form.coApplicant : undefined,
        currentAddress: form.currentAddress, currentCity: form.currentCity,
        currentState: form.currentState, currentZip: form.currentZip,
        currentLengthOfResidence: form.currentLengthOfResidence || undefined,
        currentLandlordName: form.currentLandlordName || undefined,
        currentLandlordPhone: form.currentLandlordPhone || undefined,
        currentMonthlyRent: form.currentMonthlyRent || undefined,
        reasonForLeaving: form.reasonForLeaving || undefined,
        employmentStatus: form.employmentStatus,
        employerName: form.employerName || undefined, employerPhone: form.employerPhone || undefined,
        employerAddress: form.employerAddress || undefined, jobTitle: form.jobTitle || undefined,
        monthsEmployed: form.monthsEmployed ? parseInt(form.monthsEmployed) : undefined,
        monthlyIncome: form.monthlyIncome || undefined,
        additionalIncome: form.additionalIncome || undefined,
        additionalIncomeSource: form.additionalIncomeSource || undefined,
        idDocumentBase64: form.idDocumentBase64 || undefined,
        incomeDocumentBase64: form.incomeDocumentBase64 || undefined,
        references: [
          { name: form.ref1Name, phone: form.ref1Phone, relationship: form.ref1Relationship },
          { name: form.ref2Name, phone: form.ref2Phone, relationship: form.ref2Relationship },
        ].filter((r) => r.name),
        hasPets: form.hasPets, petDetails: form.petDetails || undefined,
        hasEviction: form.hasEviction, evictionDetails: form.evictionDetails || undefined,
        hasCriminalHistory: form.hasCriminalHistory, criminalDetails: form.criminalDetails || undefined,
        hasBankruptcy: form.hasBankruptcy, bankruptcyDetails: form.bankruptcyDetails || undefined,
        hasVoucher: form.hasVoucher,
        voucherType: form.hasVoucher && form.voucherType ? form.voucherType as "section8_hcv" | "vash" | "other" : undefined,
        phaName: form.phaName || undefined, phaPhone: form.phaPhone || undefined,
        phaEmail: form.phaEmail || undefined, voucherNumber: form.voucherNumber || undefined,
        voucherAmount: form.voucherAmount || undefined, voucherBedrooms: form.voucherBedrooms || undefined,
        voucherExpirationDate: form.voucherExpirationDate || undefined,
      });
    } else {
      setStep((s) => s + 1);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
          <div className="container mx-auto">
            <p className="text-white/40 text-sm mb-4">
              <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer">Home</span></Link>
              <span className="mx-2">/</span><span>Apply</span>
            </p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>Application Received</h1>
          </div>
        </section>
        <section className="py-24 bg-[var(--luxe-light)] min-h-[50vh] flex items-center">
          <div className="container mx-auto">
            <div className="max-w-lg mx-auto text-center bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--luxe-navy)] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Application Submitted!</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Thank you for applying. We've received your application and payment. Our team will review and contact you within 2–3 business days.
              </p>
              {applicationId && <p className="text-sm text-gray-400 mb-8">Application ID: <span className="font-mono font-semibold text-gray-600">{applicationId}</span></p>}
              <Link href="/"><span className="inline-block px-8 py-3 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold rounded-lg hover:bg-[var(--luxe-gold)]/90 transition-colors cursor-pointer">Return to Home</span></Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const paymentStep = <PaymentStep clientSecret={clientSecret} applicationId={applicationId!} onSuccess={() => setSubmitted(true)} onError={(msg) => setError(msg)} />;
  const wrappedPaymentStep = stripePromise && clientSecret ? <Elements stripe={stripePromise} options={{ clientSecret }}>{paymentStep}</Elements> : paymentStep;

  const inputCls = "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--luxe-gold)] focus:border-[var(--luxe-gold)]";

  return (
    <Layout>
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer">Home</span></Link>
            <span className="mx-2">/</span><span>Apply</span>
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>Rental Application</h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Complete the form below to apply. A ${APPLICATION_FEE} non-refundable fee per adult covers processing and a comprehensive background &amp; credit check.
          </p>
        </div>
      </section>

      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-4">
          <div className="flex flex-wrap gap-5 text-sm text-gray-500">
            {["01 Personal Info", "02 Current Residence", "03 Employment & Income", "04 References & Disclosures", `05 Pay $${APPLICATION_FEE} Fee`].map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--luxe-gold)]">{s.split(" ")[0]}</span>
                <span>{s.split(" ").slice(1).join(" ")}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="py-12 bg-[var(--luxe-light)] min-h-screen">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-10 px-4">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center flex-1">
                <StepIndicator step={i} current={step} />
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-[var(--luxe-gold)]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[var(--luxe-navy)] mb-6">Step {step + 1}: {STEPS[step].label}</h2>

              {/* ── Step 0: Personal Info ── */}
              {step === 0 && (
                <div className="space-y-6">
                  {/* Property & Preferences */}
                  <div className="bg-[var(--luxe-light)] rounded-xl p-5 space-y-4">
                    <p className="text-xs font-bold text-[var(--luxe-gold)] uppercase tracking-[3px]">Property & Preferences</p>
                    <div>
                      <Label>Which property are you applying for?</Label>
                      <select className={inputCls} value={form.propertyId} onChange={set("propertyId")}>
                        <option value="">Select a property (or leave blank)</option>
                        {(properties as any[]).filter((p: any) => p.type === "Rent").map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name} — {p.city}, {p.state}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Desired Move-In Date</Label>
                        <input type="date" className={inputCls} value={form.desiredMoveInDate} onChange={set("desiredMoveInDate")} />
                      </div>
                      <div>
                        <Label>Preferred Lease Term</Label>
                        <select className={inputCls} value={form.leaseTermPreference} onChange={set("leaseTermPreference")}>
                          <option value="">Select...</option>
                          <option value="12-month">12-Month Standard</option>
                          <option value="month-to-month">Month-to-Month</option>
                          <option value="mid-term (3-6 months)">Mid-Term (3–6 months)</option>
                          <option value="short-term (30-90 days)">Short-Term (30–90 days)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Personal */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label required>First Name</Label><Input value={form.firstName} onChange={set("firstName")} placeholder="John" /></div>
                    <div><Label required>Last Name</Label><Input value={form.lastName} onChange={set("lastName")} placeholder="Smith" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label required>Email</Label><Input type="email" value={form.email} onChange={set("email")} placeholder="john@example.com" /></div>
                    <div><Label required>Phone</Label><Input value={form.phone} onChange={set("phone")} placeholder="(314) 000-0000" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label required>Date of Birth</Label><input type="date" className={inputCls} value={form.dateOfBirth} onChange={set("dateOfBirth")} /></div>
                    <div><Label>SSN (last 4 digits)</Label><Input value={form.ssn} onChange={set("ssn")} placeholder="****" maxLength={4} /></div>
                  </div>

                  {/* Co-applicant */}
                  <div className="border rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="hasCoApplicant" checked={form.hasCoApplicant}
                        onChange={(e) => setForm((p) => ({ ...p, hasCoApplicant: e.target.checked }))} className="w-4 h-4" />
                      <label htmlFor="hasCoApplicant" className="font-semibold text-gray-700 cursor-pointer">
                        I have a co-applicant (spouse, roommate, or other adult on the lease)
                      </label>
                    </div>
                    {form.hasCoApplicant && (
                      <div className="space-y-4 pt-3 border-t">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                          Each adult (18+) must submit a separate application and pay the $75 fee. Enter their basic info here — they'll need to apply independently.
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div><Label>Co-Applicant First Name</Label><Input value={form.coApplicant.firstName} onChange={setCoApp("firstName")} placeholder="Jane" /></div>
                          <div><Label>Co-Applicant Last Name</Label><Input value={form.coApplicant.lastName} onChange={setCoApp("lastName")} placeholder="Smith" /></div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div><Label>Email</Label><Input type="email" value={form.coApplicant.email} onChange={setCoApp("email")} placeholder="jane@example.com" /></div>
                          <div><Label>Phone</Label><Input value={form.coApplicant.phone} onChange={setCoApp("phone")} placeholder="(314) 000-0000" /></div>
                        </div>
                        <div><Label>Date of Birth</Label><input type="date" className={inputCls} value={form.coApplicant.dateOfBirth} onChange={setCoApp("dateOfBirth")} /></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 1: Residence ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div><Label required>Street Address</Label><Input value={form.currentAddress} onChange={set("currentAddress")} placeholder="123 Main St" /></div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div><Label required>City</Label><Input value={form.currentCity} onChange={set("currentCity")} placeholder="St. Louis" /></div>
                    <div><Label required>State</Label><Input value={form.currentState} onChange={set("currentState")} placeholder="MO" maxLength={2} /></div>
                    <div><Label required>ZIP</Label><Input value={form.currentZip} onChange={set("currentZip")} placeholder="63101" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Length of Residence</Label><Input value={form.currentLengthOfResidence} onChange={set("currentLengthOfResidence")} placeholder="2 years" /></div>
                    <div><Label>Current Monthly Rent</Label><Input value={form.currentMonthlyRent} onChange={set("currentMonthlyRent")} placeholder="$1,200" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Landlord Name</Label><Input value={form.currentLandlordName} onChange={set("currentLandlordName")} placeholder="Jane Doe" /></div>
                    <div><Label>Landlord Phone</Label><Input value={form.currentLandlordPhone} onChange={set("currentLandlordPhone")} placeholder="(314) 000-0000" /></div>
                  </div>
                  <div><Label>Reason for Leaving</Label><Textarea value={form.reasonForLeaving} onChange={set("reasonForLeaving")} placeholder="Describe why you are moving..." rows={3} /></div>
                </div>
              )}

              {/* ── Step 2: Employment ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <Label required>Employment Status</Label>
                    <select className={inputCls} value={form.employmentStatus} onChange={set("employmentStatus")}>
                      <option value="employed">Employed (Full-time or Part-time)</option>
                      <option value="self_employed">Self-Employed</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="retired">Retired</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                  {(form.employmentStatus === "employed" || form.employmentStatus === "self_employed") && (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label>Employer / Business Name</Label><Input value={form.employerName} onChange={set("employerName")} placeholder="Acme Corp" /></div>
                        <div><Label>Job Title</Label><Input value={form.jobTitle} onChange={set("jobTitle")} placeholder="Manager" /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label>Employer Phone</Label><Input value={form.employerPhone} onChange={set("employerPhone")} placeholder="(314) 000-0000" /></div>
                        <div><Label>Months Employed</Label><Input type="number" value={form.monthsEmployed} onChange={set("monthsEmployed")} placeholder="24" /></div>
                      </div>
                      <div><Label>Employer Address</Label><Input value={form.employerAddress} onChange={set("employerAddress")} placeholder="456 Business Ave" /></div>
                    </>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Gross Monthly Income</Label><Input value={form.monthlyIncome} onChange={set("monthlyIncome")} placeholder="$4,500" /></div>
                    <div><Label>Additional Monthly Income</Label><Input value={form.additionalIncome} onChange={set("additionalIncome")} placeholder="$500" /></div>
                  </div>
                  {form.additionalIncome && (
                    <div><Label>Additional Income Source</Label><Input value={form.additionalIncomeSource} onChange={set("additionalIncomeSource")} placeholder="Freelance, rental income, etc." /></div>
                  )}

                  {/* Document uploads */}
                  <div className="border-t pt-5 space-y-4">
                    <p className="text-xs font-bold text-[var(--luxe-gold)] uppercase tracking-[3px]">Supporting Documents <span className="text-gray-400 font-normal normal-case tracking-normal">(optional but recommended)</span></p>
                    <FileUploadField
                      label="Government-Issued Photo ID"
                      value={form.idDocumentBase64}
                      onChange={(b64) => setForm((p) => ({ ...p, idDocumentBase64: b64 }))}
                      note="Driver's license, passport, or state ID. JPG, PNG, or PDF."
                    />
                    <FileUploadField
                      label="Proof of Income"
                      value={form.incomeDocumentBase64}
                      onChange={(b64) => setForm((p) => ({ ...p, incomeDocumentBase64: b64 }))}
                      note="Recent pay stub, bank statement, or benefit letter. JPG, PNG, or PDF."
                    />
                  </div>
                </div>
              )}

              {/* ── Step 3: References & Disclosures ── */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* References */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Personal References <span className="text-gray-400 font-normal text-sm">(at least 1)</span></h3>
                    <div className="space-y-4">
                      {[
                        { n: "ref1Name", ph: "ref1Phone", r: "ref1Relationship", label: "Reference 1" },
                        { n: "ref2Name", ph: "ref2Phone", r: "ref2Relationship", label: "Reference 2" },
                      ].map((ref) => (
                        <div key={ref.label} className="border rounded-lg p-4 space-y-3">
                          <p className="font-medium text-sm text-gray-600">{ref.label}</p>
                          <div className="grid sm:grid-cols-3 gap-3">
                            <div><Label>Name</Label><Input value={form[ref.n as keyof FormData] as string} onChange={set(ref.n as keyof FormData)} placeholder="Jane Smith" /></div>
                            <div><Label>Phone</Label><Input value={form[ref.ph as keyof FormData] as string} onChange={set(ref.ph as keyof FormData)} placeholder="(314) 000-0000" /></div>
                            <div><Label>Relationship</Label><Input value={form[ref.r as keyof FormData] as string} onChange={set(ref.r as keyof FormData)} placeholder="Colleague" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disclosure questions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Disclosures</h3>
                    {[
                      { flag: "hasPets", detail: "petDetails", label: "Do you have pets?", placeholder: "Type, breed, approximate weight..." },
                      { flag: "hasEviction", detail: "evictionDetails", label: "Have you ever been evicted?", placeholder: "Explain circumstances..." },
                      { flag: "hasCriminalHistory", detail: "criminalDetails", label: "Have you ever been convicted of a felony?", placeholder: "Provide details..." },
                      { flag: "hasBankruptcy", detail: "bankruptcyDetails", label: "Have you filed for bankruptcy in the last 7 years?", placeholder: "Provide details..." },
                    ].map((q) => (
                      <div key={q.flag} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <input type="checkbox" id={q.flag} checked={form[q.flag as keyof FormData] as boolean}
                            onChange={(e) => setForm((p) => ({ ...p, [q.flag]: e.target.checked }))} className="w-4 h-4" />
                          <label htmlFor={q.flag} className="font-medium text-gray-700 cursor-pointer text-sm">{q.label}</label>
                        </div>
                        {form[q.flag as keyof FormData] && (
                          <Textarea value={form[q.detail as keyof FormData] as string} onChange={set(q.detail as keyof FormData)} placeholder={q.placeholder} rows={2} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Voucher */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700">Housing Assistance Voucher</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <input type="checkbox" id="hasVoucher" checked={form.hasVoucher}
                          onChange={(e) => setForm((p) => ({ ...p, hasVoucher: e.target.checked }))} className="w-4 h-4" />
                        <label htmlFor="hasVoucher" className="font-medium text-gray-700 cursor-pointer text-sm">
                          I have a Housing Choice Voucher (Section 8, VASH, or other)
                        </label>
                      </div>
                      {form.hasVoucher && (
                        <div className="space-y-4 mt-4 pt-4 border-t">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <Label required>Voucher Type</Label>
                              <select className={inputCls} value={form.voucherType} onChange={set("voucherType")}>
                                <option value="">Select type...</option>
                                <option value="section8_hcv">Section 8 / Housing Choice Voucher</option>
                                <option value="vash">VASH (Veterans Affairs)</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <Label>Voucher Bedroom Size</Label>
                              <select className={inputCls} value={form.voucherBedrooms} onChange={set("voucherBedrooms")}>
                                <option value="">Select...</option>
                                <option value="0">Studio</option>
                                <option value="1">1 Bedroom</option>
                                <option value="2">2 Bedrooms</option>
                                <option value="3">3 Bedrooms</option>
                                <option value="4">4+ Bedrooms</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div><Label>PHA Name</Label><Input value={form.phaName} onChange={set("phaName")} placeholder="St. Louis Housing Authority" /></div>
                            <div><Label>PHA Phone</Label><Input value={form.phaPhone} onChange={set("phaPhone")} placeholder="(314) 000-0000" /></div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div><Label>PHA Email</Label><Input type="email" value={form.phaEmail} onChange={set("phaEmail")} placeholder="caseworker@pha.gov" /></div>
                            <div><Label>Voucher Number</Label><Input value={form.voucherNumber} onChange={set("voucherNumber")} placeholder="As shown on voucher" /></div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div><Label>Monthly HAP Amount</Label><Input value={form.voucherAmount} onChange={set("voucherAmount")} placeholder="$1,100" /></div>
                            <div><Label>Expiration Date</Label><input type="date" className={inputCls} value={form.voucherExpirationDate} onChange={set("voucherExpirationDate")} /></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 4: Payment ── */}
              {step === 4 && applicationId && wrappedPaymentStep}

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Navigation */}
              {step < 4 && (
                <div className="flex justify-between mt-8 pt-6 border-t">
                  {step > 0 ? (
                    <Button variant="outline" onClick={() => setStep((s) => s - 1)}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
                  ) : <div />}
                  <Button onClick={goNext} disabled={initiate.isPending} className="bg-[var(--luxe-navy)] hover:bg-[var(--luxe-navy)]/90 text-white">
                    {initiate.isPending ? "Saving..." : step === 3 ? "Continue to Payment" : "Next"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
