# Vantage One – Autonomous Multi‑Agent Core

## Overview
A full-stack application for managing and monitoring an autonomous agent system with multiple specialized agent types, task orchestration, learning capabilities, and automated execution with real-time monitoring. Features a shared knowledge core for inter-agent collaboration and adaptive intelligence with live data updates and visual knowledge flow representation. Includes monetization capabilities for app licensing and clone protection, plus a personal admin dashboard for affiliate operations management with comprehensive affiliate performance tracking.

## Authentication
- Internet Identity integration for secure user access
- All features require authenticated access

## Backend Features

### External Service Integration
- Supabase client initialization using environment variables `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- OpenAI API integration via `OPENAI_API_KEY` for AI-powered agent operations
- Worker identification through `WORKER_ID` environment variable
- Configurable polling interval via `POLL_INTERVAL_MS` (default 4000ms)

### Task Queue System
- Atomic task claiming in Supabase `task_queue` table with status and locking fields
- Task priority and scheduling capabilities
- Task status tracking (pending, in-progress, completed, failed)
- Task assignment to appropriate agent types with deterministic spawning
- Centralized task orchestration and routing system
- Query endpoints for task queue status and history

### Agent Management
- Support for four specialized agent types: FunnelAgent, AffiliateAgent, CopyAgent, and OrganicTrafficAgent
- **FunnelAgent**: Generates marketing funnels through OpenAI using `gpt-4o-mini` model
- **AffiliateAgent**: Creates ranked affiliate offer lists and recommendations
- **CopyAgent**: Writes sales copy and marketing content via OpenAI integration
- **OrganicTrafficAgent**: Generates organic SEO and traffic acquisition strategies
- Agent state persistence and configuration management
- Agent lifecycle management (creation, activation, deactivation)
- Agent status tracking (active/inactive) and last run timestamps
- Query endpoints for retrieving agent status, execution logs, and performance metrics
- Mutation endpoints for agent operations (start, stop, configure)

### Orchestration System
- Sequential agent execution router that processes each agent type in order
- Deterministic downstream task spawning based on agent outputs
- Agent output recording in `assistant_memory` table for persistence
- Continuous polling **workerLoop** for all agents to claim and process tasks
- Perpetual autonomous operation with memory persistence and adaptive feedback
- Task completion tracking and result aggregation

### Shared Knowledge Core
- Central data structure for storing agent insights, learnings, and performance metrics in `assistant_memory`
- Knowledge entries with timestamps, source agent, and content type
- Cross-agent reference tracking for collaboration insights
- Performance data aggregation and trend analysis
- Adaptive strategy recommendations based on collective intelligence
- Query endpoints for knowledge entries, collaboration stats, and cross-agent references
- Real-time knowledge flow tracking between agents

### Enhanced Adaptive Collaboration Logic
- Weighted adaptation system based on agent performance history and cross-agent references
- Performance-based weighting for collaboration insights and recommendations
- Cross-agent reference scoring to prioritize high-impact knowledge sharing
- Enhanced collaboration loops with performance-weighted decision making
- Lightweight feedback mechanism for agents to adjust future behaviors
- Aggregated collaboration stats influence on agent behavior modifications
- Last outcome tracking for continuous behavioral refinement

### Autonomy Loop Scheduler
- Automated scheduling system that triggers agent execution via continuous polling
- Adaptive scaling based on workload and performance metrics
- Configurable execution intervals and conditions through environment variables
- System health monitoring and auto-recovery
- Periodic collaboration loop triggers for knowledge sharing and adaptation
- Administrative controls for starting, stopping, and configuring automation cycles
- Automation trigger management endpoints for system administrators

### Affiliate Performance Tracking System
- Comprehensive offer interaction tracking and analytics
- Real-time click count monitoring per affiliate offer
- Conversion rate calculation and tracking per offer
- Revenue totals aggregation updated periodically via automation agents
- Active offers status monitoring and management
- Performance metrics endpoints for frontend consumption
- Historical performance data storage and trend analysis
- Offer performance comparison and ranking capabilities

### Metrics Endpoints
- **Total active offers** endpoint returning count of currently promoted offers
- **Click count per offer** endpoint with individual offer performance data
- **Conversion rate per offer** endpoint with percentage calculations
- **Revenue totals** endpoint with aggregated earnings data
- **Offer performance summary** endpoint combining all metrics
- Real-time data updates through periodic automation agent processing
- Performance trend analysis endpoints for historical comparisons

### Monetization System
- App licensing and clone protection management
- Selling price configuration for Caffeine App Market
- Clone authorization tracking and validation
- Free demo access mode toggle and controls
- License validation endpoints for authorized deployments
- Revenue tracking from app sales and licensing
- Clone protection verification for deployment requests

### Personal Admin Dashboard Data
- Affiliate offers management and tracking
- Generated funnels storage and performance metrics
- Revenue metrics calculation (total earnings, daily performance, best-performing offers)
- AI assistant execution tracking (Funnel, Affiliate, Copy, OrganicTraffic)
- Active and past deployment records with profit history
- Integrated affiliate data aggregation and analysis
- Real-time performance data collection and storage
- Enhanced affiliate performance analytics with click and conversion tracking

### Learning Records
- Storage of agent learning outcomes and performance data in Supabase
- Historical tracking of agent improvements and adaptations
- Learning pattern analysis and insights
- Performance metrics and success rates
- Cross-agent collaboration tracking and effectiveness metrics
- Performance history weighting for adaptive learning decisions

### Data Storage
- All agent configurations, task data, execution logs, and learning records stored in Supabase backend
- Shared knowledge core entries with full history and versioning in `assistant_memory`
- User-specific data isolation and access control
- Agent execution history and performance metrics
- Collaboration insights and cross-agent reference data
- Performance-weighted collaboration statistics and feedback data
- Monetization settings and licensing data
- Personal admin dashboard data including affiliate offers, funnels, and revenue metrics
- Deployment records and profit history tracking
- Affiliate performance data including clicks, conversions, and revenue per offer

## Frontend Features

### Living AI Ecosystem Dashboard
- Fully visual and dynamic dashboard presenting the system as a living AI ecosystem
- Network visualization canvas displaying the four agents (Funnel, Affiliate, Copy, OrganicTraffic) as animated interactive nodes
- Glowing data lines connecting agents that pulse during collaboration cycles
- Real-time animation intensity and color driven by backend data streams
- Neural Flow animation layer using SVG or Three.js for dynamic knowledge sharing visualization
- Status pulse system with progress bars, glow transitions, and subtle movement to evoke "thinking" behavior
- Smooth color-coded state transitions for running, idle, and learning states
- UI effects triggered by agent status updates

### Enhanced System Monitor
- Live, color-coded indicators for each agent's state (running, idle, learning)
- Smooth state transitions with visual effects
- Real-time synchronization with backend automation status
- Visual status indicators with distinctive colors and status badges
- Dynamic agent count displays reflecting actual backend execution state
- Animated status transitions with glow effects and movement
- **Affiliate performance tracking integration** showing real-time offers being promoted
- **Live metrics display** for click counts and conversion rates per offer

### Enhanced Collective Intelligence Interface
- Live adaptive intelligence metrics display
- Visual knowledge flow representation with animated elements
- Cross-agent reference highlights showing collaboration examples
- Knowledge transfer indicators with pulsing animations
- Interactive visual elements showing knowledge flow direction and intensity
- Real-time collaboration effectiveness metrics and trends
- Animated knowledge core entries with live data updates

### Enhanced Admin Dashboard
- Live revenue progression visualization with animated charts
- Autonomous agent performance scores with real-time updates
- Dynamic affiliate operations overview with visual indicators
- Animated performance metrics and trend displays
- Real-time deployment visualization with profit history
- Interactive revenue tracking with smooth transitions
- **Comprehensive affiliate performance section** with offer-specific metrics
- **Revenue totals dashboard** updated periodically via automation agents

### Affiliate Performance Dashboard
- **Real-time offers tracking** displaying currently promoted affiliate offers
- **Click count visualization** showing individual offer performance
- **Conversion rate displays** with percentage calculations and trends
- **Revenue metrics cards** showing earnings per offer and totals
- **Performance comparison charts** ranking offers by effectiveness
- **Live performance indicators** with color-coded status updates
- **Historical trend analysis** with interactive chart visualizations
- Integration with Affiliate Agent and Analytics Agent sections

### Monetization Management Interface
- App licensing configuration panel with selling price settings
- Clone protection controls and authorization management
- Free demo access mode toggle and configuration
- Revenue tracking from app sales and licensing fees
- License validation status display for deployed clones
- Caffeine App Market integration controls

### Agent Execution Dashboard
- Real-time visualization of agent execution logs with live data polling
- Live status indicators for each agent type with active/inactive states
- Execution history and timeline views with React Query integration
- Error and success rate monitoring with live updates
- Last run timestamps for each agent with automatic refresh
- Control panel with pause/resume buttons for individual agents
- Live logs display with real-time updates via polling
- Connected to backend queries for agent status and operations
- Mutation integration for agent control operations
- **Enhanced Affiliate Agent section** with performance metrics integration
- **Analytics Agent visualization** showing offer performance data

### Task Management Interface
- Current task queue visualization with live polling
- Task status and progress tracking with real-time updates
- Task creation and management capabilities
- Task assignment and priority controls
- Connected to backend task queue queries and mutations

### Learning Results Display
- Recent learning outcomes and insights with live data updates
- Performance trend visualization with real-time metrics
- Agent improvement metrics with historical comparison
- Learning pattern analysis charts with live data
- Collective intelligence impact on individual agent performance
- Performance-weighted learning insights display

### Real-time Updates and Animations
- Live monitoring of agent execution status via React Query polling
- Real-time log streaming and updates with automatic refresh
- Dynamic status indicators and performance metrics with smooth animations
- Responsive control panel for agent management with visual feedback
- Live updates for shared knowledge core entries with animated transitions
- Real-time collaboration flow visualization with pulsing elements
- Continuous polling for all dashboard components
- Neural flow animations showing data transfer between agents
- Smooth color transitions and glow effects for state changes
- Periodic React Query subscriptions maintaining accurate automation status display
- **Enhanced React Query hooks** for affiliate performance metrics polling
- **Live affiliate performance updates** with automatic refresh intervals

### Performance Metrics Integration
- **Cards and chart visualizations** for affiliate performance data
- **Real-time polling integration** via updated React Query hooks in useQueries.ts
- **Visual consistency** with existing agent panels and dashboard design
- **Interactive performance displays** with hover effects and detailed tooltips
- **Responsive metric cards** showing key performance indicators
- **Animated chart transitions** for performance data updates

## User Experience
- Clean, responsive interface using Tailwind CSS with enhanced visual effects
- Real-time updates for agent status and task progress via React Query
- Intuitive navigation between different system views with smooth transitions
- Clear visual indicators for system health and performance with animations
- Interactive control panels for manual agent execution with visual feedback
- Live monitoring capabilities with immediate animated feedback
- Visual representation of agent knowledge sharing with dynamic animations
- Administrative controls for automation cycle management with status effects
- Accurate real-time status displays synchronized with backend execution state
- Distinctive visual feedback for status transitions and agent state changes
- Comprehensive affiliate operations overview with animated metrics
- Monetization management interface with licensing and clone protection controls
- Living ecosystem feel with continuous subtle animations and visual breathing
- Neural network-inspired visual design with flowing data connections
- **Enhanced affiliate performance monitoring** with intuitive metric displays
- **Seamless integration** of performance data into existing dashboard design
- English language content throughout the application
