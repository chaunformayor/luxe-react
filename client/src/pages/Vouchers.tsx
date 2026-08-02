import { Link } from "wouter";
import {
  CheckCircle,
  Phone,
  FileText,
  Home,
  ClipboardCheck,
  DollarSign,
  Shield,
} from "lucide-react";
import Layout from "@/components/Layout";

const steps = [
  {
    icon: FileText,
    num: "01",
    title: "Obtain Your Voucher",
    desc: "Contact your local Public Housing Authority (PHA) to apply for a Housing Choice Voucher. Once approved, you'll receive a voucher specifying bedroom size and payment standard.",
  },
  {
    icon: Home,
    num: "02",
    title: "Find a Property",
    desc: "Browse our available properties that meet your voucher's bedroom size and rent requirements. All Luxe Property Solutions rentals are HCV-eligible.",
  },
  {
    icon: Phone,
    num: "03",
    title: "Contact Us",
    desc: "Reach out to our leasing team. We're experienced working with HCV programs and will walk you through the documents we need from you and your PHA.",
  },
  {
    icon: ClipboardCheck,
    num: "04",
    title: "Complete Your Application",
    desc: "Submit our online rental application and select the voucher option to include your PHA details. The standard $75 application fee applies to all applicants.",
  },
  {
    icon: Shield,
    num: "05",
    title: "HQS Inspection",
    desc: "Your PHA schedules a Housing Quality Standards inspection of the unit. Our properties are maintained to exceed HQS requirements — most pass on the first visit.",
  },
  {
    icon: DollarSign,
    num: "06",
    title: "Sign Lease & Move In",
    desc: "Once the inspection passes, we execute your lease and a HAP contract with your PHA. You pay only your portion of the rent directly to us.",
  },
];

const faqs = [
  {
    q: "Do you accept Section 8 / Housing Choice Vouchers?",
    a: "Yes. Luxe Property Solutions proudly works with Housing Choice Voucher (HCV) holders, including Section 8, VASH (Veterans Affairs Supportive Housing), and other housing assistance programs.",
  },
  {
    q: "Which properties are voucher-eligible?",
    a: "All of our rental properties are available to voucher holders, provided the unit meets your voucher's bedroom size and the rent is within your PHA's approved payment standard.",
  },
  {
    q: "Does my voucher cover the full rent?",
    a: "Your PHA determines the Housing Assistance Payment (HAP) based on local payment standards and your household income. You are responsible for paying the difference between the HAP and the contract rent directly to us.",
  },
  {
    q: "Is there still an application fee?",
    a: "Yes. A $75 non-refundable application fee covers processing and a background/credit check for all applicants, including voucher holders.",
  },
  {
    q: "What documents will I need?",
    a: "You'll need your voucher paperwork from your PHA (including the RFTA form), a valid photo ID, proof of income, and your PHA case worker's contact information.",
  },
  {
    q: "How long does the HQS inspection take?",
    a: "Scheduling depends on your PHA but typically takes 5–10 business days after tenancy approval is submitted. Our properties are well-maintained and almost always pass on the first inspection.",
  },
  {
    q: "Who do I contact at my PHA?",
    a: "Your PHA should have assigned you a case worker when your voucher was issued. If you're unsure, contact your PHA's main office with your voucher number. We're happy to help coordinate.",
  },
];

const accepted = [
  "Section 8 / Housing Choice Voucher (HCV)",
  "Veterans Affairs Supportive Housing (VASH)",
  "Emergency Housing Vouchers (EHV)",
  "Project-Based Vouchers (PBV)",
  "Other local or state housing assistance programs",
];

const documents = [
  "Current housing voucher issued by your PHA",
  "Request for Tenancy Approval (RFTA) form",
  "Valid government-issued photo ID",
  "PHA case worker name and contact info",
  "Recent proof of income (pay stubs, benefits letter, etc.)",
  "Completed online rental application",
];

