// Blog post migration script — inserts all 5 IONOS blog posts into Railway MySQL
// Run with: node scripts/migrate-blog.js

import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

const DATABASE_URL =
  "mysql://root:ApVSrkImENWWbMPyPEJmMvmQqCVQsBxW@sakura.proxy.rlwy.net:59056/railway";

// ── Post bodies ─────────────────────────────────────────────────────────────

const body1 = `
<p>If you've been watching the national real estate headlines, you might think the investment story of 2026 is playing out in the Sun Belt or along the coasts. But investors who've done the actual math are increasingly pointing to a market most people overlook: St. Louis, Missouri.</p>

<p>We've been operating in this market for over 25 years. We watch the data. We talk to investors every week. And the convergence of factors we're seeing right now is genuinely unusual — the kind of market conditions that serious long-term investors recognize as a window.</p>

<div class="blog-stat-grid">
  <div class="blog-stat">
    <div class="blog-stat__num">6.1%</div>
    <div class="blog-stat__label">Rent Growth YoY</div>
  </div>
  <div class="blog-stat">
    <div class="blog-stat__num">~5.5%</div>
    <div class="blog-stat__label">Average Cap Rate</div>
  </div>
  <div class="blog-stat">
    <div class="blog-stat__num">&lt;45 days</div>
    <div class="blog-stat__label">Avg. Days to Lease</div>
  </div>
</div>

<h2>The Numbers That Matter</h2>

<p>Rent growth in the St. Louis metro came in at approximately 6.1% year-over-year through early 2026 — outpacing the national average of around 4.2%. Meanwhile, home price appreciation has remained moderate, which means the price-to-rent ratio still works in investors' favor in a way that most major metros abandoned years ago.</p>

<p>Cap rates in strong St. Louis neighborhoods are running 5%–7% on stabilized properties. Compare that to Phoenix (3.5%), Nashville (3.8%), or anything in California, and the picture becomes clear. You're getting paid to wait here.</p>

<div class="blog-callout">
  <p>"We're seeing out-of-state investors — particularly from California, Chicago, and the Northeast — closing on St. Louis properties sight unseen because the numbers are simply better than anything available in their home markets."</p>
</div>

<h2>What's Driving Demand</h2>

<h3>1. Population Growth in the Right Pockets</h3>
<p>While St. Louis City has seen some population shifts, St. Charles County — O'Fallon, Wentzville, St. Peters — is one of the fastest-growing counties in Missouri. The suburban ring around STL is absorbing significant corporate relocation demand, particularly from companies moving Midwest operations from Chicago.</p>

<h3>2. Cost of Living Advantage</h3>
<p>St. Louis consistently ranks as one of the most affordable major metros in the country. That affordability drives sustained rental demand: tenants who might otherwise buy are choosing to rent longer because the lifestyle value-per-dollar in STL is exceptional. This is a long-term structural tailwind for landlords.</p>

<h3>3. Major Anchor Employers</h3>
<p>Boeing, Centene, Edward Jones, Emerson Electric, and the region's substantial healthcare sector (BJC HealthCare, Mercy) provide a stable, high-income employment base. These employers aren't going anywhere, and they bring a consistent pool of quality tenants.</p>

<h3>4. University Demand</h3>
<p>Washington University in St. Louis, Saint Louis University, and Webster University collectively enroll tens of thousands of students and staff annually. Neighborhoods adjacent to these institutions maintain consistently low vacancy rates year over year.</p>

<h2>Where We're Seeing the Best Returns</h2>

<p>Not every St. Louis neighborhood performs the same. After 25 years in this market, here's where we're seeing investors get the strongest returns right now:</p>

<ul>
  <li><strong>North County (Florissant, Hazelwood, Jennings):</strong> Highest cash-on-cash returns, strongest rent-to-price ratios. Requires experienced management — but the numbers reward it.</li>
  <li><strong>St. Charles County (O'Fallon, Wentzville):</strong> Strongest appreciation play combined with solid cash flow. Newer construction commands premium rents from corporate tenants.</li>
  <li><strong>South City (Soulard, Bevo Mill, Tower Grove):</strong> Brick duplex country. STR opportunity is real here. Strong appreciation in gentrifying pockets.</li>
  <li><strong>Kirkwood &amp; Webster Groves:</strong> Premium single-family rentals with extremely low turnover. Lower cap rates but exceptional tenant quality and minimal vacancy.</li>
</ul>

<h2>The Out-of-State Investor's Advantage</h2>

<p>One of the reasons we built Luxe Property Solutions as part of a three-company platform — alongside Midwest Investor Services (deal sourcing) and Missouri Construction Service (rehab and GC) — is that we recognized what out-of-state investors actually need: not just a property manager, but a single trusted team that can take a property from acquisition through stabilization to long-term management.</p>

<p>An investor in Los Angeles or New York can't fly to St. Louis every time a roof needs replacing or a unit turns. They need one call. We built the infrastructure to be that one call.</p>

<div class="blog-callout">
  <p>"The investors who win in St. Louis are the ones who get in before the national press figures out this market. We're still early."</p>
</div>

<h2>What to Watch in the Second Half of 2026</h2>

<p>Interest rate movement will be the primary variable. If the Fed continues its current posture, cap rates will hold and deal flow will remain accessible. If rates drop materially, expect more competition from owner-occupants, which will compress inventory further and support rents.</p>

<p>The development pipeline in St. Charles County bears watching — significant multifamily construction is coming online in 2026–2027, which could moderate rent growth in that specific submarket. Single-family and duplex investors in those areas should underwrite conservatively.</p>

<p>On balance, St. Louis looks better today than it did two years ago, and we expect that trend to continue. The fundamentals are sound, the employment base is stable, and the price of entry remains accessible. That combination doesn't last forever.</p>
`.trim();

