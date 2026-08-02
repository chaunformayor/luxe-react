import NeighborhoodTemplate, { NeighborhoodData } from "@/components/NeighborhoodTemplate";

const data: NeighborhoodData = {
  slug: "north-county",
  badge: "NORTH COUNTY, ST. LOUIS, MO",
  headline: "Property Management in",
  headlineGold: "North County, St. Louis",
  subtitle:
    "North County is one of St. Louis's most active markets for single-family rental investment. Luxe Property Solutions gives landlords and investors a full-service team — leasing, maintenance, and rehab — all under one roof.",
  stats: [
    { value: "$1,265", label: "Avg. Single-Family Rent" },
    { value: "6.1%", label: "Rent Growth YoY" },
    { value: "~95%", label: "Occupancy Rate" },
    { value: "25+", label: "Years GC Experience" },
  ],
  marketLabel: "THE MARKET",
  marketTitle: "Why Investors Are Watching North County",
  marketBody: [
    "North County — spanning communities like Florissant, Ferguson, Hazelwood, Jennings, Pine Lawn, and Normandy — has emerged as one of the most active single-family rental investment corridors in the entire St. Louis metro. Single-family rents in the area have risen sharply, with institutional investors including VineBrook Homes and FirstKey acquiring hundreds of properties here.",
    "For out-of-state investors, North County offers something rare: affordable acquisition prices, strong renter demand, and measurable rent growth — all in one submarket. Entry-level single-family homes that generate $1,100–$1,400/month in rent can often be acquired for $80,000–$140,000, producing cap rates that are difficult to find in coastal markets.",
    "Luxe Property Solutions has deep roots in North County and manages properties across the corridor — from the Highway 270 belt to the Natural Bridge Road corridor. We know which blocks rent quickly, which properties need the most attention, and how to turn a vacant unit into a stabilized income-producer fast.",
  ],
  highlightsLabel: "INVESTMENT HIGHLIGHTS",
  highlightsTitle: "What Makes North County a Strong Rental Market",
  highlights: [
    {
      title: "High renter-to-owner ratio:",
      desc: "A large percentage of North County residents rent, creating consistent tenant demand with shorter vacancy periods.",
    },
    {
      title: "Affordable acquisitions:",
      desc: "Entry prices remain accessible — often 40–60% below comparable properties in South County or St. Charles — while rents have been rising steadily.",
    },
    {
      title: "Institutional validation:",
      desc: "Large national operators have invested heavily in the corridor, signaling confidence in long-term rental demand.",
    },
    {
      title: "Proximity to major employers:",
      desc: "North County is close to Boeing, Express Scripts, and multiple healthcare systems — a built-in renter base of working professionals.",
    },
    {
      title: "Rehab opportunity:",
      desc: "Many properties need light to moderate rehab before leasing — exactly where our MCS in-house construction crew gives Luxe clients a significant cost and timeline advantage.",
    },
  ],
  servicesLabel: "OUR SERVICES",
  servicesTitle: "Full-Service Property Management in North County",
  services: [
    {
      emoji: "🏗️",
      title: "Rehab & Turnover (via MCS)",
      desc: "Our in-house GC crew handles everything from light cosmetic updates to full gut rehabs — faster and cheaper than outside contractors.",
    },
    {
      emoji: "🔍",
      title: "Tenant Screening & Placement",
      desc: "Credit, background, income verification, and rental history review. We place qualified tenants — not just any tenant.",
    },
    {
      emoji: "💰",
      title: "Rent Collection & Disbursement",
      desc: "Online payment portal, automated late notices, and direct deposit to your account each month.",
    },
    {
      emoji: "🔧",
      title: "24/7 Maintenance",
      desc: "Tenants submit requests through our portal. We coordinate, supervise, and report — you just see the statement.",
    },
    {
      emoji: "📊",
      title: "Owner Portal & Reporting",
      desc: "Access financial statements, inspection reports, and maintenance logs anytime from your owner dashboard.",
    },
    {
      emoji: "📋",
      title: "Lease Compliance",
      desc: "Missouri Landlord-Tenant law compliant leases, renewals, and eviction coordination if things go sideways.",
    },
  ],
  faqLabel: "COMMON QUESTIONS",
  faqTitle: "North County Property Management FAQ",
  faqs: [
    {
      q: "How much does property management cost in North County?",
      a: "Our full-service management is 8% of monthly rent collected, with a one-time leasing/placement fee of 50% of the first month's rent. Portfolio investors (3+ units) qualify for our 7% rate. There are no hidden fees — see our full pricing page for a complete breakdown.",
    },
    {
      q: "I'm an out-of-state investor. Can you handle everything without me being there?",
      a: "Absolutely — this is our specialty. We handle inspections, maintenance, tenant communication, leasing, and reporting entirely on your behalf. Many of our North County clients are based in California, Texas, and New York and have never visited their properties.",
    },
    {
      q: "Can you help me rehab a property before it's ready to rent?",
      a: "Yes. Through Missouri Construction Service, our in-house general contracting company, we can scope, price, and complete your rehab before transitioning the property into Luxe management. This is one of our biggest differentiators — no handoffs, no markups, and a faster timeline than coordinating two separate companies.",
    },
    {
      q: "What areas of North County do you serve?",
      a: "We manage properties throughout the North County corridor including Florissant, Ferguson, Hazelwood, Jennings, Normandy, Pine Lawn, Overland, Cool Valley, Berkeley, and surrounding neighborhoods.",
    },
  ],
  formTitle: "Get a Free Rental Analysis",
  formSubtitle: "Find out what your North County property can earn",
  locationName: "North County, St. Louis",
};

export default function NorthCounty() {
  return <NeighborhoodTemplate data={data} />;
}
