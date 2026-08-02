import { useState } from "react";
import { Link } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  User,
  Home,
  Briefcase,
  Users,
  CreditCard,
} from "lucide-react";
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

type FormData = {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;

  // Residence
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  currentLengthOfResidence: string;
  currentLandlordName: string;
  currentLandlordPhone: string;
  currentMonthlyRent: string;
  reasonForLeaving: string;

  // Employment
  employmentStatus: "employed" | "self_employed" | "unemployed" | "retired" | "student";
  employerName: string;
  employerPhone: string;
  employerAddress: string;
  jobTitle: string;
  monthsEmployed: string;
  monthlyIncome: string;
  additionalIncome: string;
  additionalIncomeSource: string;

  // References
  ref1Name: string;
  ref1Phone: string;
  ref1Relationship: string;
  ref2Name: string;
  ref2Phone: string;
  ref2Relationship: string;

  // Additional
  hasPets: boolean;
  petDetails: string;
  hasEviction: boolean;
  evictionDetails: string;
  hasCriminalHistory: boolean;
  criminalDetails: string;
  hasBankruptcy: boolean;
  bankruptcyDetails: string;

  // Voucher
  hasVoucher: boolean;
  voucherType: "section8_hcv" | "vash" | "other" | "";
  phaName: string;
  phaPhone: string;
  phaEmail: string;
  voucherNumber: string;
  voucherAmount: string;
  voucherBedrooms: string;
  voucherExpirationDate: string;
};

