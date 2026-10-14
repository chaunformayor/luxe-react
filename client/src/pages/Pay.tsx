import { useState } from "react";
import { Link, useParams } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CheckCircle, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// ── Stripe card form (inside <Elements>) ──────────────────────────────────────
function StripePaymentForm({ applicationId, clientSecret, applicantName, fee, onSuccess, onError }: {
  applicationId: string; clientSecret: string; applicantName: string; fee: number;
  onSuccess: () => void; onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const confirm = trpc.application.confirmPayment.useMutation({ onSuccess, onError: (e) => onError(e.message) });

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element not found");
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
      if (error) throw new Error(error.message);
      if (paymentIntent?.status !== "succeeded") throw new Error("Payment did not succeed");
      await confirm.mutateAsync({ applicationId });
    } catch (err: any) {
      onError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-gray-700">Card Information <span className="text-red-500">*</span></label>
        <div className="border rounded-md p-3 bg-white">
          <CardElement options={{ style: { base: { fontSize: "16px", color: "#1a2744", "::placeholder": { color: "#9ca3af" } } } }} />
        </div>
      </div>
      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        <Lock className="w-3 h-3" /> Encrypted and secure via Stripe.
      </p>
      <Button
        onClick={handlePay}
        disabled={processing || confirm.isPending || !stripe}
        className="w-full bg-[var(--luxe-gold)] hover:bg-[var(--luxe-gold)]/90 text-[var(--luxe-navy)] font-bold text-lg py-6"
      >
        {processing || confirm.isPending ? "Processing..." : `Pay $${fee}.00`}
      </Button>
    </div>
  );
}

// ── Demo form (no Stripe configured) ─────────────────────────────────────────
function DemoPaymentForm({ applicationId, fee, onSuccess, onError }: {
  applicationId: string; fee: number; onSuccess: () => void; onError: (msg: string) => void;
}) {
  const [processing, setProcessing] = useState(false);
  const confirm = trpc.application.confirmPayment.useMutation({ onSuccess, onError: (e) => onError(e.message) });

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      await confirm.mutateAsync({ applicationId });
    } catch (err: any) {
      onError(err.message || "Submission failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>Demo Mode:</strong> Stripe is not configured. Click below to confirm without a real charge.
      </div>
      <Button onClick={handleSubmit} disabled={processing || confirm.isPending}
        className="w-full bg-[var(--luxe-gold)] hover:bg-[var(--luxe-gold)]/90 text-[var(--luxe-navy)] font-bold text-lg py-6">
        {processing || confirm.isPending ? "Processing..." : `Confirm Payment — $${fee}.00`}
      </Button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Pay() {
  const { id } = useParams<{ id: string }>();
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, error: fetchError } = trpc.application.getForPayment.useQuery(
    { applicationId: id ?? "" },
    { enabled: !!id, retry: false }
  );

  if (!id) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Invalid payment link.</p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--luxe-gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (fetchError) {
    return (
      <Layout>
        <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
          <div className="container mx-auto">
            <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Payment Link</h1>
          </div>
        </section>
        <section className="py-24 bg-[var(--luxe-light)] min-h-[50vh] flex items-center">
          <div className="container mx-auto max-w-lg text-center">
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-red-100">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Link Unavailable</h2>
              <p className="text-gray-600 text-sm">{fetchError.message}</p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (paid) {
    return (
      <Layout>
        <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
          <div className="container mx-auto">
            <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Payment Confirmed</h1>
          </div>
        </section>
        <section className="py-24 bg-[var(--luxe-light)] min-h-[50vh] flex items-center">
          <div className="container mx-auto max-w-lg text-center">
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--luxe-navy)] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                Payment Received!
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Thank you, <strong>{data?.firstName}</strong>. Your $75 application fee has been processed. Our team will be in touch shortly.
              </p>
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

  return (
    <Layout>
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>Application Fee</h1>
          <p className="text-white/70 text-xl">Complete your rental application by paying the processing fee.</p>
        </div>
      </section>

      <section className="py-16 bg-[var(--luxe-light)] min-h-screen">
        <div className="container mx-auto max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Applicant summary */}
            <div className="bg-[var(--luxe-navy)]/5 border-b p-6">
              <p className="text-xs font-bold text-[var(--luxe-gold)] uppercase tracking-[3px] mb-3">Applicant</p>
              <p className="text-lg font-bold text-[var(--luxe-navy)]">{data?.firstName} {data?.lastName}</p>
              <p className="text-sm text-gray-500">{data?.email}</p>
            </div>

            {/* Fee breakdown */}
            <div className="p-6 border-b">
              <p className="text-xs font-bold text-[var(--luxe-gold)] uppercase tracking-[3px] mb-3">Fee Breakdown</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Application Processing</span><span>$50.00</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Background & Credit Check</span><span>$25.00</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                  <span>Total Due</span>
                  <span className="text-[var(--luxe-gold)]">${data?.applicationFee ?? 75}.00</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Non-refundable. This fee covers background screening and application processing per adult applicant.</p>
            </div>

            {/* Payment form */}
            <div className="p-6">
              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {stripePromise && data?.clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret: data.clientSecret }}>
                  <StripePaymentForm
                    applicationId={id}
                    clientSecret={data.clientSecret}
                    applicantName={`${data.firstName} ${data.lastName}`}
                    fee={data.applicationFee ?? 75}
                    onSuccess={() => setPaid(true)}
                    onError={setError}
                  />
                </Elements>
              ) : (
                <DemoPaymentForm
                  applicationId={id}
                  fee={data?.applicationFee ?? 75}
                  onSuccess={() => setPaid(true)}
                  onError={setError}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
