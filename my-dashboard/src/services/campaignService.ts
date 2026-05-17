// src/services/campaignService.ts
import API from "../API/axios";
import {
  type Campaign,
  type CampaignPhoto,
  type CreateCampaignInput,
} from "../Types2/campaign";
// واجهة لبيانات الـ Pagination (الصفحات) القادمة من السواغر وعادة ما تسمى content
interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const campaignService = {
  // جلب كل الحملات
  getAllCampaigns: () => API.get<PaginatedResponse<Campaign>>("/campaigns"),

  // إنشاء حملة جديدة
  createCampaign: (campaignData: CreateCampaignInput) =>
    API.post<Campaign>("/campaigns", campaignData),

  // جلب صور حملة معينة
  getCampaignPhotos: (campaignId: number, page = 0, size = 10) =>
    API.get<PaginatedResponse<CampaignPhoto>>(
      `/campaigns/${campaignId}/photos?page=${page}&size=${size}`,
    ),

  // رفع صورة واحدة كملف (Multipart)
  uploadSinglePhoto: (campaignId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.post<CampaignPhoto>(
      `/campaigns/${campaignId}/photos/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

  // رفع صور متعددة في وقت واحد (Multipart)
  uploadMultiplePhotos: (campaignId: number, files: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    return API.post<CampaignPhoto[]>(
      `/campaigns/${campaignId}/photos/uploads`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

  // إضافة صورة للحملة عن طريق رابط خارجي URL
  addPhotoByUrl: (campaignId: number, photoUrl: string) =>
    API.post<CampaignPhoto>(`/campaigns/${campaignId}/photos`, { photoUrl }),
};
