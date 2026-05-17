// src/types/campaign.ts

// حالات الحملة المعتمدة في قاعدة البيانات (Enum)
export type CampaignStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "ongoing"
  | "completed"
  | "cancelled";

// هيكل بيانات الصورة القادمة من الـ API
export interface CampaignPhoto {
  photoId: number;
  campaignId: number;
  progressId?: number;
  photoUrl: string;
  uploadedAt: string;
}

// هيكل بيانات الحملة بالكامل
export interface Campaign {
  id: number;
  proposedBy: number;
  approvedBy?: number;
  managedBy?: number;
  categoryId: number;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  max_volunteers: number;
  current_volunteers: number; // يتم حسابها أو جلبها لتعرف كم متطوع سجل
  status: CampaignStatus;
  actual_progress: number; // نسبة الإنجاز الفعلي على الأرض
  photos: CampaignPhoto[];
}

// البيانات المطلوبة حصراً عند إرسال فورم إنشاء حملة جديدة
export interface CreateCampaignInput {
  title: string;
  description: string;
  location: string;
  categoryId: number;
  max_volunteers: number;
  start_date: string;
  end_date: string;
}
