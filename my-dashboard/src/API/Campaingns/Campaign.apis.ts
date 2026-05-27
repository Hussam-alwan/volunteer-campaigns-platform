import ApiInstance from "../api.instance";
import type { IPagination } from "../../common.interfaces";
import CampaignApiRoutes from "./Campaign.api-routes";
import useAuthStore from "../../store/auth.store";
import type {
  Campaign,
  CreateCampaignInput,
  CampaignStatus,
} from "../../Types2/campaign";

interface BackendCampaign {
  campaignId: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxVolunteers: number;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  proposedBy: number;
  approvedBy: number | null;
  managedBy: number;
  category: number;
}

interface BackendPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ICampaignsPage {
  content: Campaign[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const toCampaign = (b: BackendCampaign): Campaign => ({
  id: b.campaignId,
  title: b.title,
  description: b.description,
  location: b.location,
  start_date: b.startDate,
  end_date: b.endDate,
  max_volunteers: b.maxVolunteers,
  current_volunteers: 0,
  actual_progress: 0,
  status: (b.status || "").toLowerCase() as CampaignStatus,
  categoryId: b.category,
  proposedBy: b.proposedBy,
  approvedBy: b.approvedBy ?? undefined,
  managedBy: b.managedBy,
  photos: [],
});

const toBackendPayload = (
  p: CreateCampaignInput,
  opts: { status: string; proposedBy: number },
) => ({
  title: p.title,
  description: p.description,
  location: p.location,
  startDate: p.start_date,
  endDate: p.end_date,
  maxVolunteers: p.max_volunteers,
  category: p.categoryId,
  status: opts.status,
  proposedBy: opts.proposedBy,
});

const currentUserId = (): number => {
  const user = useAuthStore.getState().user;
  if (!user?.userId) {
    throw new Error("Not authenticated — cannot determine proposedBy.");
  }
  return user.userId;
};

const getAllCampaigns = async (
  params?: IPagination,
): Promise<ICampaignsPage> => {
  const { data } = await ApiInstance.get<BackendPage<BackendCampaign>>(
    CampaignApiRoutes.GetAll,
    { params },
  );
  return { ...data, content: data.content.map(toCampaign) };
};

const getCampaign = async (id: number): Promise<Campaign> => {
  const { data } = await ApiInstance.get<BackendCampaign>(
    `${CampaignApiRoutes.GetAll}/${id}`,
  );
  return toCampaign(data);
};

const addCampaign = async (payload: CreateCampaignInput): Promise<Campaign> => {
  const { data } = await ApiInstance.post<BackendCampaign>(
    CampaignApiRoutes.GetAll,
    toBackendPayload(payload, {
      status: "PENDING",
      proposedBy: currentUserId(),
    }),
  );
  return toCampaign(data);
};

const updateCampaign = async (
  id: number,
  payload: CreateCampaignInput,
  existing: Campaign,
): Promise<Campaign> => {
  const { data } = await ApiInstance.put<BackendCampaign>(
    `${CampaignApiRoutes.GetAll}/${id}`,
    toBackendPayload(payload, {
      status: (existing.status || "PENDING").toUpperCase(),
      proposedBy: existing.proposedBy,
    }),
  );
  return toCampaign(data);
};

const deleteCampaign = async (id: number): Promise<void> => {
  await ApiInstance.delete(`${CampaignApiRoutes.GetAll}/${id}`);
};

const updateStatus = async (id: number, status: string): Promise<Campaign> => {
  const { data } = await ApiInstance.patch<BackendCampaign>(
    `${CampaignApiRoutes.GetAll}/${id}/status`,
    { status },
  );
  return toCampaign(data);
};

const campaignApis = {
  getAllCampaigns,
  getCampaign,
  addCampaign,
  updateCampaign,
  deleteCampaign,
  updateStatus,
};

export default campaignApis;
