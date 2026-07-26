import NeighborhoodTemplate, { NeighborhoodData } from "@/components/NeighborhoodTemplate";

const data: NeighborhoodData = {
  badge: "ST. CHARLES COUNTY, MO",
  headline: "Property Management in",
  headlineGold: "St. Charles County",
  subtitle:
    "St. Charles County is the fastest-growing rental submarket in the St. Louis metro. Luxe Property Solutions helps landlords and investors maximize returns with professional, hands-off management across O'Fallon, Wentzville, St. Peters, and beyond.",
  stats: [
    { value: "#1", label: "Fastest-Growing STL Submarket" },
    { value: "~800", label: "Units Absorbed in 2025" },
    { value: "$1,400+", label: "Avg. Rent (SFR)" },
    { value: "~97%", label: "Occupancy Rate" },
  ],
  marketLabel: "THE MARKET",
  marketTitle: "St. Charles County: The St. Louis Metro's Growth Engine",
  marketBody: [
    "St. Charles County has consistently led the St. Louis metro in rental demand, population growth, and new household formation. Communities like O'Fallon, Wentzville, St. Peters, Lake St. Louis, and Cottleville attract young families, corporate relocators, and professionals seeking top-rated schools, new infrastructure, and suburban amenity without the price tag of comparable Midwest markets.",
    "For landlords, this translates to lower vacancy, stronger tenant quality, and steadier rent growth. For investors, St. Charles offers a compelling combination: higher rents than city neighborhoods, lower crime rates, and tenants who stay longer because they value the schools and community.",
    "Luxe Property Solutions manages rental properties throughout St. Charles County — and with our in-house MCS construction crew, we can get a vacant or outdated property rent-ready faster than any PM company relying on outside contractors.",
  ],
  highlightsLabel: "INVESTMENT HIGHLIGHTS",
  highlightsTitle: "Why St. Charles County Works for Buy-and-Hold Investors",
  highlights: [
    {
      title: "Top-rated school districts:",
      desc: "Fort Zumwalt, Francis Howell, and Wentzville school districts draw families who prioritize stability — meaning longer tenancies and fewer turnovers.",
    },
    {
      title: "Corporate relocation demand:",
      desc: "St. Charles County is home to major employers including World Wide Technology and a growing logistics sector — a built-in tenant base of relocating professionals.",
    },
    {
      title: "Strong rent growth:",
      desc: "St. Charles County is identified as one of the top two performing submarkets in the St. Louis metro, leading in demand absorption.",
    },
    {
      title: "New construction competition:",
      desc: "The area's growth attracts new apartment development, so professional management and well-maintained properties are essential to compete.",
    },
    {
      title: "Low crime, high desirability:",
      desc: "Tenant quality and retention are consistently strong in O'Fallon and Wentzville corridors.",
    },
  ],
  servicesLabel: "OUR SERVICES",
  servicesTitle: "What Luxe Provides in St. Charles County",
  services: [
    {
      emoji: "📣",
      title: "Marketing & Leasing",
      desc: "Professional listings across Zillow, Apartments.com, Facebook Marketplace, and local channels with optimized pricing.",
    },
    {
      emoji: "🔍",
      title: "In-Depth Tenant Screening",
      desc: "Full credit, background, income, and rental history review. St. Charles tenants expect a professional process — we deliver it.",
    },
    {
      emoji: "🔧",
      title: "Maintenance Coordination",
      desc: "Tenant portal for requests, rapid response coordination, and preferred pricing through MCS for larger repairs.",
    },
    {
      emoji: "📊",
      title: "Owner Reporting",
      desc: "Monthly statements, inspection reports, and real-time access through your owner portal — wherever you are.",
    },
    {
      emoji: "🔄",
      title: "Lease Renewals",
      desc: "We handle renewal negotiations, rent adjustment recommendations based on market data, and updated lease execution.",
    },
    {
      emoji: "🏗️",
      title: "Turnover Rehab (MCS)",
      desc: "Fast, cost-effective turnovers between tenants using our in-house crew — minimizing your vacancy window.",
    },
  ],
  faqLabel: "COMMON QUESTIONS",
  faqTitle: "St. Charles County Property Management FAQ",
  faqs: [
    {
      q: "What cities in St. Charles County do you serve?",
      a: "We manage properties throughout St. Charles County including O'Fallon, Wentzville, St. Peters, Lake St. Louis, Cottleville, St. Charles City, Dardenne Prairie, and surrounding areas.",
    },
    {
      q: "Are rents still growing in St. Charles County?",
      a: "Yes. St. Charles County has been consistently identified as the top-performing submarket in the St. Louis metro. Occupancy rates near 97% and limited new supply additions are expected to sustain upward pressure on rents through 2026 and beyond.",
    },
    {
      q: "Do you manage single-family homes or only multifamily?",
      a: "Both. We manage single-family homes, duplexes, small multifamily, and portfolio properties throughout St. Charles County. Our platform scales whether you have one rental or fifteen.",
    },
  ],
  formTitle: "Free Rental Analysis",
  formSubtitle: "See what your St. Charles property can earn",
  locationName: "St. Charles County",
};

export default function StCharles() {
  return <NeighborhoodTemplate data={data} />;
}
