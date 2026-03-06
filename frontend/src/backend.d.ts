import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface AutomationStatus {
    totalExecutions: bigint;
    lastRun?: Time;
    running: boolean;
}
export interface KnowledgeEntry {
    id: string;
    references: Array<Reference>;
    content: string;
    contentType: ContentType;
    owner: Principal;
    sourceAgent: AgentType;
    timestamp: Time;
}
export interface Agent {
    id: string;
    active: boolean;
    owner: Principal;
    agentType: AgentType;
    lastRun: bigint;
}
export interface LaunchRecord {
}
export interface OfferPerformanceMetrics {
    lastUpdated: Time;
    clickCount: bigint;
    revenueTotal: bigint;
    conversionRate: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type LogEntry = string;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Offer {
    id: string;
    endDate?: Time;
    productId: string;
    commissionRate: number;
    priceInCents: bigint;
    startDate: Time;
}
export interface CloneProtectionSettings {
    cloneProtectionEnabled: boolean;
    demoModeEnabled: boolean;
    sellingPriceCents: bigint;
}
export interface AppLicense {
    expiresAt?: Time;
    purchaseTime: Time;
    owner: Principal;
    licenseType: LicenseType;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Reference {
    refType: ContentType;
    refId: string;
}
export interface UserProfile {
    name: string;
    email?: string;
}
export enum AgentType {
    habit = "habit",
    copy = "copy",
    analytics = "analytics",
    affiliate = "affiliate"
}
export enum ContentType {
    performanceData = "performanceData",
    strategy = "strategy",
    insight = "insight",
    recommendation = "recommendation"
}
export enum LicenseType {
    trial = "trial",
    demo = "demo",
    full = "full"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLaunch(_cloneId: string, _launchTime: Time): Promise<void>;
    addOffer(productId: string, priceInCents: bigint, commissionRate: number, startDate: Time, endDate: Time | null): Promise<string>;
    addOfferMetrics(offerId: string, clickCount: bigint, conversionRate: number, revenueTotal: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAgent(agentType: AgentType): Promise<string>;
    createAppLicense(licenseType: LicenseType): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteAgent(agentId: string): Promise<void>;
    getAgent(agentId: string): Promise<Agent | null>;
    getAgentLogs(agentType: AgentType): Promise<Array<LogEntry>>;
    getAllAgentLogs(): Promise<{
        habit: Array<LogEntry>;
        copy: Array<LogEntry>;
        analytics: Array<LogEntry>;
        affiliate: Array<LogEntry>;
    }>;
    getAllAgents(): Promise<Array<Agent>>;
    getAllAppLicenses(): Promise<Array<AppLicense>>;
    getAllAutomationStatuses(): Promise<Array<[AgentType, AutomationStatus]>>;
    getAllKnowledgeEntries(): Promise<Array<KnowledgeEntry>>;
    getAllLaunches(): Promise<Array<LaunchRecord>>;
    getAllOfferMetrics(): Promise<Array<OfferPerformanceMetrics>>;
    getAllOffers(): Promise<Array<Offer>>;
    getAutomationStatus(agentType: AgentType): Promise<AutomationStatus>;
    getCallerAgents(): Promise<Array<Agent>>;
    getCallerAppLicense(): Promise<AppLicense | null>;
    getCallerKnowledgeEntries(): Promise<Array<KnowledgeEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClickCountPerOffer(): Promise<Array<[string, bigint]>>;
    getCloneProtectionSettings(): Promise<CloneProtectionSettings>;
    getCollaborationStats(): Promise<Array<[AgentType, bigint]>>;
    getConversionRatePerOffer(): Promise<Array<[string, number]>>;
    getIsStripeReady(): Promise<boolean>;
    getKnowledgeEntry(entryId: string): Promise<KnowledgeEntry | null>;
    getOfferMetrics(offerId: string): Promise<OfferPerformanceMetrics | null>;
    getOfferPerformanceSummary(): Promise<{
        totalOffers: bigint;
        revenueTotals: bigint;
        conversionRates: Array<[string, number]>;
        allMetrics: Array<OfferPerformanceMetrics>;
        clickCounts: Array<[string, bigint]>;
    }>;
    getRevenueTotals(): Promise<bigint>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTotalActiveOffers(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initStripe(secretKey: string): Promise<void>;
    isActiveUser(): Promise<boolean>;
    isAuthorizedClone(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isOwnerCertified(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    runAffiliateAgent(): Promise<void>;
    runAgent(agentType: AgentType): Promise<void>;
    runAgentId(agentId: string): Promise<void>;
    runAllAgents(): Promise<void>;
    runAnalyticsAgent(): Promise<void>;
    runCollaborationLoop(): Promise<void>;
    runCopyAgent(): Promise<void>;
    runHabitAgent(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    startRecurringTimer(): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAgent(agentId: string, active: boolean): Promise<void>;
    updateCloneProtection(settings: CloneProtectionSettings): Promise<void>;
}
