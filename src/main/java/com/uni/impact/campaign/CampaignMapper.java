package com.uni.impact.campaign;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CampaignMapper {

    @Mapping(target = "proposedBy", source = "proposedBy.userId")
    @Mapping(target = "approvedBy", source = "approvedBy.userId")
    @Mapping(target = "managedBy", source = "managedBy.userId")
    @Mapping(target = "category", source = "category.categoryId")
    CampaignResponseDTO toDto(Campaign entity);

    @Mapping(target = "campaignId", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "proposedBy", ignore = true)
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "managedBy", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "campaignApplications", ignore = true)
    @Mapping(target = "campaignCampaignPhotos", ignore = true)
    @Mapping(target = "campaignAttendances", ignore = true)
    @Mapping(target = "campaignProgresses", ignore = true)
    Campaign toEntity(CampaignRequestDTO dto);

    @Mapping(target = "campaignId", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "proposedBy", ignore = true)
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "managedBy", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "campaignApplications", ignore = true)
    @Mapping(target = "campaignCampaignPhotos", ignore = true)
    @Mapping(target = "campaignAttendances", ignore = true)
    @Mapping(target = "campaignProgresses", ignore = true)
    void updateEntity(@MappingTarget Campaign entity, CampaignRequestDTO dto);
}