const body2 = `
<p>Most property management relationships end badly — not because the manager was dishonest, but because the investor asked the wrong questions before signing. After 25 years managing properties in the St. Louis metro, we've watched this play out hundreds of times. The right questions, asked upfront, separate the professional firms from the ones who'll cost you tenants, equity, and sleep.</p>

<p>Here are the 10 questions we recommend every investor ask before handing over the keys.</p>

<div class="blog-stat-grid">
  <div class="blog-stat">
    <div class="blog-stat__num">92%</div>
    <div class="blog-stat__label">Our Avg. Occupancy Rate</div>
  </div>
  <div class="blog-stat">
    <div class="blog-stat__num">&lt;2%</div>
    <div class="blog-stat__label">Annual Eviction Rate</div>
  </div>
  <div class="blog-stat">
    <div class="blog-stat__num">28 days</div>
    <div class="blog-stat__label">Avg. Days to Fill a Vacancy</div>
  </div>
</div>

<h2>The 10 Questions</h2>

<h3>1. How many units do you currently manage?</h3>
<p>Size matters — but not always the way you'd think. A firm managing 2,000 units might have systems and staff. A firm managing 150 units might offer genuine owner access and attention. What you want to avoid is the single-operator managing 400 units with no team. Ask specifically about the ratio of units to property managers on staff.</p>

<h3>2. What is your average vacancy rate, and how do you calculate it?</h3>
<p>This is a trick question — not to catch the manager lying, but to understand how they measure performance. A firm that excludes units under renovation from their vacancy calculation is telling you something about how they manage data. Get the real number: across all units, including turns, how many days per year is the average unit vacant?</p>

<h3>3. What is your eviction rate, and what's your screening process?</h3>
<p>Evictions are expensive ($3,000–$8,000 in Missouri including legal fees, lost rent, and unit damage) and emotionally taxing. A professional firm will have this number available immediately. If they have to "get back to you" on their eviction rate, that tells you everything. Follow up by asking exactly what credit score, income, and rental history criteria they screen for.</p>

<h3>4. How do you handle maintenance — in-house, preferred vendors, or owner-directed?</h3>
<p>Maintenance markups are one of the most common hidden costs in property management. Some firms mark up vendor invoices by 10%–20%. Others have in-house maintenance staff whose labor rate isn't disclosed. Ask specifically: "Do you mark up any maintenance costs?" Get this in writing in the management agreement.</p>

<div class="blog-callout">
  <p>"Maintenance markup is the hidden fee that costs investors more than the management fee itself. Ask about it explicitly, and don't accept a vague answer."</p>
</div>

<h3>5. What is included in your management fee, and what isn't?</h3>
<p>A 10% management fee that charges separately for lease renewals, vacancy fees, maintenance coordination fees, and inspection fees can easily cost 15%–18% all-in. Ask for a complete list of every fee you'll ever pay, under every scenario: tenant move-in, renewal, vacancy, maintenance coordination, eviction, and early termination.</p>

<h3>6. How do you market vacant units, and what's your typical days-on-market?</h3>
<p>In the St. Louis market, a well-priced unit in good condition should lease in under 30 days. Ask where they syndicate listings (Zillow, Realtor.com, Facebook Marketplace, local MLS), whether they offer virtual tours, and what their showing process looks like. A firm that still relies primarily on yard signs in 2026 is behind the market.</p>

<h3>7. How do you communicate with owners, and how often?</h3>
<p>Lack of communication is the #1 complaint investors have about property managers. Ask specifically: Will I have a dedicated point of contact? How quickly can I expect a response to a non-emergency question? Do you offer an owner portal where I can see financial reports, work orders, and lease documents in real time?</p>

<h3>8. Can you provide references from owners with similar properties?</h3>
<p>Ask for two or three references from investors with property types similar to yours — if you own a duplex in Florissant, ask for references from North County duplex owners, not single-family owners in Kirkwood. And actually call the references. Ask them: Would you re-sign with this firm today? Why or why not?</p>

<h3>9. What are your terms for terminating the management agreement?</h3>
<p>What happens if the relationship isn't working? Some firms have 90-day notice requirements, early termination fees, or clauses that allow them to keep tenant deposits during transition. Read the termination clause carefully before signing, and be wary of any firm that makes it difficult to leave.</p>

<h3>10. How do you handle rent collection and what's your late fee policy?</h3>
<p>Find out exactly when rent is due, what the grace period is, what the late fee structure looks like, and when the firm initiates the eviction process for non-payment. Firms that are loose on late rent enforcement often have owners who are surprised by months of unpaid rent before anything happens. Clear, consistent enforcement is essential.</p>

<h2>One More Thing: Trust Your Gut</h2>

<p>After you've asked all 10 questions, pay attention to how they answered. Did they have clear, immediate responses? Did they try to redirect or minimize any of the questions? Did they seem genuinely interested in your investment goals, or were they already mentally moving on to closing the deal?</p>

<p>A professional property management firm will welcome every one of these questions. They've heard them before, they have good answers, and they know that investors who ask hard questions make better long-term clients.</p>

<p>If you're evaluating property management for a St. Louis investment, we'd welcome the conversation. Ask us every one of these questions — we'll answer all of them.</p>
`.trim();

