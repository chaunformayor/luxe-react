import NeighborhoodTemplate, { NeighborhoodData } from "@/components/NeighborhoodTemplate";

const data: NeighborhoodData = {
  badge: "SOUTH CITY & SOUTH COUNTY, ST. LOUIS",
  headline: "Property Management in",
  headlineGold: "South City & South County",
  subtitle:
    "South St. Louis City and South St. Louis County offer some of the metro's most diverse rental opportunities — from affordable brick SFR and duplex stock in City South to the family-friendly suburbs of South County. Luxe Property Solutions manages the full spectrum.",
  stats: [
    { value: "$1,250+", label: "Avg. Rent (City South)" },
    { value: "$1,400+", label: "Avg. Rent (South County)" },
    { value: "Diverse", label: "Neighborhood Profiles" },
    { value: "Strong", label: "Brick SFR & Duplex Stock" },
  ],
  marketLabel: "THE MARKET",
  marketTitle: "South St. Louis: Two Markets, One Management Partner",
  marketBody: [
    "South St. Louis City — encompassing neighborhoods like Soulard, Tower Grove, Bevo, Dutchtown, and Carondelet — is one of the most interesting rental markets in the metro. The area offers affordable acquisition prices, strong renter demand, and an increasingly eclectic tenant base. The characteristic brick SFR and duplex stock provides landlords with durable assets that, when properly maintained, generate consistent cash flow.",
    "South St. Louis County — including municipalities like Affton, Mehlville, Oakville, Fenton, Crestwood, and Sunset Hills — offers a more suburban profile with strong school districts, lower crime, and a tenant base of working families and professionals. Rents in South County have risen steadily as tenants priced out of more expensive suburbs find the area's combination of value and amenity hard to beat.",
    "Luxe Property Solutions manages properties across both South City and South County — giving landlords a single, experienced management partner regardless of which side of I-270 they invest in. Our affiliate Missouri Construction Service handles rehab and turnover work across the entire south corridor.",
  ],
  highlightsLabel: "INVESTMENT HIGHLIGHTS",
  highlightsTitle: "What Makes South St. Louis a Smart Rental Market",
  highlights: [
    {
      title: "Affordable South City acquisition prices:",
      desc: "Brick SFR and duplex properties in City South remain among the most affordable per-door in the metro while generating rent-to-price ratios that pencil for cash flow investors.",
    },
    {
      title: "Rising South County rents:",
      desc: "South County has absorbed significant demand from tenants displaced by rising costs elsewhere — producing consistent rent growth in communities like Affton, Mehlville, and Oakville.",
    },
    {
      title: "Diverse tenant base:",
      desc: "City South attracts young professionals and creatives; South County draws families and working households — giving the corridor a broad and resilient renter pool.",
    },
    {
      title: "Durable brick stock:",
      desc: "The South City duplex and SFR inventory is primarily brick construction — lower long-term maintenance costs and strong durability compared to newer frame construction.",
    },
    {
      title: "Proximity to major employment:",
      desc: "South City and South County are well-connected to major employers via I-44, I-55, and I-270 — ensuring steady commuter-renter demand.",
    },
  ],
  faqLabel: "COMMON QUESTIONS",
  faqTitle: "South St. Louis Property Management FAQ",
  faqs: [
    {
      q: "Do you manage duplexes and small multifamily in South City?",
      a: "Yes — duplexes and small multifamily are a significant part of our portfolio. We manage properties with up to 20 units and can handle properties with both occupied and vacant units as we stabilize them.",
    },
    {
      q: "What South County communities do you serve?",
      a: "We manage properties throughout South St. Louis County including Affton, Mehlville, Oakville, Fenton, Crestwood, Sunset Hills, Lemay, Concord, and surrounding areas. If you're not sure whether we cover your specific location, just reach out.",
    },
    {
      q: "I have a property in South City that needs work before it's rent-ready. Can you help?",
      a: "Absolutely — this is one of our core strengths. Through Missouri Construction Service, our in-house GC company, we can scope and execute the rehab, then transition the property directly into Luxe management. No handoffs, no markups on contractor work, and a faster timeline than coordinating separately.",
    },
    {
      q: "Are South City rents still growing?",
      a: "Yes. While South City has historically offered lower rents than suburban markets, the corridor has seen increasing demand from tenants priced out of Midtown and the Central West End — and from young professionals attracted to the neighborhood character of areas like Soulard, Tower Grove South, and Bevo. Updated properties in these neighborhoods are achieving rents well above the neighborhood average.",
    },
  ],
  formTitle: "Free Rental Analysis",
  formSubtitle: "Find out what your South St. Louis property can earn",
  locationName: "South St. Louis",
};

export default function SouthCity() {
  return <NeighborhoodTemplate data={data} />;
}
