# Vantage One – Autonomous Multi-Agent Core

## Current State

The app has a backend with four hollow agents (Habit, Affiliate, Copy, Analytics) that do nothing except write a timestamp log and a generic "completed task" string to the knowledge core. The frontend has a dashboard but shows no real output because the agents produce no real data. The user must manually add offers and trigger agents — nothing is autonomous.

## Requested Changes (Diff)

### Add

- **Niche database** — a curated list of 10+ high-demand affiliate niches with metadata (category, demand score, competition level, avg payout range)
- **Offer database** — a built-in set of realistic affiliate offers per niche (name, network, niche, gravity/score, payout, description) stored in backend state — no external API needed
- **AffiliateAgent real logic** — autonomously picks the top niche by demand score, selects the highest-scoring offer from that niche, stores result in knowledge core with structured data
- **FunnelAgent** — takes the selected offer and builds a 3-step funnel plan (traffic source → bridge/presell → offer redirect), stores as structured knowledge entry
- **CopyAgent** — generates a headline, subheadline, 3 bullet points, and CTA for the selected offer, stores as structured knowledge entry
- **TrafficAgent** — generates 5 SEO keywords, 3 short-form video hook ideas, and 2 organic channel recommendations for the niche, stores as structured knowledge entry
- **runAutonomousCampaign** — single public function that runs all 4 agents in sequence, returns a CampaignResult with: selected niche, selected offer (name, network, payout), funnel plan, copy, traffic plan, and timestamp
- **getCampaignResults** — returns all past campaign results for the caller
- **getLatestCampaignResult** — returns the most recent campaign result
- **CampaignResult type** — structured record: niche, offerName, offerNetwork, offerPayout, funnelSteps [text], headline, bullets [text], keywords [text], trafficChannels [text], runAt timestamp

### Modify

- **runAllAgents** — wire it to call runAutonomousCampaign internally
- **Knowledge core entries** — store real structured content from each agent (not just "Agent completed task")
- **automationStatus** — track running=true while agents are executing, running=false when done, with proper lastRun timestamp

### Remove

- Hollow log-only agent internals (runHabitAgentInternal, runAffiliateAgentInternal, runCopyAgentInternal, runAnalyticsAgentInternal) — replace with real logic
- Manual offer entry requirement — agents pick offers from the built-in database autonomously

## Implementation Plan

1. Add NicheEntry and OfferEntry types to backend
2. Populate built-in niche and offer arrays (hardcoded seed data in backend state)
3. Implement real AffiliateAgent logic: rank niches by demand, pick top offer
4. Implement FunnelAgent: build 3-step funnel plan from selected offer
5. Implement CopyAgent: generate headline, bullets, CTA from offer data
6. Implement TrafficAgent: generate SEO keywords and content hooks for niche
7. Add CampaignResult type and campaignResults store (Map keyed by caller + timestamp)
8. Add runAutonomousCampaign public function orchestrating all agents and returning CampaignResult
9. Add getCampaignResults and getLatestCampaignResult query functions
10. Update runAllAgents to call runAutonomousCampaign
11. Fix automationStatus to reflect running=true during execution
12. Frontend: replace "Network idle, standing by" with a live campaign launcher that shows results — selected offer card, funnel steps, copy block, traffic plan — updated after each run
13. Frontend: show campaign history list with past results
14. Frontend: no manual offer entry required on the main dashboard — fully autonomous one-button operation
