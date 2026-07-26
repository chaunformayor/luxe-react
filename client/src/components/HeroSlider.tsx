import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface Slide {
  image: string;
  eyebrow: string;
  title: string;
  titleEm: string;
  titleEnd: string;
  description: string;
  cta: string;
  ctaLink: string;
  ctaSecondary?: string;
  ctaSecondaryLink?: string;
}

const slides: Slide[] = [
  {
    image: "/images/hero-professional.jpg",
    eyebrow: "St. Louis's Premier Investor Platform · Est. 1999",
    title: "One call. ",
    titleEm: "Three companies.",
    titleEnd: " Total peace of mind.",
    description:
      "Most property managers can rent your home. We can find it, rehab it, stabilize it, and manage it — all under one roof. No handoffs. No gaps. Just results.",
    cta: "Get a Free Rental Analysis",
    ctaLink: "/contact",
    ctaSecondary: "View Pricing & Services",
    ctaSecondaryLink: "/services",
  },
  {
    image: "/images/hero-building.jpg",
    eyebrow: "In-House Rehab · Deal Sourcing · Full Management",
    title: "St. Louis's Only ",
    titleEm: "End-to-End",
    titleEnd: " Investor Platform.",
    description:
      "No other property management company in St. Louis gives you an in-house GC crew, deal sourcing, and full property management under one roof.",
    cta: "Learn More",
    ctaLink: "/about",
    ctaSecondary: "View Services",
    ctaSecondaryLink: "/services",
  },
  {
    image: "/images/hero-agent.jpg",
    eyebrow: "Traditional & Short-Term Rentals · Section 8 Specialists",
    title: "Your Investment. ",
    titleEm: "Our Expertise.",
    titleEnd: " Maximum Returns.",
    description:
      "From tenant screening to maintenance coordination — we handle every aspect of property management with precision, care, and 25+ years of St. Louis market knowledge.",
    cta: "Apply Now",
    ctaLink: "/apply",
    ctaSecondary: "Contact Us",
    ctaSecondaryLink: "/contact",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-[600px] md:h-[92vh] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />
          <div className="absolute inset-0 bg-[var(--luxe-navy)]/70" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />

          <div className="relative z-20 h-full flex items-center px-6 md:px-12 lg:px-20">
            <div className="max-w-3xl">
              <p className="text-[var(--luxe-gold)] text-xs font-medium tracking-[4px] uppercase mb-6">
                {slide.eyebrow}
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                {slide.title}
                <em className="text-[var(--luxe-gold)] not-italic">{slide.titleEm}</em>
                {slide.titleEnd}
              </h1>
              <p className="text-lg text-white/70 mb-10 max-w-xl leading-relaxed">
                {slide.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={slide.ctaLink}>
                  <span className="inline-block px-8 py-4 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--luxe-gold)]/90 transition-colors rounded-sm">
                    {slide.cta}
                  </span>
                </Link>
                {slide.ctaSecondary && (
                  <Link href={slide.ctaSecondaryLink!}>
                    <span className="inline-block px-8 py-4 border border-white/40 text-white font-medium text-sm cursor-pointer hover:border-[var(--luxe-gold)] hover:text-[var(--luxe-gold)] transition-colors rounded-sm">
                      {slide.ctaSecondary}
                    </span>
                  </Link>
                )}
              </div>

              {/* Company pills */}
              {index === 0 && (
                <div className="flex flex-wrap gap-3 mt-10">
                  {[
                    { num: "01", label: "Midwest Investor Services", desc: "Deal sourcing · Underwriting · Investment consulting" },
                    { num: "02", label: "Missouri Construction Service", desc: "Full rehab · Estimating · 25+ years GC experience" },
                    { num: "03", label: "Luxe Property Solutions", desc: "Traditional & short-term rental management" },
                  ].map((pill) => (
                    <div key={pill.num} className="flex items-center gap-3 px-4 py-3 rounded-sm" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(201,168,76,0.25)" }}>
                      <span className="text-[var(--luxe-gold)] font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>{pill.num}</span>
                      <div>
                        <div className="text-white text-xs font-medium uppercase tracking-wide">{pill.label}</div>
                        <div className="text-white/40 text-xs mt-0.5">{pill.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-[var(--luxe-gold)]/80 hover:bg-[var(--luxe-gold)] text-[var(--luxe-navy)] p-3 rounded-full transition-all" aria-label="Previous slide">
        <ChevronLeft size={22} />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-[var(--luxe-gold)]/80 hover:bg-[var(--luxe-gold)] text-[var(--luxe-navy)] p-3 rounded-full transition-all" aria-label="Next slide">
        <ChevronRight size={22} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button key={index} onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentSlide ? "bg-[var(--luxe-gold)] scale-125" : "bg-white/40 hover:bg-white/70"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