const defaultForm: FormData = {
  firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", ssn: "",
  currentAddress: "", currentCity: "", currentState: "", currentZip: "",
  currentLengthOfResidence: "", currentLandlordName: "", currentLandlordPhone: "",
  currentMonthlyRent: "", reasonForLeaving: "",
  employmentStatus: "employed", employerName: "", employerPhone: "",
  employerAddress: "", jobTitle: "", monthsEmployed: "", monthlyIncome: "",
  additionalIncome: "", additionalIncomeSource: "",
  ref1Name: "", ref1Phone: "", ref1Relationship: "",
  ref2Name: "", ref2Phone: "", ref2Relationship: "",
  hasPets: false, petDetails: "",
  hasEviction: false, evictionDetails: "",
  hasCriminalHistory: false, criminalDetails: "",
  hasBankruptcy: false, bankruptcyDetails: "",
  hasVoucher: false, voucherType: "", phaName: "", phaPhone: "", phaEmail: "",
  voucherNumber: "", voucherAmount: "", voucherBedrooms: "", voucherExpirationDate: "",
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold mb-1.5 text-gray-700">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function StepIndicator({ step, current }: { step: number; current: number }) {
  const isDone = step < current;
  const isActive = step === current;
  const StepIcon = STEPS[step].icon;
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
          isDone
            ? "bg-[var(--luxe-gold)] border-[var(--luxe-gold)]"
            : isActive
            ? "bg-[var(--luxe-navy)] border-[var(--luxe-navy)]"
            : "bg-white border-gray-300"
        }`}
      >
        {isDone ? (
          <CheckCircle className="w-5 h-5 text-[var(--luxe-navy)]" />
        ) : (
          <StepIcon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
        )}
      </div>
      <span
        className={`text-xs mt-1 font-medium hidden md:block ${
          isActive ? "text-[var(--luxe-navy)]" : isDone ? "text-[var(--luxe-gold)]" : "text-gray-400"
        }`}
      >
        {STEPS[step].label}
      </span>
    </div>
  );
}

// ─── Payment Step (inner component so Stripe hooks work) ──────────────────────
function PaymentStep({
  clientSecret,
  applicationId,
  onSuccess,
  onError,
}: {
  clientSecret: string | null;
  applicationId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = stripePromise ? useStripe() : null;
  const elements = stripePromise ? useElements() : null;
  const [processing, setProcessing] = useState(false);

  const confirmMutation = trpc.application.confirmPayment.useMutation({
    onSuccess: onSuccess,
    onError: (e) => onError(e.message),
  });

  const handlePay = async () => {
    setProcessing(true);
    try {
      if (stripe && elements && clientSecret) {
        const cardEl = elements.getElement(CardElement);
        if (!cardEl) throw new Error("Card element not found");
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardEl },
        });
        if (error) throw new Error(error.message);
        if (paymentIntent?.status !== "succeeded") throw new Error("Payment did not succeed");
      }
      // With or without Stripe, confirm on the server
      await confirmMutation.mutateAsync({ applicationId });
    } catch (err: any) {
      onError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--luxe-navy)]/5 border border-[var(--luxe-navy)]/20 rounded-lg p-5">
        <h3 className="font-bold text-[var(--luxe-navy)] mb-2">Application Fee Summary</h3>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Rental Application Processing</span>
          <span className="font-semibold">$50.00</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Background & Credit Check</span>
          <span className="font-semibold">$25.00</span>
        </div>
        <div className="flex justify-between py-3 font-bold text-lg">
          <span>Total Due</span>
          <span className="text-[var(--luxe-gold)]">${APPLICATION_FEE}.00</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This fee is non-refundable and covers the cost of processing your application and running a comprehensive background and credit check.
        </p>
      </div>

      {stripePromise && clientSecret ? (
        <div className="space-y-4">
          <div>
            <FieldLabel required>Card Information</FieldLabel>
            <div className="border rounded-md p-3 bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#1a2744",
                      "::placeholder": { color: "#9ca3af" },
                    },
                  },
                }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span>🔒</span> Your payment information is encrypted and secure via Stripe.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <strong>Demo Mode:</strong> Stripe is not configured. Click "Submit Application" to complete your application without a real payment charge.
        </div>
      )}

      <Button
        onClick={handlePay}
        disabled={processing || confirmMutation.isPending}
        className="w-full bg-[var(--luxe-gold)] hover:bg-[var(--luxe-gold)]/90 text-[var(--luxe-navy)] font-bold text-lg py-6"
      >
        {processing || confirmMutation.isPending
          ? "Processing..."
          : stripePromise
          ? `Pay $${APPLICATION_FEE}.00 & Submit Application`
          : "Submit Application"}
      </Button>
    </div>
  );
}

// ─── Main Apply Page ──────────────────────────────────────────────────────────
export default function Apply() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateMutation = trpc.application.initiate.useMutation({
    onSuccess: (data) => {
      setApplicationId(data.applicationId);
      setClientSecret(data.clientSecret);
      setStep(4);
    },
    onError: (e) => setError(e.message),
  });

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    setError(null);
    if (step === 3) {
      // Submit form data and get payment intent
      initiateMutation.mutate({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        ssn: form.ssn || undefined,
        currentAddress: form.currentAddress,
        currentCity: form.currentCity,
        currentState: form.currentState,
        currentZip: form.currentZip,
        currentLengthOfResidence: form.currentLengthOfResidence || undefined,
        currentLandlordName: form.currentLandlordName || undefined,
        currentLandlordPhone: form.currentLandlordPhone || undefined,
        currentMonthlyRent: form.currentMonthlyRent || undefined,
        reasonForLeaving: form.reasonForLeaving || undefined,
        employmentStatus: form.employmentStatus,
        employerName: form.employerName || undefined,
        employerPhone: form.employerPhone || undefined,
        employerAddress: form.employerAddress || undefined,
        jobTitle: form.jobTitle || undefined,
        monthsEmployed: form.monthsEmployed ? parseInt(form.monthsEmployed) : undefined,
        monthlyIncome: form.monthlyIncome || undefined,
        additionalIncome: form.additionalIncome || undefined,
        additionalIncomeSource: form.additionalIncomeSource || undefined,
        references: [
          { name: form.ref1Name, phone: form.ref1Phone, relationship: form.ref1Relationship },
          { name: form.ref2Name, phone: form.ref2Phone, relationship: form.ref2Relationship },
        ].filter((r) => r.name),
        hasPets: form.hasPets,
        petDetails: form.petDetails || undefined,
        hasEviction: form.hasEviction,
        evictionDetails: form.evictionDetails || undefined,
        hasCriminalHistory: form.hasCriminalHistory,
        criminalDetails: form.criminalDetails || undefined,
        hasBankruptcy: form.hasBankruptcy,
        bankruptcyDetails: form.bankruptcyDetails || undefined,
        hasVoucher: form.hasVoucher,
        voucherType: form.hasVoucher && form.voucherType ? form.voucherType as "section8_hcv" | "vash" | "other" : undefined,
        phaName: form.phaName || undefined,
        phaPhone: form.phaPhone || undefined,
        phaEmail: form.phaEmail || undefined,
        voucherNumber: form.voucherNumber || undefined,
        voucherAmount: form.voucherAmount || undefined,
        voucherBedrooms: form.voucherBedrooms || undefined,
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
              <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
              <span className="mx-2">/</span>
              <span>Apply</span>
            </p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              Application Received
            </h1>
          </div>
        </section>
        <section className="py-24 bg-[var(--luxe-light)] min-h-[50vh] flex items-center">
          <div className="container mx-auto">
            <div className="max-w-lg mx-auto text-center bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--luxe-navy)] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                Application Submitted!
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Thank you for applying. We have received your rental application and payment. Our team will review your application and contact you within 2–3 business days.
              </p>
              {applicationId && (
                <p className="text-sm text-gray-400 mb-8">
                  Application ID: <span className="font-mono font-semibold text-gray-600">{applicationId}</span>
                </p>
              )}
              <Link href="/">
                <span className="inline-block px-8 py-3 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold rounded-lg hover:bg-[var(--luxe-gold)]/90 transition-colors cursor-pointer">
                  Return to Home
                </span>
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const paymentStep = (
    <PaymentStep
      clientSecret={clientSecret}
      applicationId={applicationId!}
      onSuccess={() => setSubmitted(true)}
      onError={(msg) => setError(msg)}
    />
  );

  const wrappedPaymentStep = stripePromise && clientSecret ? (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {paymentStep}
    </Elements>
  ) : paymentStep;

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <span>Apply</span>
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            Rental Application
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Complete the form below to apply for one of our rental properties. A ${APPLICATION_FEE} non-refundable application fee covers processing and a comprehensive background &amp; credit check.
          </p>
        </div>
      </section>

      {/* ── Process Steps Info Bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-5">
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            {[
              { num: "01", label: "Personal Info" },
              { num: "02", label: "Current Residence" },
              { num: "03", label: "Employment & Income" },
              { num: "04", label: "References & Disclosures" },
              { num: "05", label: `Pay $${APPLICATION_FEE} Fee` },
            ].map((s) => (
              <span key={s.num} className="flex items-center gap-2">
                <span className="font-bold text-[var(--luxe-gold)]">{s.num}</span>
                <span>{s.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="py-12 bg-[var(--luxe-light)] min-h-screen">
        <div className="container mx-auto max-w-3xl">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-10 px-4">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center flex-1">
                <StepIndicator step={i} current={step} />
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-[var(--luxe-gold)]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[var(--luxe-navy)] mb-6">
                Step {step + 1}: {STEPS[step].label}
              </h2>

              {/* Step 0 — Personal Info */}
              {step === 0 && (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel required>First Name</FieldLabel>
                      <Input value={form.firstName} onChange={set("firstName")} placeholder="John" />
                    </div>
                    <div>
                      <FieldLabel required>Last Name</FieldLabel>
                      <Input value={form.lastName} onChange={set("lastName")} placeholder="Smith" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel required>Email Address</FieldLabel>
                      <Input type="email" value={form.email} onChange={set("email")} placeholder="john@example.com" />
                    </div>
                    <div>
                      <FieldLabel required>Phone Number</FieldLabel>
                      <Input value={form.phone} onChange={set("phone")} placeholder="(555) 123-4567" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel required>Date of Birth</FieldLabel>
                      <Input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
                    </div>
                    <div>
                      <FieldLabel>Social Security (last 4 digits)</FieldLabel>
                      <Input value={form.ssn} onChange={set("ssn")} placeholder="****" maxLength={4} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 — Current Residence */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <FieldLabel required>Current Street Address</FieldLabel>
                    <Input value={form.currentAddress} onChange={set("currentAddress")} placeholder="123 Main St, Apt 4B" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <FieldLabel required>City</FieldLabel>
                      <Input value={form.currentCity} onChange={set("currentCity")} placeholder="St. Louis" />
                    </div>
                    <div>
                      <FieldLabel required>State</FieldLabel>
                      <Input value={form.currentState} onChange={set("currentState")} placeholder="MO" maxLength={2} />
                    </div>
                    <div>
                      <FieldLabel required>ZIP Code</FieldLabel>
                      <Input value={form.currentZip} onChange={set("currentZip")} placeholder="63101" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Length of Residence</FieldLabel>
                      <Input value={form.currentLengthOfResidence} onChange={set("currentLengthOfResidence")} placeholder="2 years" />
                    </div>
                    <div>
                      <FieldLabel>Current Monthly Rent</FieldLabel>
                      <Input value={form.currentMonthlyRent} onChange={set("currentMonthlyRent")} placeholder="$1,200" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Current Landlord Name</FieldLabel>
                      <Input value={form.currentLandlordName} onChange={set("currentLandlordName")} placeholder="Jane Doe" />
                    </div>
                    <div>
                      <FieldLabel>Landlord Phone</FieldLabel>
                      <Input value={form.currentLandlordPhone} onChange={set("currentLandlordPhone")} placeholder="(555) 987-6543" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Reason for Leaving</FieldLabel>
                    <Textarea value={form.reasonForLeaving} onChange={set("reasonForLeaving")} placeholder="Describe why you are moving..." rows={3} />
                  </div>
                </div>
              )}

              {/* Step 2 — Employment */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <FieldLabel required>Employment Status</FieldLabel>
                    <select className="w-full px-3 py-2 border rounded-md" value={form.employmentStatus} onChange={set("employmentStatus")}>
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
                        <div>
                          <FieldLabel>Employer / Business Name</FieldLabel>
                          <Input value={form.employerName} onChange={set("employerName")} placeholder="Acme Corp" />
                        </div>
                        <div>
                          <FieldLabel>Job Title</FieldLabel>
                          <Input value={form.jobTitle} onChange={set("jobTitle")} placeholder="Software Engineer" />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Employer Phone</FieldLabel>
                          <Input value={form.employerPhone} onChange={set("employerPhone")} placeholder="(555) 234-5678" />
                        </div>
                        <div>
                          <FieldLabel>Months Employed</FieldLabel>
                          <Input type="number" value={form.monthsEmployed} onChange={set("monthsEmployed")} placeholder="24" />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Employer Address</FieldLabel>
                        <Input value={form.employerAddress} onChange={set("employerAddress")} placeholder="456 Business Ave, Suite 100" />
                      </div>
                    </>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Gross Monthly Income</FieldLabel>
                      <Input value={form.monthlyIncome} onChange={set("monthlyIncome")} placeholder="$4,500" />
                    </div>
                    <div>
                      <FieldLabel>Additional Monthly Income</FieldLabel>
                      <Input value={form.additionalIncome} onChange={set("additionalIncome")} placeholder="$500" />
                    </div>
                  </div>
                  {form.additionalIncome && (
                    <div>
                      <FieldLabel>Additional Income Source</FieldLabel>
                      <Input value={form.additionalIncomeSource} onChange={set("additionalIncomeSource")} placeholder="Freelance, rental income, etc." />
                    </div>
                  )}
                </div>
              )}

              {/* Step 3 — References & Additional Questions */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Personal References (at least 1)</h3>
                    <div className="space-y-4">
                      {[
                        { name: "ref1Name", phone: "ref1Phone", rel: "ref1Relationship", label: "Reference 1" },
                        { name: "ref2Name", phone: "ref2Phone", rel: "ref2Relationship", label: "Reference 2" },
                      ].map((ref) => (
                        <div key={ref.label} className="border rounded-lg p-4 space-y-3">
                          <p className="font-medium text-sm text-gray-600">{ref.label}</p>
                          <div className="grid sm:grid-cols-3 gap-3">
                            <div>
                              <FieldLabel>Name</FieldLabel>
                              <Input value={form[ref.name as keyof FormData] as string} onChange={set(ref.name as keyof FormData)} placeholder="Jane Smith" />
                            </div>
                            <div>
                              <FieldLabel>Phone</FieldLabel>
                              <Input value={form[ref.phone as keyof FormData] as string} onChange={set(ref.phone as keyof FormData)} placeholder="(555) 000-0000" />
                            </div>
                            <div>
                              <FieldLabel>Relationship</FieldLabel>
                              <Input value={form[ref.rel as keyof FormData] as string} onChange={set(ref.rel as keyof FormData)} placeholder="Colleague" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Additional Information</h3>

                    {[
                      { flag: "hasPets", detail: "petDetails", label: "Do you have pets?", placeholder: "Describe type, breed, weight..." },
                      { flag: "hasEviction", detail: "evictionDetails", label: "Have you ever been evicted?", placeholder: "Explain circumstances..." },
                      { flag: "hasCriminalHistory", detail: "criminalDetails", label: "Have you ever been convicted of a felony?", placeholder: "Provide details..." },
                      { flag: "hasBankruptcy", detail: "bankruptcyDetails", label: "Have you filed for bankruptcy in the last 7 years?", placeholder: "Provide details..." },
                    ].map((q) => (
                      <div key={q.flag} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            id={q.flag}
                            checked={form[q.flag as keyof FormData] as boolean}
                            onChange={(e) => setForm((prev) => ({ ...prev, [q.flag]: e.target.checked }))}
                            className="w-4 h-4"
                          />
                          <label htmlFor={q.flag} className="font-medium text-gray-700 cursor-pointer">{q.label}</label>
                        </div>
                        {form[q.flag as keyof FormData] && (
                          <Textarea
                            value={form[q.detail as keyof FormData] as string}
                            onChange={set(q.detail as keyof FormData)}
                            placeholder={q.placeholder}
                            rows={2}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Voucher Section */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700">Housing Assistance Voucher</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          id="hasVoucher"
                          checked={form.hasVoucher}
                          onChange={(e) => setForm((prev) => ({ ...prev, hasVoucher: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <label htmlFor="hasVoucher" className="font-medium text-gray-700 cursor-pointer">
                          I have a Housing Choice Voucher (Section 8, VASH, or other)
                        </label>
                      </div>
                      {form.hasVoucher && (
                        <div className="space-y-4 mt-4 pt-4 border-t">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <FieldLabel required>Voucher Type</FieldLabel>
                              <select className="w-full px-3 py-2 border rounded-md" value={form.voucherType} onChange={set("voucherType")}>
                                <option value="">Select type...</option>
                                <option value="section8_hcv">Section 8 / Housing Choice Voucher (HCV)</option>
                                <option value="vash">VASH (Veterans Affairs Supportive Housing)</option>
                                <option value="other">Other Housing Assistance</option>
                              </select>
                            </div>
                            <div>
                              <FieldLabel>Voucher Bedroom Size</FieldLabel>
                              <select className="w-full px-3 py-2 border rounded-md" value={form.voucherBedrooms} onChange={set("voucherBedrooms")}>
                                <option value="">Select...</option>
                                <option value="0">Studio / Efficiency</option>
                                <option value="1">1 Bedroom</option>
                                <option value="2">2 Bedrooms</option>
                                <option value="3">3 Bedrooms</option>
                                <option value="4">4+ Bedrooms</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <FieldLabel>Public Housing Authority (PHA) Name</FieldLabel>
                              <Input value={form.phaName} onChange={set("phaName")} placeholder="St. Louis Housing Authority" />
                            </div>
                            <div>
                              <FieldLabel>PHA Phone Number</FieldLabel>
                              <Input value={form.phaPhone} onChange={set("phaPhone")} placeholder="(314) 000-0000" />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <FieldLabel>PHA Email</FieldLabel>
                              <Input type="email" value={form.phaEmail} onChange={set("phaEmail")} placeholder="caseworker@pha.gov" />
                            </div>
                            <div>
                              <FieldLabel>Voucher Number</FieldLabel>
                              <Input value={form.voucherNumber} onChange={set("voucherNumber")} placeholder="As shown on your voucher" />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <FieldLabel>Monthly Voucher Amount (HAP)</FieldLabel>
                              <Input value={form.voucherAmount} onChange={set("voucherAmount")} placeholder="$1,100" />
                            </div>
                            <div>
                              <FieldLabel>Voucher Expiration Date</FieldLabel>
                              <Input type="date" value={form.voucherExpirationDate} onChange={set("voucherExpirationDate")} />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
                            Please have your Request for Tenancy Approval (RFTA) form ready. Our team will contact your PHA directly to coordinate the inspection and HAP contract.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 — Payment */}
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
                    <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                  ) : (
                    <div />
                  )}
                  <Button
                    onClick={goNext}
                    disabled={initiateMutation.isPending}
                    className="bg-[var(--luxe-navy)] hover:bg-[var(--luxe-navy)]/90 text-white"
                  >
                    {initiateMutation.isPending
                      ? "Saving..."
                      : step === 3
                      ? "Continue to Payment"
                      : "Next"}
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
