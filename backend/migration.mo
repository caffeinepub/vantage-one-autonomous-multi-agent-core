import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type AgentType = {
    #habit;
    #affiliate;
    #copy;
    #analytics;
  };

  type OfferPerformanceMetrics = {
    clickCount : Nat;
    conversionRate : Float;
    revenueTotal : Nat;
    lastUpdated : Time.Time;
  };

  type Agent = {
    id : Text;
    agentType : AgentType;
    active : Bool;
    lastRun : Int;
    owner : Principal.Principal;
  };

  type KnowledgeEntry = {
    id : Text;
    sourceAgent : AgentType;
    contentType : ContentType;
    content : Text;
    timestamp : Time.Time;
    references : [Reference];
    owner : Principal.Principal;
  };

  type ContentType = {
    #insight;
    #performanceData;
    #recommendation;
    #strategy;
  };

  type Reference = {
    refId : Text;
    refType : ContentType;
  };

  type LogEntry = Text;
  type AutomationStatus = {
    running : Bool;
    lastRun : ?Time.Time;
    totalExecutions : Nat;
  };

  type UserProfile = {
    name : Text;
    email : ?Text;
  };

  type Offer = {
    id : Text;
    productId : Text;
    priceInCents : Nat;
    commissionRate : Float;
    startDate : Time.Time;
    endDate : ?Time.Time;
  };

  type CloneProtectionSettings = {
    sellingPriceCents : Nat;
    cloneProtectionEnabled : Bool;
    demoModeEnabled : Bool;
  };

  type AppLicense = {
    owner : Principal.Principal;
    licenseType : LicenseType;
    purchaseTime : Time.Time;
    expiresAt : ?Time.Time;
  };

  type LicenseType = {
    #full;
    #demo;
    #trial;
  };

  type OldActor = {
    agents : Map.Map<Text, Agent>;
    knowledgeCore : Map.Map<Text, KnowledgeEntry>;
    agentCollaborationStats : Map.Map<AgentType, Nat>;
    habitAgentLogs : Map.Map<Text, LogEntry>;
    affiliateAgentLogs : Map.Map<Text, LogEntry>;
    copyAgentLogs : Map.Map<Text, LogEntry>;
    analyticsAgentLogs : Map.Map<Text, LogEntry>;
    automationStatus : Map.Map<Text, AutomationStatus>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    offers : Map.Map<Text, Offer>;
    appLicenses : Map.Map<Principal.Principal, AppLicense>;
    launches : Map.Map<Nat, {}>;
    systemPrincipal : ?Principal.Principal;
    defaultAgentStatus : { #running; #inactive };
    cloneProtectionSettings : CloneProtectionSettings;
    isStripeReady : Bool;
  };

  type NewActor = {
    agents : Map.Map<Text, Agent>;
    knowledgeCore : Map.Map<Text, KnowledgeEntry>;
    agentCollaborationStats : Map.Map<AgentType, Nat>;
    habitAgentLogs : Map.Map<Text, LogEntry>;
    affiliateAgentLogs : Map.Map<Text, LogEntry>;
    copyAgentLogs : Map.Map<Text, LogEntry>;
    analyticsAgentLogs : Map.Map<Text, LogEntry>;
    automationStatus : Map.Map<Text, AutomationStatus>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    offers : Map.Map<Text, Offer>;
    offerMetrics : Map.Map<Text, OfferPerformanceMetrics>;
    appLicenses : Map.Map<Principal.Principal, AppLicense>;
    launches : Map.Map<Nat, {}>;
    systemPrincipal : ?Principal.Principal;
    defaultAgentStatus : { #running; #inactive };
    cloneProtectionSettings : CloneProtectionSettings;
    isStripeReady : Bool;
  };

  public func run(old : OldActor) : NewActor {
    let offerMetrics = Map.empty<Text, OfferPerformanceMetrics>();
    { old with offerMetrics };
  };
};
