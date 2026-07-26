import NeighborhoodTemplate, { NeighborhoodData } from "@/components/NeighborhoodTemplate";

const data: NeighborhoodData = {
  badge: "KIRKWOOD, MO",
  headline: "Property Management in",
  headlineGold: "Kirkwood, Missouri",
  subtitle:
    "Kirkwood is one of St. Louis's most desirable inner-ring suburbs — and one of the most competitive rental markets in the metro. Luxe Property Solutions helps Kirkwood landlords protect premium properties and attract quality long-term tenants.",
  stats: [
    { value: "$1,600+", label: "Avg. Rent (SFR)" },
    { value: "Top 5", label: "STL School Districts" },
    { value: "~98%", label: "Occupancy Rate" },
    { value: "High", label: "Long-Term Tenant Retention" },
  ],
  marketLabel: "THE MARKET",
  marketTitle: "Kirkwood: Premium Rentals, Premium Tenants",
  marketBody: [
    "Kirkwood's charming downtown, historic neighborhoods, top-rated Kirkwood School District, and proximity to both I-44 and I-270 make it one of the most consistently in-demand rental markets in St. Louis County. Tenants who rent in Kirkwood are typically professionals, families, and corporate relocators — exactly the demographic that stays longer, pays on time, and treats a property with care.",
    "For landlords with properties in Kirkwood, the stakes are high. A premium property deserves premium management. Luxe Property Solutions brings white-glove service to Kirkwood property owners, with detailed inspections, responsive maintenance coordination, and professional tenant relations that protect your investment and your reputation.",
    "Through our affiliate Missouri Construction Service, we also help Kirkwood landlords with renovation projects — updating kitchens and baths to command top-of-market rents, or handling between-tenant refreshes that keep properties competitive.",
  ],
  highlightsLabel: "INVESTMENT HIGHLIGHTS",
  highlightsTitle: "Why Kirkwood Landlords Choose Professional Management",
  highlights: [
    {
      title: "Tenant expectations are high:",
      desc: "Kirkwood renters expect prompt communication, clean well-maintained properties, and professional leasing processes. The right management partner protects your rental's reputation.",
    },
    {
      title: "Strong resale value:",
      desc: "Properties that are well-managed and well-maintained in Kirkwood hold value exceptionally well — making professional management an investment in your exit strategy, not just current income.",
    },
    {
      title: "Long-term tenancies:",
      desc: "Families who choose Kirkwood for the Kirkwood School District tend to stay 2–4 years or longer, reducing your turnover costs significantly.",
    },
    {
      title: "Competitive rental market:",
      desc: "A well-priced, well-marketed listing in Kirkwood moves quickly. Our local pricing expertise and marketing channels minimize vacancy windows.",
    },
    {
      title: "Corporate relo demand:",
      desc: "Kirkwood's location and amenities make it a top choice for corporate relocation tenants — high-income, short- to medium-term renters who pay premium rates.",
    },
  ],
  faqLabel: "COMMON QUESTIONS",
  faqTitle: "Kirkwood Property Management FAQ",
  faqs: [
    {
      q: "What does property management typically cost in Kirkwood?",
      a: "Our full management rate is 8% of monthly rent collected, with a one-time placement fee of 50% of first month's rent. For portfolio investors (3+ units), we offer a 7% rate. Kirkwood properties typically command rents where this represents a small cost relative to the time and risk it eliminates.",
    },
    {
      q: "Do you handle corporate relocation rentals in Kirkwood?",
      a: "Yes. We're experienced with corporate relocation tenants and the specific lease structures and service expectations that come with them — including furnished or partially furnished rental arrangements on request.",
    },
    {
      q: "Can you help me update my Kirkwood property to get higher rent?",
      a: "Absolutely. Through Missouri Construction Service, we can assess your property and recommend targeted improvements — kitchen updates, bathroom refreshes, flooring — that will maximize your rental rate and attract higher-quality tenants. We then manage the property once it's ready.",
    },
  ],
  formTitle: "Free Rental Analysis",
  formSubtitle: "Find out what your Kirkwood property can earn",
  locationName: "Kirkwood, MO",
};

export default function Kirkwood() {
  return <NeighborhoodTemplate data={data} />;
}
