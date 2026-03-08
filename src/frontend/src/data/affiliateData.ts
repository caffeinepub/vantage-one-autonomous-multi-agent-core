// ── Affiliate Intelligence Data ────────────────────────────────────────────
// All niche and offer data lives here in the frontend.
// The AI picks the best options autonomously based on scores.

export interface Niche {
  id: string;
  name: string;
  demandScore: number;
  avgPayout: string;
}

export interface AffiliateOffer {
  id: string;
  nicheId: string;
  name: string;
  network: "ClickBank" | "JVZoo" | "WarriorPlus";
  score: number;
  payout: string;
  description: string;
}

export interface FunnelPlan {
  steps: string[];
}

export interface SalesCopy {
  headline: string;
  subheadline: string;
  bullets: string[];
  cta: string;
}

export interface TrafficPlan {
  keywords: string[];
  videoHooks: string[];
  channels: string[];
}

export interface CampaignResult {
  id: string;
  timestamp: number;
  niche: Niche;
  offer: AffiliateOffer;
  funnel: FunnelPlan;
  copy: SalesCopy;
  traffic: TrafficPlan;
}

// ── Static Data ──────────────────────────────────────────────────────────────

export const NICHES: Niche[] = [
  { id: "n1", name: "Weight Loss", demandScore: 95, avgPayout: "$30-$60" },
  {
    id: "n2",
    name: "Make Money Online",
    demandScore: 90,
    avgPayout: "$40-$80",
  },
  { id: "n3", name: "Keto Diet", demandScore: 88, avgPayout: "$35-$65" },
  {
    id: "n4",
    name: "Forex & Crypto Trading",
    demandScore: 85,
    avgPayout: "$50-$100",
  },
  {
    id: "n5",
    name: "Health Supplements",
    demandScore: 82,
    avgPayout: "$35-$75",
  },
  {
    id: "n6",
    name: "Relationship Advice",
    demandScore: 80,
    avgPayout: "$25-$50",
  },
  {
    id: "n7",
    name: "Survival & Prepping",
    demandScore: 75,
    avgPayout: "$30-$55",
  },
  { id: "n8", name: "Golf Training", demandScore: 70, avgPayout: "$40-$70" },
];

export const OFFERS: AffiliateOffer[] = [
  {
    id: "o1",
    nicheId: "n1",
    name: "JavaBurn",
    network: "ClickBank",
    score: 90,
    payout: "$42",
    description:
      "Morning coffee metabolism booster — top gravity product in weight loss",
  },
  {
    id: "o2",
    nicheId: "n1",
    name: "BioFit Probiotic",
    network: "ClickBank",
    score: 82,
    payout: "$46",
    description: "Probiotic weight loss formula with recurring commissions",
  },
  {
    id: "o3",
    nicheId: "n2",
    name: "Perpetual Income 365",
    network: "ClickBank",
    score: 88,
    payout: "$50",
    description: "Automated affiliate income system — beginner friendly",
  },
  {
    id: "o4",
    nicheId: "n2",
    name: "Legendary Marketer",
    network: "JVZoo",
    score: 85,
    payout: "$60",
    description:
      "Premium digital marketing education with high-ticket commissions",
  },
  {
    id: "o5",
    nicheId: "n3",
    name: "Custom Keto Diet",
    network: "ClickBank",
    score: 87,
    payout: "$44",
    description:
      "Personalized keto meal plans — massive market with strong demand",
  },
  {
    id: "o6",
    nicheId: "n3",
    name: "Keto Breads",
    network: "ClickBank",
    score: 75,
    payout: "$28",
    description: "Keto-friendly bread recipes — supplements main keto market",
  },
  {
    id: "o7",
    nicheId: "n4",
    name: "Crypto Ultimatum",
    network: "ClickBank",
    score: 80,
    payout: "$55",
    description: "Crypto trading system for beginners — high demand product",
  },
  {
    id: "o8",
    nicheId: "n4",
    name: "Forex Fury",
    network: "JVZoo",
    score: 78,
    payout: "$48",
    description: "Automated forex trading bot with consistent results",
  },
  {
    id: "o9",
    nicheId: "n5",
    name: "GlucoTrust",
    network: "ClickBank",
    score: 83,
    payout: "$38",
    description:
      "Blood sugar support supplement — strong testimonials and social proof",
  },
  {
    id: "o10",
    nicheId: "n5",
    name: "ProDentim",
    network: "ClickBank",
    score: 80,
    payout: "$41",
    description:
      "Oral health probiotic — trending health niche with repeat buyers",
  },
  {
    id: "o11",
    nicheId: "n6",
    name: "His Secret Obsession",
    network: "ClickBank",
    score: 85,
    payout: "$35",
    description: "Relationship guide for women — emotional triggers course",
  },
  {
    id: "o12",
    nicheId: "n6",
    name: "The Ex Factor Guide",
    network: "ClickBank",
    score: 76,
    payout: "$30",
    description: "Get ex back system — high conversion landing page",
  },
  {
    id: "o13",
    nicheId: "n7",
    name: "Alive After The Fall",
    network: "ClickBank",
    score: 79,
    payout: "$38",
    description: "Survival prepping guide — passionate buyer market",
  },
  {
    id: "o14",
    nicheId: "n7",
    name: "Family Survival System",
    network: "ClickBank",
    score: 72,
    payout: "$32",
    description: "Emergency preparedness for families — evergreen market",
  },
  {
    id: "o15",
    nicheId: "n8",
    name: "Simple Senior Swing",
    network: "ClickBank",
    score: 77,
    payout: "$45",
    description: "Golf swing improvement for seniors — loyal buyer base",
  },
  {
    id: "o16",
    nicheId: "n8",
    name: "Lag Shot Golf Training",
    network: "JVZoo",
    score: 71,
    payout: "$40",
    description:
      "Physical training aid for golf distance — premium price point",
  },
];

