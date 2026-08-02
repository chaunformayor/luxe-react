import NeighborhoodTemplate, { NeighborhoodData } from "@/components/NeighborhoodTemplate";

const data: NeighborhoodData = {
  slug: "webster-groves",
  badge: "WEBSTER GROVES, MO",
  headline: "Property Management in",
  headlineGold: "Webster Groves, Missouri",
  subtitle:
    "Webster Groves is a historic, highly walkable inner suburb with one of the strongest rental demand profiles in the St. Louis metro. Luxe Property Solutions helps Webster Groves landlords maintain premium properties and secure long-term, quality tenants.",
  stats: [
    { value: "$1,550+", label: "Avg. Rent (SFR)" },
    { value: "Historic", label: "Brick Home Stock" },
    { value: "~98%", label: "Occupancy Rate" },
    { value: "High", label: "Tenant Retention Rate" },
  ],
  marketLabel: "THE MARKET",
  marketTitle: "Webster Groves: Historic Character, Premium Rental Demand",
  marketBody: [
    "Webster Groves has maintained its identity as one of St. Louis's most desirable inner suburbs for generations. Its tree-lined streets, walkable downtown, top-rated Webster Groves School District, and stock of century-old brick homes create a rental market that is consistently tight — with low vacancy and tenants who are deeply attached to the community.",
    "Renters who choose Webster Groves are typically professionals, academics, and families who value the neighborhood's character as much as the amenities. They tend to stay longer, maintain properties with care, and pay on time — making the Webster Groves rental market one of the most landlord-friendly in the metro for owners who take the time to manage well.",
    "Luxe Property Solutions brings a professional management approach to Webster Groves — handling tenant relations, maintenance coordination, and compliance so that landlords can enjoy passive income from one of St. Louis's most enduring neighborhoods. Through our affiliate Missouri Construction Service, we also help owners modernize interiors while preserving the character that makes Webster Groves rentals so desirable.",
  ],
  highlightsLabel: "INVESTMENT HIGHLIGHTS",
  highlightsTitle: "Why Webster Groves Works for Long-Term Landlords",
  highlights: [
    {
      title: "Historically low vacancy:",
      desc: "Renters actively seek out Webster Groves and rarely leave once they're in — vacancy windows are among the shortest in the metro.",
    },
    {
      title: "Premium renter profile:",
      desc: "Webster University proximity, strong school district, and walkable lifestyle attract stable, professional tenants who treat properties well.",
    },
    {
      title: "Character inventory:",
      desc: "The brick SFR and bungalow stock in Webster commands a premium over newer construction — and that premium grows with proper maintenance.",
    },
    {
      title: "Strong long-term appreciation:",
      desc: "Webster Groves property values have appreciated steadily for decades, making rental income a bonus on top of an appreciating asset.",
    },
    {
      title: "Renovation opportunity:",
      desc: "Updating kitchens and baths in classic Webster Groves homes produces outsized rent jumps — our MCS crew specializes in exactly this kind of targeted upgrade.",
    },
  ],
  faqLabel: "COMMON QUESTIONS",
  faqTitle: "Webster Groves Property Management FAQ",
  faqs: [
    {
      q: "What rental rates can I expect in Webster Groves?",
      a: "Well-maintained single-family homes in Webster Groves typically rent for $1,500–$2,000+ per month depending on size, condition, and specific block. Updated kitchens and baths can push rents to the top of that range. We'll provide a free, detailed rental analysis specific to your property.",
    },
    {
      q: "Do you handle properties near Webster University?",
      a: "Yes — we're experienced with the full range of Webster Groves rentals including properties that attract university staff, faculty, and graduate students. We can help you position your property for the tenant profile that best suits your goals.",
    },
    {
      q: "Can you help me update my Webster Groves property without losing its character?",
      a: "Absolutely. Our affiliate Missouri Construction Service has extensive experience with classic St. Louis brick homes — updating mechanicals, kitchens, and baths in ways that modernize without erasing the historic character that makes Webster Groves properties so desirable.",
    },
  ],
  formTitle: "Free Rental Analysis",
  formSubtitle: "Find out what your Webster Groves property can earn",
  locationName: "Webster Groves, MO",
};

export default function WebsterGroves() {
  return <NeighborhoodTemplate data={data} />;
}
