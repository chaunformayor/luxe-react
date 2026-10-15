import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { AlertTriangle, CheckCircle2, Clock, Download, ExternalLink, FileSignature, Loader2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import PdfViewer from "@/components/PdfViewer";
import SignaturePad, { type SignatureValue } from "@/components/SignaturePad";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <header className="bg-[#0A1628]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-[#C9A84C] font-bold tracking-[0.2em] text-sm">LUXE</p>
            <p className="text-white/60 text-[10px] tracking-[0.25em]">PROPERTY SOLUTIONS</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-white/70 text-xs">
            <FileSignature size={14} /> Secure e-signature
          </span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10">{children}</main>
      <footer className="max-w-4xl mx-auto px-4 pb-10 text-center text-xs text-gray-400">
        Luxe Property Solutions · 555 Washington Ave, St. Louis, MO 63101 ·{" "}
        <a href="mailto:info@luxestl.com" className="underline">info@luxestl.com</a>
      </footer>
    </div>
  );
}

function StatusCard({ icon, tone, title, children }: { icon: React.ReactNode; tone: "green" | "amber" | "red" | "gray"; title: string; children?: React.ReactNode }) {
  const tones = {
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center max-w-xl mx-auto">
      <div className={`w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center ${tones[tone]}`}>{icon}</div>
      <h1 className="text-2xl font-bold text-[#0A1628] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </h1>
      <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

const SIGNER_STATUS: Record<string, string> = {
  waiting: "Up next",
  sent: "Waiting to sign",
  viewed: "Reviewing",
  signed: "Signed",
  declined: "Declined",
};

export default function Sign() {
  const { token = "" } = useParams<{ token: string }>();
  const utils = trpc.useUtils();
  const session = trpc.sign.get.useQuery({ token }, { retry: false, refetchOnWindowFocus: false });
  const view = trpc.sign.view.useMutation();
  const submit = trpc.sign.submit.useMutation({ onSuccess: (data) => utils.sign.get.setData({ token }, data) });
  const decline = trpc.sign.decline.useMutation({ onSuccess: (data) => utils.sign.get.setData({ token }, data) });

  const [consent, setConsent] = useState(false);
  const [printedName, setPrintedName] = useState("");
  const [signature, setSignature] = useState<SignatureValue>(null);
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const viewed = useRef(false);

  const data = session.data;

  useEffect(() => {
    if (data?.state === "ready" && !viewed.current) {
      viewed.current = true;
      view.mutate({ token });
    }
    if (data?.signer.name && !printedName) setPrintedName(data.signer.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.state]);

  if (session.isLoading) {
    return (
      <Shell>
        <div className="flex justify-center py-24 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Shell>
    );
  }

  if (session.error || !data) {
    return (
      <Shell>
        <StatusCard icon={<AlertTriangle />} tone="red" title="This link isn't valid">
          <p>The signing link may be incomplete or mistyped. Open it again from your email, or contact us at info@luxestl.com.</p>
        </StatusCard>
      </Shell>
    );
  }

  const progress = (
    <ul className="text-left text-sm bg-gray-50 rounded-xl p-4 space-y-2 mt-4">
      {data.signers.map((s, i) => (
        <li key={i} className="flex justify-between gap-3">
          <span className="text-gray-700">
            {s.name}
            {s.roleLabel ? <span className="text-gray-400"> · {s.roleLabel}</span> : null}
            {s.isMe ? <span className="text-gray-400"> (you)</span> : null}
          </span>
          <span className={s.status === "signed" ? "text-green-600 font-medium" : s.status === "declined" ? "text-red-600" : "text-gray-500"}>
            {SIGNER_STATUS[s.status]}
          </span>
        </li>
      ))}
    </ul>
  );

  if (data.state === "voided") {
    return (
      <Shell>
        <StatusCard icon={<XCircle />} tone="gray" title="This request was cancelled">
          <p>Luxe Property Solutions cancelled the signature request for <strong>{data.title}</strong>. No action is needed.</p>
        </StatusCard>
      </Shell>
    );
  }

  if (data.state === "declined") {
    return (
      <Shell>
        <StatusCard icon={<XCircle />} tone="red" title={data.signer.declinedByMe ? "You declined to sign" : "This request is on hold"}>
          <p>
            {data.signer.declinedByMe
              ? `We've let Luxe Property Solutions know you declined ${data.title}. They'll reach out if anything needs to change.`
              : `Another signer declined ${data.title}, so it can't be completed right now. Luxe Property Solutions will be in touch.`}
          </p>
        </StatusCard>
      </Shell>
    );
  }

  if (data.state === "waiting") {
    return (
      <Shell>
        <StatusCard icon={<Clock />} tone="amber" title="It's not your turn yet">
          <p><strong>{data.title}</strong> is still with an earlier signer. We'll email you as soon as it's ready for you.</p>
          {progress}
        </StatusCard>
      </Shell>
    );
  }

  if (data.state === "completed") {
    return (
      <Shell>
        <StatusCard icon={<CheckCircle2 />} tone="green" title="Everyone has signed">
          <p><strong>{data.title}</strong> is complete. A copy was emailed to you, and you can download it any time here.</p>
          <a
            href={`/api/esign/${token}/signed.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-[#C9A84C] text-[#0A1628] font-semibold rounded-lg hover:bg-[#C9A84C]/90"
          >
            <Download size={18} /> Download signed copy
          </a>
          {progress}
        </StatusCard>
      </Shell>
    );
  }

  if (data.state === "signed") {
    return (
      <Shell>
        <StatusCard icon={<CheckCircle2 />} tone="green" title="Thanks — you've signed">
          <p>We'll email everyone a copy of <strong>{data.title}</strong> as soon as all signatures are in.</p>
          {progress}
        </StatusCard>
      </Shell>
    );
  }

  // ── Ready to sign ──────────────────────────────────────────────────────────
  const canSign = consent && printedName.trim().length >= 2 && !!signature && !submit.isPending;

  function handleSign() {
    setFormError(null);
    if (!consent) return setFormError("Please check the box agreeing to sign electronically.");
    if (printedName.trim().length < 2) return setFormError("Please type your full legal name.");
    if (!signature) return setFormError("Please add your signature.");
    submit.mutate(
      { token, consent, printedName: printedName.trim(), method: signature.method, signatureImage: signature.dataUrl },
      { onError: (e) => setFormError(e.message) }
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <p className="text-xs font-bold tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Please review and sign</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {data.title}
          </h1>
          <p className="text-gray-600">
            Sent by {data.senderName} at Luxe Property Solutions to <strong>{data.signer.name}</strong>
            {data.signer.roleLabel ? ` (${data.signer.roleLabel})` : ""}.
          </p>
          {data.message && (
            <div className="mt-4 bg-[#f8f6ef] border-l-4 border-[#C9A84C] rounded-r-lg px-4 py-3 text-gray-700 whitespace-pre-wrap">{data.message}</div>
          )}
          {data.signers.length > 1 && progress}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b bg-gray-50">
            <h2 className="font-semibold text-[#0A1628]">Document{data.pageCount ? ` · ${data.pageCount} page${data.pageCount === 1 ? "" : "s"}` : ""}</h2>
            <a href={`/api/esign/${token}/document.pdf`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A1628] hover:underline">
              <ExternalLink size={14} /> Open full document
            </a>
          </div>
          <div className="max-h-[70vh] overflow-y-auto bg-gray-200/60 p-3 sm:p-5">
            <PdfViewer url={`/api/esign/${token}/document.pdf`} />
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#0A1628] mb-1">Sign</h2>
            <p className="text-sm text-gray-500">Read the whole document before signing. Your signature applies to the entire document.</p>
          </div>

          <label className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 cursor-pointer">
            <input type="checkbox" className="mt-1 w-4 h-4 accent-[#0A1628]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span className="text-sm text-gray-700 leading-relaxed">
              I agree to use electronic records and signatures, and I intend my electronic signature to have the same legal effect as a handwritten one.
              I can request a paper copy at no charge from info@luxestl.com, and I can decline instead of signing.
            </span>
          </label>

          <div>
            <label htmlFor="printed-name" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Full legal name
            </label>
            <input
              id="printed-name"
              value={printedName}
              onChange={(e) => setPrintedName(e.target.value)}
              autoComplete="name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]"
            />
          </div>

          <div>
            <p className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Signature</p>
            <SignaturePad printedName={printedName} onChange={setSignature} />
          </div>

          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>}

          <button
            onClick={handleSign}
            disabled={!canSign}
            className="w-full py-4 rounded-xl bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0A1628] font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {submit.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            {submit.isPending ? "Signing…" : "Sign document"}
          </button>

          <div className="text-center">
            {!showDecline ? (
              <button onClick={() => setShowDecline(true)} className="text-sm text-gray-500 hover:text-red-600 underline">
                I don't want to sign this
              </button>
            ) : (
              <div className="text-left bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
                <label htmlFor="decline-reason" className="block text-sm font-semibold text-red-800">
                  Let Luxe know why (optional)
                </label>
                <textarea
                  id="decline-reason"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm bg-white"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowDecline(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-semibold bg-white">
                    Go back
                  </button>
                  <button
                    onClick={() => decline.mutate({ token, reason: declineReason }, { onError: (e) => setFormError(e.message) })}
                    disabled={decline.isPending}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    {decline.isPending ? "Sending…" : "Decline to sign"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}