const body3 = `
<p>It's one of the most common questions we get from St. Louis investors: "Should I run this as a short-term rental or a long-term rental?" The honest answer depends on the property, the neighborhood, and your tolerance for active management. The useful answer requires real numbers — so we ran them.</p>

<p>We took two comparable properties — both 3-bedroom, 2-bath single-family homes in South City St. Louis — and managed one as a traditional long-term rental and one as an Airbnb for a full 12-month period. Here's what we found.</p>

<div class="blog-stat-grid">
  <div class="blog-stat">
    <div class="blog-stat__num">$24,800</div>
    <div class="blog-stat__label">STR Gross Revenue / Year</div>
  </div>
  <div class="blog-stat">
    <div class="blog-stat__num">$18,600</div>
    <div class="blog-stat__label">LTR Gross Revenue / Year</div>
  </div>
  <div class="blog-stat">
    <div class="blog-stat__num">$3,200</div>
    <div class="blog-stat__label">STR Extra Annual Expenses</div>
  </div>
</div>

<h2>The Revenue Picture</h2>

<p>The STR property generated approximately $24,800 in gross revenue over the 12 months. The LTR property at $1,550/month generated $18,600 in gross rent. On the surface, the STR wins by more than $6,000.</p>

<p>But gross revenue isn't net income. And that's where the comparison gets more interesting.</p>

<h2>The Expense Reality</h2>

<h3>Short-Term Rental Costs</h3>
<p>Running a short-term rental in St. Louis involves real ongoing costs that don't exist for long-term rentals:</p>
<ul>
  <li><strong>Platform fees (Airbnb, VRBO):</strong> Typically 3%–5% of revenue, or roughly $800–$1,200/year on our test property</li>
  <li><strong>Cleaning between every stay:</strong> At $85–$120 per turnover and an average of 28 stays/year, that's $2,400–$3,360 annually</li>
  <li><strong>Supplies and consumables:</strong> Toiletries, paper goods, kitchen supplies — budget $600–$900/year</li>
  <li><strong>Higher utility costs:</strong> Internet, higher electric and water usage — $1,200–$1,800/year</li>
  <li><strong>Accelerated wear and turnover maintenance:</strong> Furniture replacement, deep cleans, minor repairs — $1,000–$2,000/year</li>
  <li><strong>STR management fees:</strong> If you use a management company (which most investors should), fees run 20%–30% of revenue vs. 8%–12% for LTR</li>
</ul>

<div class="blog-callout">
  <p>"When we subtract all STR-specific costs, the net income advantage over a well-managed long-term rental narrows to about $1,500–$2,500 per year — for dramatically more complexity and management involvement."</p>
</div>

<h2>Where Short-Term Rentals Win</h2>

<h3>Appreciation Neighborhoods</h3>
<p>In South City neighborhoods like Soulard, Tower Grove, and Lafayette Square, STR demand is strong enough that a well-positioned property can consistently exceed the numbers above. These neighborhoods draw Cardinals fans, Blues fans, conference travelers, and weekend leisure visitors. Occupancy rates on quality properties run 70%–80%.</p>

<h3>Flexibility</h3>
<p>If you want to use the property occasionally, or if you're not ready to commit to a 12-month lease cycle, STR gives you that option. Many investors use STR as a bridge strategy while a neighborhood appreciates, then convert to LTR as gross rents catch up.</p>

<h3>Furnished Properties</h3>
<p>If you're buying a property that comes furnished, or if you're willing to invest in quality furnishings, STR can generate a significant premium. Furnished long-term rentals (30+ day stays, not traditional Airbnb) are also a strong middle-ground strategy that carries lower operational costs than nightly STR.</p>

<h2>Where Long-Term Rentals Win</h2>

<h3>Consistency and Predictability</h3>
<p>A long-term tenant paying $1,550/month for 12 months is $18,600 you can bank on. STR revenue is seasonal — December and January in St. Louis are slow, and a bad review at the wrong time can crater your occupancy. For investors who want reliable cash flow to service debt, LTR wins.</p>

<h3>North County and St. Charles Properties</h3>
<p>STR demand is highly location-specific. In Florissant, Hazelwood, or Wentzville, the STR market is thin. These markets are LTR markets, full stop. Trying to force an STR strategy in a non-tourist area is a recipe for low occupancy and frustration.</p>

<h3>Lower Management Intensity</h3>
<p>A good long-term tenant managed by a professional firm requires almost no active involvement from the owner. STR is the opposite — it's closer to running a hotel. If you have a full-time job or manage properties remotely, LTR is almost always the right choice without a dedicated STR manager.</p>

<h2>The Verdict</h2>

<p>For most St. Louis investors, especially those with properties outside the STR-friendly neighborhoods (Soulard, Tower Grove, The Hill, downtown), long-term rentals deliver better risk-adjusted returns. The revenue premium from STR is real but smaller than it looks once you account for all costs, and the operational complexity is significantly higher.</p>

<p>For investors with the right property in the right neighborhood — and either the time or the right management partner to handle it — STR can meaningfully outperform. The key is running the real numbers on your specific property before deciding.</p>

<p>Our team at Luxe Property Solutions manages both strategies in the St. Louis market. If you'd like a side-by-side analysis for a specific property you're evaluating, we're happy to run it with you.</p>
`.trim();

