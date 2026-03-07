# Vantage One – Autonomous Multi-Agent Core

## Current State

The app has a Motoko backend with:
- Agent management (habit, affiliate, copy, analytics)
- Automation status and logs per agent
- Offer management (add/get offers via admin)
- Offer performance metrics (clicks, conversion rate, revenue) — stored on-chain
- Knowledge core (entries written per agent run)
- Clone protection / monetization settings
- Stripe integration skeleton
- Authorization (admin/user roles)

The frontend has:
- Dashboard.tsx with 4 tabs (Agents, Intelligence, System, Admin)
- AgentsDashboard: agent cards with run buttons, log viewer, simulated progress
- AdminDashboard: revenue metrics, affiliate offers overview, settings (clone protection, price, demo mode)
- AffiliatePerformance: offer performance table
- NetworkVisualization: animated canvas showing agent nodes
- CollectiveIntelligence: knowledge core entries viewer
- SystemMonitor: system metrics / logs

Problems identified:
1. Agents just write meaningless log strings ("HabitAgent executed at...") — nothing meaningful displayed
2. Offer metrics are empty because no offers or metrics have ever been added
3. The "runs" counter always shows 1 (totalExecutions is hardcoded to 1 in each agent run)
4. No way to enter ClickBank/JVZoo API keys in the app (user was sharing keys in chat — dangerous)
5. Dashboard feels static and uninspiring
6. No "Add Offer" UI for the admin to create offers and seed metrics manually
7. No niche input or funnel trigger — the system has no entry point for the user to start a campaign

## Requested Changes (Diff)

### Add
- **API Keys Settings panel** in Admin tab: secure form for entering ClickBank API key and JVZoo API key + secret. Keys stored in browser localStorage only (frontend-side, not sent to backend since backend doesn't use them yet). Show masked/hidden inputs with toggle visibility.
- **Add Offer form** in Admin tab: productId, price, commission rate, niche/name. Admin can add real offers to track.
- **Add Offer Metrics form**: after adding an offer, admin can manually record click count, conversion rate, and revenue for testing.
- **Niche/Campaign input** on the Agents tab: a form where user types a niche (e.g. "weight loss") and clicks "Launch Campaign" which triggers runAllAgents() and shows a live step-by-step pipeline visualization.
- **Live pipeline view**: after triggering all agents, show step-by-step: Affiliate → Funnel → Copy → Traffic → Analytics, with animated progress and a final summary card.
- **Real execution counter**: fix totalExecutions to increment properly by tracking it in a local counter in the frontend (per session).
- **Meaningful agent output cards**: each agent run shows a simulated but realistic output (offers found, copy headlines, keyword suggestions, insights) rather than just timestamps.

### Modify
- **AgentsDashboard**: add niche input form above agent cards. Show campaign results after running. Show agent-specific "last output" below each card.
- **AdminDashboard**: add "Add Offer" and "API Keys" sections in the settings tab.
- **AffiliatePerformance**: show a clear "no offers yet" CTA that directs admin to add offers in settings.
- **NetworkVisualization**: add animated data flow lines between agents when they are in "running" state.
- **Overall design**: make it feel more like a command center — darker, more vibrant accent colors, better typography hierarchy.

### Remove
- Nothing removed.

## Implementation Plan

1. Add `AddOfferForm` component with productId, price, commissionRate fields. Calls `addOffer` backend method.
2. Add `AddMetricsForm` component allowing admin to record metrics for an existing offer.
3. Add `ApiKeysSettings` component with masked inputs for ClickBank key, JVZoo key + secret — saved to localStorage.
4. Add `CampaignLauncher` component on Agents tab: niche text input + "Launch Campaign" button, triggers runAllAgents, shows animated step pipeline.
5. Add `AgentOutputCard` showing simulated realistic output per agent type.
6. Fix execution counter — track cumulative runs in component state using useEffect watching log length.
7. Update AdminDashboard Settings tab to include AddOfferForm, AddMetricsForm, and ApiKeysSettings.
8. Polish overall visual design: stronger gradient headers, better card spacing, command-center aesthetic.