// ── Agent Intelligence Functions ──────────────────────────────────────────────

export function pickBestNiche(): Niche {
  return NICHES.reduce((best, n) =>
    n.demandScore > best.demandScore ? n : best,
  );
}

export function pickBestOffer(nicheId: string): AffiliateOffer {
  const nicheOffers = OFFERS.filter((o) => o.nicheId === nicheId);
  return nicheOffers.reduce((best, o) => (o.score > best.score ? o : best));
}

export function buildFunnelSteps(
  niche: Niche,
  offer: AffiliateOffer,
): FunnelPlan {
  return {
    steps: [
      `TRAFFIC: Publish SEO content targeting "${niche.name} without pills" and "best ${niche.name} system" — capture buyers already searching for solutions`,
      `BRIDGE: Pre-sell page — "The ${niche.name} discovery quietly helping thousands: An honest look at ${offer.name}" — warm readers before the affiliate click`,
      `CONVERT: Affiliate redirect to ${offer.name} on ${offer.network} — ${offer.payout} commission per sale on a proven high-converting vendor page`,
    ],
  };
}

export function buildCopy(niche: Niche, offer: AffiliateOffer): SalesCopy {
  return {
    headline: `The Surprising ${niche.name} Method Behind ${offer.name}'s Explosive Growth`,
    subheadline: `Thousands are quietly switching after traditional ${niche.name} approaches keep failing — here's the real reason why`,
    bullets: [
      `Works even if you've already tried every other ${niche.name} solution with no results`,
      `No complicated setup — ${offer.name} handles the heavy lifting automatically`,
      `Proven track record on ${offer.network} with real buyers and a money-back guarantee`,
    ],
    cta: `Get Instant Access to ${offer.name}`,
  };
}

export function buildTrafficPlan(niche: Niche): TrafficPlan {
  return {
    keywords: [
      `best ${niche.name} system that actually works`,
      `${niche.name} results without expensive programs`,
      `how to start ${niche.name} from scratch`,
      `${niche.name} tips for beginners 2025`,
      `fastest ${niche.name} method proven results`,
    ],
    videoHooks: [
      `I tried every ${niche.name} program for 90 days — here's what actually worked`,
      `The ${niche.name} mistake 90% of people make (and how to fix it fast)`,
      `Why this ${niche.name} method is going viral — my honest breakdown`,
    ],
    channels: [
      `Pinterest — visual ${niche.name} content drives massive evergreen free traffic from buyers`,
      `YouTube Shorts — short review videos rank fast for ${niche.name} buyer-intent keywords`,
    ],
  };
}

export function runAutonomousCampaign(): CampaignResult {
  const niche = pickBestNiche();
  const offer = pickBestOffer(niche.id);
  const funnel = buildFunnelSteps(niche, offer);
  const copy = buildCopy(niche, offer);
  const traffic = buildTrafficPlan(niche);

  return {
    id: `campaign-${Date.now()}`,
    timestamp: Date.now(),
    niche,
    offer,
    funnel,
    copy,
    traffic,
  };
}

// ── localStorage Helpers ─────────────────────────────────────────────────────

const LS_KEY = "vantage_campaigns";

export function loadCampaigns(): CampaignResult[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CampaignResult[];
  } catch {
    return [];
  }
}

export function saveCampaigns(campaigns: CampaignResult[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(campaigns));
  } catch {
    // ignore storage errors
  }
}