const body4 = `
<p>Every rehab investor has a renovation horror story: the bathroom remodel that cost $14,000 and added $75/month in rent, or the kitchen overhaul that brought in tenants who loved the countertops but still paid the same rent as the unit next door with laminate. Understanding which renovations actually move the rent needle — and which ones are satisfying but financially pointless — is one of the most valuable things an experienced St. Louis property manager can offer.</p>

<p>We pulled data from our managed portfolio to give you real numbers on which upgrades generate the best return-on-investment for rental properties in the St. Louis market.</p>

<div class="blog-stat-grid">
  <div class="blog-stat">
    <div class="blog-stat__num">$125–$175</div>
    <div class="blog-stat__label">Monthly Rent Lift: Kitchen Refresh</div>
  </div>
  <div class="blog-stat">
    <div class="blog-stat__num">$75–$125</div>
    <div class="blog-stat__label">Monthly Rent Lift: Bath Update</div>
  </div>
  <div class="blog-stat">
    <div class="blog-stat__num">$50–$100</div>
    <div class="blog-stat__label">Monthly Rent Lift: LVP Flooring</div>
  </div>
</div>

<h2>The Renovations That Actually Pencil</h2>

<h3>Kitchen Refresh (Not Full Remodel): ROI ★★★★★</h3>
<p>A full kitchen gut costs $15,000–$30,000 in St. Louis and rarely justifies itself in a rental. A kitchen <em>refresh</em> — paint cabinets, replace hardware, install a new faucet, add a tile backsplash, and update the light fixture — runs $2,500–$5,000 and consistently generates $125–$175/month in additional rent. At $150/month, that's $1,800/year on a $4,000 investment. You've recovered your money in 26 months, and every month after is pure return.</p>

<h3>Luxury Vinyl Plank (LVP) Flooring: ROI ★★★★★</h3>
<p>Carpet is the enemy of rental margins. It shows every stain, requires full replacement every 3–5 years, and signals a lower-quality unit to prospective tenants. LVP flooring ($3–$5/sq ft installed for entry-level, $5–$8/sq ft for better products) transforms a unit's appearance, holds up under heavy tenant use, and justifies rent premiums of $50–$100/month. In a 1,000 sq ft unit, a full LVP install runs $4,000–$6,000 and pays itself back in under 5 years while dramatically reducing future flooring replacement costs.</p>

<div class="blog-callout">
  <p>"In our experience, LVP flooring and a kitchen refresh together are the single highest-ROI combination available to St. Louis rental investors. Budget $8,000–$12,000, raise rent $200–$250/month, and you've recovered your investment in under 5 years."</p>
</div>

<h3>Bathroom Update: ROI ★★★★</h3>
<p>A bathroom that looks dated — old vanity, builder-grade toilet, brass fixtures, dingy tile — is a significant deterrent to quality tenants. A targeted update (new vanity $250–$450, new toilet $150–$250, new fixtures $100–$200, fresh caulk and paint) can run as little as $800–$1,500 for a meaningful visual improvement. This generates $75–$125/month in rental premium and has an excellent payback period. Full tile replacement ($3,000–$6,000) has a much longer payback — only pursue it if the existing tile is cracked, molded, or genuinely beyond refreshing.</p>

<h3>Fresh Paint (Neutral Colors): ROI ★★★★</h3>
<p>This sounds obvious, but we consistently see investors leave money on the table with dated wall colors (mauve, hunter green, builder beige). A full interior repaint at $1,200–$2,500 for a typical St. Louis rental refreshes the unit, photographs better for listings, and contributes 5%–8% to gross rental rate — which on a $1,400/month unit is $70–$112/month. The payback period is under 2 years. Use Benjamin Moore Pale Oak, Repose Gray, or similar warm neutrals. Do not use white — it shows every scuff.</p>

<h2>The Renovations That Don't Pencil (Usually)</h2>

<h3>Full Kitchen Gut: ROI ★★</h3>
<p>At $15,000–$30,000, a full kitchen replacement is almost never justified in a St. Louis rental. The rent premium over a refreshed kitchen is typically zero to minimal — tenants care that the kitchen looks clean and modern, not that the cabinets are solid wood vs. painted plywood. Reserve full gut remodels for properties where the kitchen is structurally compromised or actively deterring tenants (the ceiling is falling in, the cabinets are non-functional, etc.).</p>

<h3>Granite or Quartz Countertops: ROI ★★</h3>
<p>Tenants love granite. Granite does not appreciably increase rent in most St. Louis rental price points. At $50–$80/sq ft installed for quartz, a typical kitchen runs $2,500–$4,000 in countertops alone. The rent lift is $0–$50/month. Use butcher block ($30–$50/sq ft) or quality laminate ($20–$35/sq ft) instead. Save stone countertops for luxury properties where the tenant pool expects them.</p>

<h3>In-Unit Washer/Dryer: ROI ★★★</h3>
<p>In-unit laundry is genuinely valued by tenants and can support a $75–$100/month rent premium in many St. Louis markets. The challenge is installation cost ($800–$1,500 for hookups if not already present, plus $600–$1,000 for appliances) and replacement cost when units fail. In buildings where you're competing with units that have in-unit laundry, it's worth it. In single-family homes where the competition doesn't have it, you may not need it.</p>

<h2>The Renovation Sequencing Rule</h2>

<p>Before you renovate anything, answer one question: what is the current market rent for this unit, and what could it command at its best possible condition? If the gap is less than $150/month, focus on cosmetic improvements only. If the gap is $200+/month, more substantial work may justify the investment.</p>

<p>Our team at Missouri Construction Service handles rehab and renovation work across the St. Louis metro, and our property management team at Luxe Property Solutions can give you an honest assessment of what a renovated unit would rent for before you spend a dollar. That's the analysis you need before picking up a hammer.</p>
`.trim();