export default function Vouchers() {
  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <Link href="/tenants"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Tenants</span></Link>
            <span className="mx-2">/</span>
            <span>Voucher Holders</span>
          </p>
          <div className="inline-flex items-center gap-2 bg-[var(--luxe-gold)]/20 border border-[var(--luxe-gold)]/40 text-[var(--luxe-gold)] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <CheckCircle className="w-4 h-4" /> Vouchers Welcome
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Housing Choice Voucher Holders
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Luxe Property Solutions proudly accepts Section 8, HCV, VASH, and other housing assistance
            vouchers. We're committed to fair housing and making quality homes accessible to all.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link href="/apply">
              <span className="inline-block px-8 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Apply Now
              </span>
            </Link>
            <Link href="/contact">
              <span className="inline-block px-8 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                Contact Leasing Team
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Accepted Programs bar ── */}
      <div className="bg-[var(--luxe-gold)]/10 border-y border-[var(--luxe-gold)]/20 py-10">
        <div className="container mx-auto">
          <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase text-center mb-6">
            Voucher Programs We Accept
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {accepted.map((program) => (
              <span key={program} className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                <CheckCircle className="w-4 h-4 text-[var(--luxe-gold)] flex-shrink-0" />
                {program}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              How It Works
            </h2>
            <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mx-auto mb-4" />
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From voucher in hand to keys in hand — here's the step-by-step process for renting with a
              housing voucher through Luxe Property Solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className="border-t-2 border-[var(--luxe-gold)] pt-6 p-8 bg-[var(--luxe-light)] rounded-b-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 rounded-full bg-[var(--luxe-navy)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[var(--luxe-gold)]" />
                    </div>
                    <span
                      className="text-3xl font-bold text-[var(--luxe-gold)]/30"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {s.num}
                    </span>
                  </div>
                  <h3
                    className="text-lg font-bold text-[var(--luxe-navy)] mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── What to Bring + Fair Housing ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* What to Bring */}
            <div>
              <p className="text-[var(--luxe-gold)] text-xs font-bold tracking-[4px] uppercase mb-4 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-[var(--luxe-gold)] inline-block" />
                Documents Needed
              </p>
              <h2
                className="text-4xl font-bold text-[var(--luxe-navy)] mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                What to Have Ready
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Please have the following ready when you contact us or submit your application:
              </p>
              <ul className="space-y-4">
                {documents.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--luxe-gold)] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fair Housing card */}
            <div className="bg-[var(--luxe-navy)] rounded-2xl p-10 text-white">
              <div className="w-12 h-12 rounded-xl bg-[var(--luxe-gold)]/20 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-[var(--luxe-gold)]" />
              </div>
              <h3
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Our Fair Housing Commitment
              </h3>
              <p className="text-white/70 leading-relaxed mb-4 text-sm">
                Luxe Property Solutions is committed to equal housing opportunity. We do not discriminate on
                the basis of race, color, religion, sex, national origin, disability, familial status, source
                of income, or any other protected class under federal, state, or local law.
              </p>
              <p className="text-white/70 leading-relaxed text-sm">
                Voucher holders are welcome in all of our properties. We are experienced in working with PHAs
                across the region and are here to make the process as smooth as possible for you.
              </p>
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--luxe-gold)]" />
                <span className="text-sm font-semibold text-[var(--luxe-gold)]">Equal Housing Opportunity Provider</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--luxe-navy)] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Frequently Asked Questions
            </h2>
            <div className="w-12 h-0.5 bg-[var(--luxe-gold)] mx-auto" />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-[var(--luxe-navy)] hover:bg-[var(--luxe-light)] transition-colors list-none">
                  <span className="pr-4 text-sm leading-snug">{faq.q}</span>
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

      {/* ── CTA ── */}
      <section className="py-24 bg-[var(--luxe-navy)]">
        <div className="container mx-auto text-center">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to Find Your New Home?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Start your application today. Select the voucher option in the form and enter your PHA details —
            we'll take it from there.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/apply">
              <span className="inline-block px-10 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                Start Application
              </span>
            </Link>
            <Link href="/properties">
              <span className="inline-block px-10 py-4 border border-white/30 text-white font-semibold text-sm uppercase tracking-wide cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                View Properties
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
    </Layout>
  );
}
