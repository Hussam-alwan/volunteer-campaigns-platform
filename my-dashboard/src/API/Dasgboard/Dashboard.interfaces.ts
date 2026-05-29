export interface IDashboardSummary {
  activeCampaigns: number;
  totalApplications: number;
  totalVolunteers: number | null;
  byStatus: {
    approved: number;
    pending: number;
    rejected: number;
    withdrawn: number;
  };
}