const body5 = `
<p>A bad tenant can cost you $8,000–$15,000 by the time it's over. That's not a scare number — it's a realistic accounting of unpaid rent, legal fees, court costs, property damage beyond the security deposit, and the carrying costs during a 60–90 day eviction process. We know this because we see it happen to investors who cut corners on screening.</p>

<p>The good news: bad tenants are almost always identifiable before they move in. They leave fingerprints in their application, their credit report, their rental history, and the way they interact with your office. Here's the 5-step process we use on every single application.</p>

<div class="blog-stat-grid">
  <div class="blog-stat">
    <div class="blog-stat__num">&lt;2%</div>
    <div class="blog-stat__label">Our Eviction Rate</div>
  </div>
  <div class="blog-stat">
    <div class="blog-stat__num">3x</div>
    <div class="blog-stat__label">Income-to-Rent Minimum</div>
  </div>
  <div class="blog-stat">
    <div class="blog-stat__num">620+</div>
    <div class="blog-stat__label">Minimum Credit Score</div>
  </div>
</div>

<h2>Step 1: Pre-Screen Before the Showing</h2>

<p>Most property managers show the unit first, collect the application second. We reverse the order — not entirely, but enough to save significant time and reveal red flags early. Before scheduling a showing, we ask every prospective tenant three questions:</p>

<ul>
  <li>What is your approximate monthly household income?</li>
  <li>Have you had any evictions in the past 7 years?</li>
  <li>When are you looking to move in?</li>
</ul>

<p>These questions filter out the most obvious non-qualifiers without requiring a formal application. An applicant who can't answer the income question clearly, who discloses an eviction without context, or whose move-in timeline doesn't match the unit's availability has already shown you something. You haven't rejected them — you've just gathered information that the formal application will confirm or explain.</p>

<h2>Step 2: Credit and Background Check</h2>

<p>We run a full credit report and background check through a professional tenant screening service on every applicant. Our minimum thresholds:</p>

<ul>
  <li><strong>Credit score:</strong> 620 minimum. We look at the score and the story — a 580 score from medical debt tells a different story than a 580 from multiple evictions and unpaid utilities.</li>
  <li><strong>Eviction history:</strong> Any eviction within the past 5 years is an automatic decline. Court filings that didn't result in a judgment (i.e., the tenant paid and the landlord withdrew) are evaluated in context.</li>
  <li><strong>Criminal background:</strong> We follow HUD fair chance housing guidelines and evaluate on a case-by-case basis for criminal records, with blanket disqualification only for specific offense categories.</li>
</ul>

<div class="blog-callout">
  <p>"Credit score alone tells you surprisingly little. The composition of debt — medical, student loans, credit cards, utilities, prior rent — tells you much more about how a tenant will treat their rental obligations."</p>
</div>

<h2>Step 3: Income Verification</h2>

<p>Our minimum income standard is 3x the monthly rent. For a $1,400/month unit, that means $4,200/month in gross documented income. We verify income through:</p>

<ul>
  <li>Last two pay stubs (W-2 employed applicants)</li>
  <li>Last two years of tax returns (self-employed applicants)</li>
  <li>Bank statements showing 3 months of consistent deposits (gig workers, contractors)</li>
  <li>Benefit award letters for Social Security, disability, or housing voucher holders</li>
</ul>

<p>We are Section 8 / HCV participants and have extensive experience processing voucher holders, who in our experience are among our most stable tenants. The voucher essentially guarantees a portion of the rent regardless of the tenant's employment situation.</p>

<h2>Step 4: Rental History Verification</h2>

<p>This is the step most landlords skip because it's the most time-consuming. It's also the most predictive. We contact every previous landlord listed on the application — not just the most recent one — and ask four specific questions:</p>

<ul>
  <li>Did the tenant pay rent on time?</li>
  <li>Did they give proper notice before moving out?</li>
  <li>Was the unit left in good condition?</li>
  <li>Would you rent to them again?</li>
</ul>

<p>That last question is the tell. A landlord who lists only positives but hesitates on "would you rent to them again" is signaling something. We probe until we understand why.</p>

<p>One important note: if an applicant lists their current address but provides a landlord reference who sounds suspiciously like a friend or family member, that's worth investigating. We cross-reference addresses against property records when something feels off.</p>

<h2>Step 5: Move-In Inspection and Documentation</h2>

<p>Screening doesn't end when the lease is signed. The move-in inspection — photographed, documented in detail, signed by both parties — is the final step in setting the right tone for the tenancy. A thorough move-in inspection:</p>

<ul>
  <li>Establishes the baseline condition clearly, with no room for dispute at move-out</li>
  <li>Sets a professional tone that tenants respond to — people treat carefully documented properties differently than informal arrangements</li>
  <li>Protects your ability to retain the security deposit for legitimate damages at move-out</li>
</ul>

<h2>The Non-Negotiables</h2>

<p>No matter how charming an applicant is in person, we never waive the income verification or the landlord reference check. The most convincing prospective tenants are sometimes the ones with the most experience convincing landlords to skip steps. A professional screening process isn't a bureaucratic obstacle — it's your first line of defense against a $15,000 mistake.</p>

<p>If you'd like to learn more about how we handle tenant placement for our managed properties, or if you're looking for a property management partner who takes screening this seriously, we'd welcome a conversation.</p>
`.trim();

