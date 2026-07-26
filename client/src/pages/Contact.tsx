import { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inquiryType: string;
  propertyType: string;
  message: string;
}

const contactDetails = [
  {
    label: "OFFICE ADDRESS",
    lines: ["555 Washington Ave", "Saint Louis, MO 63101"],
  },
  {
    label: "PHONE",
    lines: ["636-201-1239"],
    href: "tel:6362011239",
  },
  {
    label: "EMAIL",
    lines: ["info@luxestl.com"],
    href: "mailto:info@luxestl.com",
  },
  {
    label: "BUSINESS HOURS",
    lines: [
      "Monday – Friday: 9:00 AM – 6:00 PM",
      "Saturday: 10:00 AM – 4:00 PM",
      "Sunday: Closed",
    ],
  },
];

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    inquiryType: "",
    propertyType: "",
    message: "",
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitContactMutation = trpc.contact.submitForm.useMutation({
    onSuccess: () => {
      setSubmitSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        inquiryType: "",
        propertyType: "",
        message: "",
      });
      setSubmitError(null);
      setTimeout(() => setSubmitSuccess(false), 5000);
    },
    onError: (error) => {
      setSubmitError(error.message || "Failed to submit form. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const messageBody = formData.inquiryType
      ? `[${formData.inquiryType}]\n\n${formData.message}`
      : formData.message;

    try {
      await submitContactMutation.mutateAsync({
        name: fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        propertyType: formData.propertyType || undefined,
        message: messageBody,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--luxe-gold)] focus:ring-1 focus:ring-[var(--luxe-gold)] transition-colors bg-white";
  const labelClass = "block text-sm font-semibold text-[var(--luxe-navy)] mb-2";

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--luxe-navy)] text-white py-20">
        <div className="container mx-auto">
          <p className="text-white/40 text-sm mb-4">
            <Link href="/">
              <span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span>
            </Link>
            <span className="mx-2">/</span>
            <span>Contact</span>
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            Get In Touch
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Our team is ready to answer your questions and help you get started with premium property
            management.
          </p>
        </div>
      </section>

      {/* ── Form + Info ── */}
      <section className="py-24 bg-[var(--luxe-light)]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form — takes 3 cols */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100">
                <h2
                  className="text-2xl font-bold text-[var(--luxe-navy)] mb-8"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Send Us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* First + Last Name */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        First Name <span className="text-[var(--luxe-gold)]">*</span>
                      </label>
                      <Input
                        required
                        value={formData.firstName}
                        onChange={set("firstName")}
                        placeholder="First name"
                        className={inputClass}
                        disabled={submitContactMutation.isPending}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Last Name <span className="text-[var(--luxe-gold)]">*</span>
                      </label>
                      <Input
                        required
                        value={formData.lastName}
                        onChange={set("lastName")}
                        placeholder="Last name"
                        className={inputClass}
                        disabled={submitContactMutation.isPending}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelClass}>
                      Email Address <span className="text-[var(--luxe-gold)]">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={set("email")}
                      placeholder="your@email.com"
                      className={inputClass}
                      disabled={submitContactMutation.isPending}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <Input
                      value={formData.phone}
                      onChange={set("phone")}
                      placeholder="(314) 000-0000"
                      className={inputClass}
                      disabled={submitContactMutation.isPending}
                    />
                  </div>

                  {/* I Am A */}
                  <div>
                    <label className={labelClass}>
                      I Am A <span className="text-[var(--luxe-gold)]">*</span>
                    </label>
                    <select
                      required
                      value={formData.inquiryType}
                      onChange={set("inquiryType")}
                      className={inputClass}
                      disabled={submitContactMutation.isPending}
                    >
                      <option value="">Select one...</option>
                      <option value="Property Owner seeking management">Property Owner seeking management</option>
                      <option value="Prospective Tenant">Prospective Tenant</option>
                      <option value="Prospective Buyer">Prospective Buyer</option>
                      <option value="Other Inquiry">Other Inquiry</option>
                    </select>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className={labelClass}>Property Type</label>
                    <select
                      value={formData.propertyType}
                      onChange={set("propertyType")}
                      className={inputClass}
                      disabled={submitContactMutation.isPending}
                    >
                      <option value="">Select property type...</option>
                      <option value="single-family">Single Family Home</option>
                      <option value="multi-family">Multi-Family</option>
                      <option value="condo">Condo / Townhome</option>
                      <option value="commercial">Commercial</option>
                      <option value="na">Not Applicable</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className={labelClass}>
                      Message <span className="text-[var(--luxe-gold)]">*</span>
                    </label>
                    <Textarea
                      required
                      value={formData.message}
                      onChange={set("message")}
                      placeholder="Tell us about your property management needs..."
                      rows={5}
                      className={inputClass}
                      disabled={submitContactMutation.isPending}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitContactMutation.isPending}
                    className="w-full bg-[var(--luxe-navy)] hover:bg-[var(--luxe-navy)]/90 text-white font-semibold py-4 text-sm uppercase tracking-wide rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitContactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>

                  {submitSuccess && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-800">Message Sent!</p>
                        <p className="text-sm text-green-700">
                          Thank you for reaching out. We'll be in touch within one business day.
                        </p>
                      </div>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800">Error</p>
                        <p className="text-sm text-red-700">{submitError}</p>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Contact Info — takes 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              <h2
                className="text-2xl font-bold text-[var(--luxe-navy)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Contact Information
              </h2>

              {contactDetails.map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                >
                  <p className="text-[var(--luxe-gold)] text-xs font-bold uppercase tracking-[3px] mb-3">
                    {item.label}
                  </p>
                  {item.lines.map((line, i) =>
                    item.href && i === 0 ? (
                      <a
                        key={i}
                        href={item.href}
                        className="block text-[var(--luxe-navy)] font-semibold hover:text-[var(--luxe-gold)] transition-colors"
                      >
                        {line}
                      </a>
                    ) : (
                      <p key={i} className={i === 0 && !item.href ? "text-gray-700 font-semibold" : "text-gray-600 text-sm"}>
                        {line}
                      </p>
                    )
                  )}
                </div>
              ))}

              {/* Emergency + Portal Quick Access */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <p className="text-[var(--luxe-gold)] text-xs font-bold uppercase tracking-[3px] mb-3">
                  After Hours
                </p>
                <p className="text-gray-600 text-sm mb-3">For emergencies after hours:</p>
                <a
                  href="tel:6362011239"
                  className="inline-block px-5 py-2.5 bg-[var(--luxe-navy)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--luxe-navy)]/90 transition-colors"
                >
                  Emergency Line
                </a>
              </div>

              <div className="bg-[var(--luxe-navy)] rounded-xl p-6">
                <p className="text-[var(--luxe-gold)] text-xs font-bold uppercase tracking-[3px] mb-4">
                  Portal Quick Access
                </p>
                <div className="space-y-3">
                  <Link href="/login">
                    <span className="block w-full text-center py-3 border border-white/20 text-white text-sm font-semibold rounded-lg cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors">
                      Tenant Portal Login
                    </span>
                  </Link>
                  <Link href="/owner-login">
                    <span className="block w-full text-center py-3 border border-white/20 text-white text-sm font-semibold rounded-lg cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors">
                      Owner Portal Login
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
