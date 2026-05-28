// src/apis/campaign/campaign.interface.ts

// الحالة الخاصة بالحملة بناءً على السيرفر (مثل PENDING, ACTIVE, REJECTED)
export type TCampaignStatus = "PENDING" | "ACTIVE" | "REJECTED" | string;

export interface ICampaign {
  campaignId: number;
  title: string;
  description: string;
  location: string;
  startDate: string; // أو Date إذا كنتِ تفضلين التعامل معها ككائن تاريخ
  endDate: string;
  maxVolunteers: number;
  status: TCampaignStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  proposedBy: number;
  approvedBy: number | null;
  managedBy: number;
  category: number;
}

// شكل رد الـ Pagination القادم من Spring Boot (Page<Campaign>)
export interface ICampaignPage {
  content: ICampaign[];
  totalElements: number;
  totalPages: number;
  number: number; // رقم الصفحة الحالي (يبدأ من 0)
  size: number;
}

// الواجهة الخاصة بالبيانات التي يتم إرسالها عبر الـ Form لإنشاء حملة جديدة (Inputs)
export interface ICampaignInputs {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxVolunteers: number;
  category: number; // لتحديد القسم أو الفئة للحملة
}