// ── Posts array ──────────────────────────────────────────────────────────────

const posts = [
  {
    id: randomUUID(),
    title: "Why St. Louis Is the Midwest's Best Market for Real Estate Investors in 2026",
    slug: "stl-real-estate-investing-2026",
    excerpt: "Rent growth outpacing the national average, inventory at historic lows, and cap rates that coastal markets haven't seen in a decade.",
    body: body1,
    category: "Market Update",
    status: "published",
    publishedAt: new Date("2026-05-08"),
  },
  {
    id: randomUUID(),
    title: "10 Questions to Ask Before Hiring a Property Manager in St. Louis",
    slug: "choosing-property-manager-stl",
    excerpt: "Most investors hire the wrong manager because they ask the wrong questions. Here's the exact checklist we recommend.",
    body: body2,
    category: "Property Management",
    status: "published",
    publishedAt: new Date("2026-04-22"),
  },
  {
    id: randomUUID(),
    title: "STR vs. Long-Term Rental in St. Louis: Which Strategy Makes More Money?",
    slug: "str-vs-ltr-stl",
    excerpt: "We ran the numbers on identical properties managed both ways. The results might surprise you.",
    body: body3,
    category: "Short-Term Rental",
    status: "published",
    publishedAt: new Date("2026-03-28"),
  },
  {
    id: randomUUID(),
    title: "Which Renovations Actually Increase Rent in St. Louis? A Data-Driven Look",
    slug: "rehab-roi-stl",
    excerpt: "Not all upgrades are created equal. We break down ROI on kitchens, bathrooms, flooring, and more — based on real St. Louis data.",
    body: body4,
    category: "Rehab & Renovation",
    status: "published",
    publishedAt: new Date("2026-03-14"),
  },
  {
    id: randomUUID(),
    title: "The 5-Step Tenant Screening Process We Use on Every Single Application",
    slug: "tenant-screening-guide",
    excerpt: "A bad tenant can cost you $8,000–$15,000. Here's the exact process that keeps our eviction rate below 2%.",
    body: body5,
    category: "Tenant Management",
    status: "published",
    publishedAt: new Date("2026-02-27"),
  },
];

// ── Run migration ────────────────────────────────────────────────────────────

async function run() {
  const conn = await mysql.createConnection(DATABASE_URL);
  console.log("Connected to Railway MySQL");

  for (const post of posts) {
    // Check if slug already exists
    const [existing] = await conn.execute(
      "SELECT id FROM blogPosts WHERE slug = ?",
      [post.slug]
    );
    if (existing.length > 0) {
      console.log(`  SKIP  ${post.slug} (already exists)`);
      continue;
    }

    await conn.execute(
      `INSERT INTO blogPosts (id, title, slug, excerpt, body, category, status, publishedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        post.id,
        post.title,
        post.slug,
        post.excerpt,
        post.body,
        post.category,
        post.status,
        post.publishedAt,
      ]
    );
    console.log(`  INSERT ${post.slug}`);
  }

  await conn.end();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
