import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  AgentType,
  AppLicense,
  AutomationStatus,
  CloneProtectionSettings,
  KnowledgeEntry,
  LogEntry,
  Offer,
  OfferPerformanceMetrics,
} from "../backend";
import { useActor } from "./useActor";

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      productId: string;
      priceInCents: bigint;
      commissionRate: number;
      startDate: bigint;
      endDate: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addOffer(
        params.productId,
        params.priceInCents,
        params.commissionRate,
        params.startDate,
        params.endDate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offerPerformanceSummary"] });
      toast.success("Offer added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add offer: ${error.message}`);
    },
  });
}

export function useAddOfferMetrics() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      offerId: string;
      clickCount: bigint;
      conversionRate: number;
      revenueTotal: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addOfferMetrics(
        params.offerId,
        params.clickCount,
        params.conversionRate,
        params.revenueTotal,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offerPerformanceSummary"] });
      queryClient.invalidateQueries({ queryKey: ["allOfferMetrics"] });
      toast.success("Metrics recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to record metrics: ${error.message}`);
    },
  });
}

// Automation Queries
export function useGetAllAgentLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<{
    habit: LogEntry[];
    affiliate: LogEntry[];
    copy: LogEntry[];
    analytics: LogEntry[];
  }>({
    queryKey: ["agentLogs"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllAgentLogs();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000, // Refresh every 3 seconds for live logs
  });
}

export function useGetAgentLogs() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (agentType: AgentType) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAgentLogs(agentType);
    },
  });
}

export function useGetAllAutomationStatuses() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[AgentType, AutomationStatus]>>({
    queryKey: ["automationStatuses"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllAutomationStatuses();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time status
  });
}

export function useGetAutomationStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (agentType: AgentType) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAutomationStatus(agentType);
    },
  });
}

export function useRunAgent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentType: AgentType) => {
      if (!actor) throw new Error("Actor not available");
      return actor.runAgent(agentType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentLogs"] });
      queryClient.invalidateQueries({ queryKey: ["automationStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["collaborationStats"] });
      queryClient.invalidateQueries({ queryKey: ["offerPerformanceSummary"] });
      queryClient.invalidateQueries({ queryKey: ["allOfferMetrics"] });
      toast.success("Agent executed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to run agent: ${error.message}`);
    },
  });
}

export function useRunHabitAgent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.runHabitAgent();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentLogs"] });
      queryClient.invalidateQueries({ queryKey: ["automationStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["collaborationStats"] });
      toast.success("Habit agent executed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to run habit agent: ${error.message}`);
    },
  });
}

export function useRunAffiliateAgent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.runAffiliateAgent();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentLogs"] });
      queryClient.invalidateQueries({ queryKey: ["automationStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["collaborationStats"] });
      queryClient.invalidateQueries({ queryKey: ["offerPerformanceSummary"] });
      queryClient.invalidateQueries({ queryKey: ["allOfferMetrics"] });
      toast.success("Affiliate agent executed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to run affiliate agent: ${error.message}`);
    },
  });
}

export function useRunCopyAgent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.runCopyAgent();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentLogs"] });
      queryClient.invalidateQueries({ queryKey: ["automationStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["collaborationStats"] });
      toast.success("Copy agent executed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to run copy agent: ${error.message}`);
    },
  });
}

export function useRunAnalyticsAgent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.runAnalyticsAgent();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentLogs"] });
      queryClient.invalidateQueries({ queryKey: ["automationStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["collaborationStats"] });
      queryClient.invalidateQueries({ queryKey: ["offerPerformanceSummary"] });
      queryClient.invalidateQueries({ queryKey: ["allOfferMetrics"] });
      toast.success("Analytics agent executed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to run analytics agent: ${error.message}`);
    },
  });
}

export function useRunAllAgents() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.runAllAgents();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentLogs"] });
      queryClient.invalidateQueries({ queryKey: ["automationStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["collaborationStats"] });
      queryClient.invalidateQueries({ queryKey: ["offerPerformanceSummary"] });
      queryClient.invalidateQueries({ queryKey: ["allOfferMetrics"] });
      toast.success("All agents executed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to run agents: ${error.message}`);
    },
  });
}

export function useStartRecurringTimer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.startRecurringTimer();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automationStatuses"] });
      toast.success("Recurring timer started");
    },
    onError: (error: Error) => {
      toast.error(`Failed to start timer: ${error.message}`);
    },
  });
}

// Knowledge Core Queries
export function useGetCallerKnowledgeEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<KnowledgeEntry[]>({
    queryKey: ["knowledgeEntries"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerKnowledgeEntries();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });
}

export function useGetCollaborationStats() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[AgentType, bigint]>>({
    queryKey: ["collaborationStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCollaborationStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function useRunCollaborationLoop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.runCollaborationLoop();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["collaborationStats"] });
      toast.success("Collaboration loop executed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to run collaboration loop: ${error.message}`);
    },
  });
}

// Monetization Queries
export function useGetCloneProtectionSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<CloneProtectionSettings>({
    queryKey: ["cloneProtectionSettings"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCloneProtectionSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateCloneProtection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: CloneProtectionSettings) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCloneProtection(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloneProtectionSettings"] });
      toast.success("Clone protection settings updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });
}

export function useGetAllOffers() {
  const { actor, isFetching } = useActor();

  return useQuery<Offer[]>({
    queryKey: ["offers"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllOffers();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export function useGetCallerAppLicense() {
  const { actor, isFetching } = useActor();

  return useQuery<AppLicense | null>({
    queryKey: ["appLicense"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerAppLicense();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsOwnerCertified() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["ownerCertified"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isOwnerCertified();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAuthorizedClone() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["authorizedClone"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isAuthorizedClone();
    },
    enabled: !!actor && !isFetching,
  });
}

// Affiliate Performance Tracking Queries
export function useGetOfferPerformanceSummary() {
  const { actor, isFetching } = useActor();

  return useQuery<{
    totalOffers: bigint;
    clickCounts: Array<[string, bigint]>;
    conversionRates: Array<[string, number]>;
    revenueTotals: bigint;
    allMetrics: OfferPerformanceMetrics[];
  }>({
    queryKey: ["offerPerformanceSummary"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getOfferPerformanceSummary();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time metrics
  });
}

export function useGetAllOfferMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery<OfferPerformanceMetrics[]>({
    queryKey: ["allOfferMetrics"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllOfferMetrics();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function useGetTotalActiveOffers() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["totalActiveOffers"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTotalActiveOffers();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export function useGetRevenueTotals() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["revenueTotals"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getRevenueTotals();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function useGetClickCountPerOffer() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, bigint]>>({
    queryKey: ["clickCountPerOffer"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getClickCountPerOffer();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function useGetConversionRatePerOffer() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, number]>>({
    queryKey: ["conversionRatePerOffer"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getConversionRatePerOffer();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}
