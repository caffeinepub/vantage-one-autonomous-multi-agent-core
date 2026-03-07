import Map "mo:core/Map";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";



actor {
  // Include authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ============================
  // TYPES AND RECORDS
  // ============================
  type AgentType = {
    #habit;
    #affiliate;
    #copy;
    #analytics;
  };

  module AgentType {
    public func compare(a : AgentType, b : AgentType) : Order.Order {
      let orderA = getOrderValue(a);
      let orderB = getOrderValue(b);

      Nat.compare(orderA, orderB);
    };

    func getOrderValue(agent : AgentType) : Nat {
      switch (agent) {
        case (#habit) { 0 };
        case (#affiliate) { 1 };
        case (#copy) { 2 };
        case (#analytics) { 3 };
      };
    };
  };

  type OfferPerformanceMetrics = {
    clickCount : Nat;
    conversionRate : Float;
    revenueTotal : Nat;
    lastUpdated : Time.Time;
  };

  module OfferPerformanceMetrics {
    public func compare(a : OfferPerformanceMetrics, b : OfferPerformanceMetrics) : Order.Order {
      Int.compare(b.lastUpdated, a.lastUpdated);
    };
  };

  type Agent = {
    id : Text;
    agentType : AgentType;
    active : Bool;
    lastRun : Int;
    owner : Principal;
  };

  module Agent {
    public func compare(agent1 : Agent, agent2 : Agent) : Order.Order {
      switch (Text.compare(agent1.id, agent2.id)) {
        case (#equal) { Int.compare(agent1.lastRun, agent2.lastRun) };
        case (order) { order };
      };
    };

    public func getAgentTypeText(agentType : AgentType) : Text {
      switch (agentType) {
        case (#habit) { "habit" };
        case (#affiliate) { "affiliate" };
        case (#copy) { "copy" };
        case (#analytics) { "analytics" };
      };
    };
  };

  type KnowledgeEntry = {
    id : Text;
    sourceAgent : AgentType;
    contentType : ContentType;
    content : Text;
    timestamp : Time.Time;
    references : [Reference];
    owner : Principal;
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
  type AdaptiveStrategy = {
    #habitRefinement;
    #affiliatePrioritization;
    #copyAdaptation;
    #analyticsUpdate;
  };

  type AutomationStatus = {
    running : Bool;
    lastRun : ?Time.Time;
    totalExecutions : Nat;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  type Product = {
    id : Text;
    name : Text;
    description : Text;
    priceInCents : Nat;
  };

  type Offer = {
    id : Text;
    productId : Text;
    priceInCents : Nat;
    commissionRate : Float;
    startDate : Time.Time;
    endDate : ?Time.Time;
  };

  type LaunchRecord = {};
  type LicenseType = {
    #full;
    #demo;
    #trial;
  };

  type AppLicense = {
    owner : Principal;
    licenseType : LicenseType;
    purchaseTime : Time.Time;
    expiresAt : ?Time.Time;
  };

  type CloneProtectionSettings = {
    sellingPriceCents : Nat;
    cloneProtectionEnabled : Bool;
    demoModeEnabled : Bool;
  };

  // ============================
  // STATE
  // ============================

  let agents = Map.empty<Text, Agent>();
  let knowledgeCore = Map.empty<Text, KnowledgeEntry>();
  let agentCollaborationStats = Map.empty<AgentType, Nat>();

  let habitAgentLogs = Map.empty<Text, LogEntry>();
  let affiliateAgentLogs = Map.empty<Text, LogEntry>();
  let copyAgentLogs = Map.empty<Text, LogEntry>();
  let analyticsAgentLogs = Map.empty<Text, LogEntry>();

  let automationStatus = Map.empty<Text, AutomationStatus>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let offers = Map.empty<Text, Offer>();
  let offerMetrics = Map.empty<Text, OfferPerformanceMetrics>();
  let appLicenses = Map.empty<Principal, AppLicense>();
  let launches = Map.empty<Nat, LaunchRecord>();

  var systemPrincipal : ?Principal = null;
  var defaultAgentStatus : { #running; #inactive } = #running;

  // Clone Protection Settings
  var cloneProtectionSettings = {
    sellingPriceCents = 0;
    cloneProtectionEnabled = false;
    demoModeEnabled = false;
  };

  var isStripeReady : Bool = false;
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  let allAgentTypes : [AgentType] = [#habit, #affiliate, #copy, #analytics];

  // ============================
  // STRIPE
  // ============================

  public shared ({ caller }) func initStripe(secretKey : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can initialize Stripe");
    };
    let countries = ["US"];
    let conf : Stripe.StripeConfiguration = {
      secretKey;
      allowedCountries = countries;
    };
    stripeConfig := ?conf;
    isStripeReady := true;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check Stripe configuration");
    };
    stripeConfig != null;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query ({ caller }) func getIsStripeReady() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check Stripe status");
    };
    isStripeReady;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // ============================
  // DEFAULTS AND HELPERS
  // ============================

  func createDefaultAutomationStatus() : AutomationStatus {
    {
      running = false;
      lastRun = null;
      totalExecutions = 0;
    };
  };

  // ============================
  // USER PROFILES
  // ============================

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ============================
  // AGENT MANAGEMENT
  // ============================

  public shared ({ caller }) func createAgent(agentType : AgentType) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create agents");
    };
    let agentId = Time.now().toText() # "-" # Agent.getAgentTypeText(agentType);
    let agent : Agent = {
      id = agentId;
      agentType;
      active = true;
      lastRun = Time.now();
      owner = caller;
    };
    agents.add(agentId, agent);
    agentId;
  };

  public shared ({ caller }) func updateAgent(agentId : Text, active : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update agents");
    };
    switch (agents.get(agentId)) {
      case (null) { Runtime.trap("Agent not found") };
      case (?agent) {
        if (agent.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own agents");
        };
        let updatedAgent = {
          id = agent.id;
          agentType = agent.agentType;
          active;
          lastRun = agent.lastRun;
          owner = agent.owner;
        };
        agents.add(agentId, updatedAgent);
      };
    };
  };

  public shared ({ caller }) func deleteAgent(agentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete agents");
    };
    switch (agents.get(agentId)) {
      case (null) { Runtime.trap("Agent not found") };
      case (?agent) {
        if (agent.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own agents");
        };
        agents.remove(agentId);
      };
    };
  };

  public query ({ caller }) func getAgent(agentId : Text) : async ?Agent {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view agents");
    };
    switch (agents.get(agentId)) {
      case (null) { null };
      case (?agent) {
        if (agent.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own agents");
        };
        ?agent;
      };
    };
  };

  public query ({ caller }) func getCallerAgents() : async [Agent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view agents");
    };
    agents.values().toArray().filter(func(agent : Agent) : Bool { agent.owner == caller });
  };

  public query ({ caller }) func getAllAgents() : async [Agent] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view all agents");
    };
    agents.values().toArray();
  };

  // ============================
  // AUTOMATION FUNCTIONS
  // ============================

  func runSequentialAgentChain() : async () {
    let agentChain : [AgentType] = [#habit, #affiliate, #copy, #analytics];
    let updatedStatus = {
      running = false;
      lastRun = ?Time.now();
      totalExecutions = 1;
    };
    automationStatus.add("habit", updatedStatus);

    // Use system principal for automated operations
    let owner = switch (systemPrincipal) {
      case (null) { Principal.fromText("aaaaa-aa") };
      case (?principal) { principal };
    };

    for (agentType in agentChain.values()) {
      switch (agentType) {
        case (#habit) { await runHabitAgentInternal(owner) };
        case (#affiliate) { await runAffiliateAgentInternal(owner) };
        case (#copy) { await runCopyAgentInternal(owner) };
        case (#analytics) { await runAnalyticsAgentInternal(owner) };
      };
    };
    await runCollaborationLoopInternal();
  };

  public shared ({ caller }) func startRecurringTimer() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can start recurring timer");
    };
    // Store the admin principal as system principal for automated operations
    systemPrincipal := ?caller;
    ignore Timer.recurringTimer<system>(#seconds 10, runSequentialAgentChain);
  };

  func runHabitAgentInternal(owner : Principal) : async () {
    let runTime = Time.now();
    let agentId = runTime.toText();
    habitAgentLogs.add(agentId, "HabitAgent executed at " # runTime.toText());
    let updatedStatus = {
      running = false;
      lastRun = ?runTime;
      totalExecutions = 1;
    };
    automationStatus.add("habit", updatedStatus);
    addKnowledgeEntry(#habit, "Habit Agent completed task", owner);
    ();
  };

  func runAffiliateAgentInternal(owner : Principal) : async () {
    let runTime = Time.now();
    let agentId = runTime.toText();
    affiliateAgentLogs.add(agentId, "AffiliateAgent executed at " # runTime.toText());
    let updatedStatus = {
      running = false;
      lastRun = ?runTime;
      totalExecutions = 1;
    };
    automationStatus.add("affiliate", updatedStatus);
    addKnowledgeEntry(#affiliate, "Affiliate Agent completed task", owner);
    ();
  };

  func runCopyAgentInternal(owner : Principal) : async () {
    let runTime = Time.now();
    let agentId = runTime.toText();
    copyAgentLogs.add(agentId, "CopyAgent executed at " # runTime.toText());
    let updatedStatus = {
      running = false;
      lastRun = ?runTime;
      totalExecutions = 1;
    };
    automationStatus.add("copy", updatedStatus);
    addKnowledgeEntry(#copy, "Copy Agent completed task", owner);
    ();
  };

  func runAnalyticsAgentInternal(owner : Principal) : async () {
    let runTime = Time.now();
    let agentId = runTime.toText();
    analyticsAgentLogs.add(agentId, "AnalyticsAgent executed at " # runTime.toText());
    let updatedStatus = {
      running = false;
      lastRun = ?runTime;
      totalExecutions = 1;
    };
    automationStatus.add("analytics", updatedStatus);
    addKnowledgeEntry(#analytics, "Analytics Agent completed task", owner);
    ();
  };

  public shared ({ caller }) func runHabitAgent() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can run agents");
    };
    await runHabitAgentInternal(caller);
  };

  public shared ({ caller }) func runAffiliateAgent() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can run agents");
    };
    await runAffiliateAgentInternal(caller);
  };

  public shared ({ caller }) func runCopyAgent() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can run agents");
    };
    await runCopyAgentInternal(caller);
  };

  public shared ({ caller }) func runAnalyticsAgent() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can run agents");
    };
    await runAnalyticsAgentInternal(caller);
  };

  public shared ({ caller }) func runAgent(agentType : AgentType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can run agents");
    };
    switch (agentType) {
      case (#habit) { await runHabitAgentInternal(caller) };
      case (#affiliate) { await runAffiliateAgentInternal(caller) };
      case (#copy) { await runCopyAgentInternal(caller) };
      case (#analytics) { await runAnalyticsAgentInternal(caller) };
    };
  };

  public shared ({ caller }) func runAgentId(agentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can run agents");
    };
    switch (agents.get(agentId)) {
      case (null) { Runtime.trap("Agent not found") };
      case (?agent) {
        if (agent.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only run your own agents");
        };
        switch (agent.agentType) {
          case (#habit) { await runHabitAgentInternal(caller) };
          case (#affiliate) { await runAffiliateAgentInternal(caller) };
          case (#copy) { await runCopyAgentInternal(caller) };
          case (#analytics) { await runAnalyticsAgentInternal(caller) };
        };
      };
    };
  };

  public shared ({ caller }) func runAllAgents() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can run agents");
    };
    for (agentType in allAgentTypes.values()) {
      switch (agentType) {
        case (#habit) { await runHabitAgentInternal(caller) };
        case (#affiliate) { await runAffiliateAgentInternal(caller) };
        case (#copy) { await runCopyAgentInternal(caller) };
        case (#analytics) { await runAnalyticsAgentInternal(caller) };
      };
    };
  };

  func addKnowledgeEntry(sourceAgent : AgentType, content : Text, owner : Principal) {
    let entryId = Time.now().toText();
    let entry : KnowledgeEntry = {
      id = entryId;
      sourceAgent;
      contentType = #insight;
      content;
      timestamp = Time.now();
      references = [];
      owner;
    };
    knowledgeCore.add(entryId, entry);
  };

  func runCollaborationLoopInternal() : async () {
    let entries = knowledgeCore.values().toArray();
    for (entry in entries.values()) {
      let sourceAgent = entry.sourceAgent;

      if (await shouldAgentAdapt(sourceAgent)) {
        let updatedEntry = {
          id = entry.id;
          sourceAgent = sourceAgent;
          contentType = #strategy;
          content = entry.content # " - adapted by " # Agent.getAgentTypeText(sourceAgent);
          timestamp = Time.now();
          references = entry.references;
          owner = entry.owner;
        };
        knowledgeCore.add(entry.id, updatedEntry);

        switch (agentCollaborationStats.get(sourceAgent)) {
          case (null) { agentCollaborationStats.add(sourceAgent, 1) };
          case (?count) { agentCollaborationStats.add(sourceAgent, count + 1) };
        };
      };
    };
  };

  func shouldAgentAdapt(agentType : AgentType) : async Bool {
    let entryCount = switch (agentCollaborationStats.get(agentType)) {
      case (null) { 0 };
      case (?count) { count };
    };
    entryCount < 5;
  };

  // ============================
  // LOGS AND STATUS
  // ============================

  public query ({ caller }) func getAgentLogs(agentType : AgentType) : async [LogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view logs");
    };
    switch (agentType) {
      case (#habit) { habitAgentLogs.values().toArray() };
      case (#affiliate) { affiliateAgentLogs.values().toArray() };
      case (#copy) { copyAgentLogs.values().toArray() };
      case (#analytics) { analyticsAgentLogs.values().toArray() };
    };
  };

  public query ({ caller }) func getAllAgentLogs() : async {
    habit : [LogEntry];
    affiliate : [LogEntry];
    copy : [LogEntry];
    analytics : [LogEntry];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view logs");
    };
    {
      habit = habitAgentLogs.values().toArray();
      affiliate = affiliateAgentLogs.values().toArray();
      copy = copyAgentLogs.values().toArray();
      analytics = analyticsAgentLogs.values().toArray();
    };
  };

  public query ({ caller }) func getAutomationStatus(agentType : AgentType) : async AutomationStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view status");
    };

    let existingStatus = switch (automationStatus.get(Agent.getAgentTypeText(agentType))) {
      case (null) { createDefaultAutomationStatus() };
      case (?status) { status };
    };
    existingStatus;
  };

  public query ({ caller }) func getCallerKnowledgeEntries() : async [KnowledgeEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access knowledge core");
    };
    knowledgeCore.values().toArray().filter(func(entry : KnowledgeEntry) : Bool { entry.owner == caller });
  };

  public query ({ caller }) func getAllKnowledgeEntries() : async [KnowledgeEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all knowledge entries");
    };
    knowledgeCore.values().toArray();
  };

  public query ({ caller }) func getKnowledgeEntry(entryId : Text) : async ?KnowledgeEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access knowledge core");
    };
    switch (knowledgeCore.get(entryId)) {
      case (null) { null };
      case (?entry) {
        if (entry.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own knowledge entries");
        };
        ?entry;
      };
    };
  };

  public query ({ caller }) func getAllAutomationStatuses() : async [(AgentType, AutomationStatus)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view status");
    };

    allAgentTypes.map(
      func(agentType) {
        let existingStatus = switch (automationStatus.get(Agent.getAgentTypeText(agentType))) {
          case (null) { createDefaultAutomationStatus() };
          case (?status) { status };
        };
        (agentType, existingStatus);
      }
    );
  };

  public query ({ caller }) func getCollaborationStats() : async [(AgentType, Nat)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view collaboration stats");
    };
    agentCollaborationStats.toArray();
  };

  public shared ({ caller }) func runCollaborationLoop() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can trigger collaboration loop");
    };
    await runCollaborationLoopInternal();
  };

  // ============================
  // OFFER PERFORMANCE METRICS
  // ============================

  public shared ({ caller }) func addOfferMetrics(offerId : Text, clickCount : Nat, conversionRate : Float, revenueTotal : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add offer metrics");
    };
    let metrics = {
      clickCount;
      conversionRate;
      revenueTotal;
      lastUpdated = Time.now();
    };
    offerMetrics.add(offerId, metrics);
  };

  public query ({ caller }) func getOfferMetrics(offerId : Text) : async ?OfferPerformanceMetrics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view offer metrics");
    };
    offerMetrics.get(offerId);
  };

  public query ({ caller }) func getAllOfferMetrics() : async [OfferPerformanceMetrics] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view offer metrics");
    };
    offerMetrics.values().toArray();
  };

  public query ({ caller }) func getTotalActiveOffers() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view active offers");
    };
    offers.size();
  };

  public query ({ caller }) func getClickCountPerOffer() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view click counts");
    };
    offerMetrics.toArray().map(
      func((offerId, metrics)) {
        (offerId, metrics.clickCount);
      }
    );
  };

  public query ({ caller }) func getConversionRatePerOffer() : async [(Text, Float)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversion rates");
    };
    offerMetrics.toArray().map(
      func((offerId, metrics)) {
        (offerId, metrics.conversionRate);
      }
    );
  };

  public query ({ caller }) func getRevenueTotals() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view revenue totals");
    };
    var total = 0;
    for (metrics in offerMetrics.values()) {
      total += metrics.revenueTotal;
    };
    total;
  };

  public query ({ caller }) func getOfferPerformanceSummary() : async {
    totalOffers : Nat;
    clickCounts : [(Text, Nat)];
    conversionRates : [(Text, Float)];
    revenueTotals : Nat;
    allMetrics : [OfferPerformanceMetrics];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view offer performance summary");
    };
    {
      totalOffers = offers.size();
      clickCounts = offerMetrics.toArray().map(
        func((offerId, metrics)) {
          (offerId, metrics.clickCount);
        }
      );
      conversionRates = offerMetrics.toArray().map(
        func((offerId, metrics)) {
          (offerId, metrics.conversionRate);
        }
      );
      revenueTotals = do {
        var total = 0;
        for (metrics in offerMetrics.values()) {
          total += metrics.revenueTotal;
        };
        total;
      };
      allMetrics = offerMetrics.values().toArray();
    };
  };

  // ============================
  // CLONE PROTECTION
  // ============================

  public shared ({ caller }) func addLaunch(_cloneId : Text, _launchTime : Time.Time) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can add launches. See system documentation on how to use this functionality.");
    };
    return;
  };

  public query ({ caller }) func getAllLaunches() : async [LaunchRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view launches");
    };
    launches.values().toArray();
  };

  public shared ({ caller }) func addOffer(
    productId : Text,
    priceInCents : Nat,
    commissionRate : Float,
    startDate : Time.Time,
    endDate : ?Time.Time,
  ) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add offers");
    };
    let offerId = Time.now().toText() # "-" # productId;
    let offer : Offer = {
      id = offerId;
      productId;
      priceInCents;
      commissionRate;
      startDate;
      endDate;
    };
    offers.add(offerId, offer);
    offerId;
  };

  public query ({ caller }) func getAllOffers() : async [Offer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view offers");
    };
    offers.values().toArray();
  };

  public shared ({ caller }) func updateCloneProtection(settings : CloneProtectionSettings) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can update clone protection settings");
    };
    if (settings.sellingPriceCents > 999_999) {
      Runtime.trap("Selling price must be <= 999999 cents");
    };
    cloneProtectionSettings := settings;
  };

  public query ({ caller }) func getCloneProtectionSettings() : async CloneProtectionSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clone protection settings");
    };
    cloneProtectionSettings;
  };

  public shared ({ caller }) func createAppLicense(licenseType : LicenseType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create app license");
    };

    // Check if user already has a license
    switch (appLicenses.get(caller)) {
      case (?existingLicense) {
        Runtime.trap("User already has an app license");
      };
      case (null) {
        // Validate license type - demo licenses can be created freely, but full licenses require payment validation
        switch (licenseType) {
          case (#demo) {
            if (not cloneProtectionSettings.demoModeEnabled) {
              Runtime.trap("Demo mode is not enabled");
            };
          };
          case (#full) {
            // In production, this should verify payment through Stripe
            // For now, only admins can grant full licenses
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Full licenses require payment verification");
            };
          };
          case (#trial) {
          };
        };

        let expiresAt = switch (licenseType) {
          case (#trial) { ?(Time.now() + 30 * 24 * 60 * 60 * 1_000_000_000) };
          case (_) { null };
        };

        let appLicense : AppLicense = {
          owner = caller;
          licenseType;
          purchaseTime = Time.now();
          expiresAt;
        };
        appLicenses.add(caller, appLicense);
      };
    };
  };

  public query ({ caller }) func isOwnerCertified() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check certification status");
    };

    // Check if caller has a valid license
    switch (appLicenses.get(caller)) {
      case (null) { false };
      case (?license) {
        // Check if license is expired
        switch (license.expiresAt) {
          case (null) { true }; // No expiration
          case (?expiry) { Time.now() < expiry };
        };
      };
    };
  };

  public query ({ caller }) func isAuthorizedClone() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check clone authorization");
    };

    // If clone protection is disabled, all users are authorized
    if (not cloneProtectionSettings.cloneProtectionEnabled) {
      return true;
    };

    // Check if user has a valid full license
    switch (appLicenses.get(caller)) {
      case (null) { false };
      case (?license) {
        switch (license.licenseType) {
          case (#full) {
            // Check expiration
            switch (license.expiresAt) {
              case (null) { true };
              case (?expiry) { Time.now() < expiry };
            };
          };
          case (_) { false }; // Demo and trial licenses cannot clone
        };
      };
    };
  };

  public query ({ caller }) func isActiveUser() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #user);
  };

  public query ({ caller }) func getCallerAppLicense() : async ?AppLicense {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their license");
    };
    appLicenses.get(caller);
  };

  public query ({ caller }) func getAllAppLicenses() : async [AppLicense] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all licenses");
    };
    appLicenses.values().toArray();
  };
};
