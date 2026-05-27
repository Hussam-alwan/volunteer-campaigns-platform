import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import campaignApis from "./Campaign.apis";
import type { IPagination } from "../../common.interfaces";
import type { Campaign, CreateCampaignInput } from "../../Types2/campaign";

export const campaignQueryKeys = {
  list: (param: IPagination) => ["campaigns", "list", param] as const,
  detail: (id: number) => ["campaigns", "detail", id] as const,
};

const useGetAllCampaigns = (param: IPagination) =>
  useQuery({
    queryKey: campaignQueryKeys.list(param),
    queryFn: () => campaignApis.getAllCampaigns(param),
  });

const useGetCampaignById = (campaignId: number) =>
  useQuery({
    queryKey: campaignQueryKeys.detail(campaignId),
    queryFn: () => campaignApis.getCampaign(campaignId),
    enabled: !!campaignId,
  });

const useAddCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignInput) =>
      campaignApis.addCampaign(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
};

const useUpdateCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      existing,
    }: {
      id: number;
      payload: CreateCampaignInput;
      existing: Campaign;
    }) => campaignApis.updateCampaign(id, payload, existing),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
};

const useDeleteCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => campaignApis.deleteCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
};

const useUpdateCampaignStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      campaignApis.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
};

const campaignQueries = {
  useGetAllCampaigns,
  useGetCampaignById,
  useAddCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useUpdateCampaignStatus,
};

export default campaignQueries;
