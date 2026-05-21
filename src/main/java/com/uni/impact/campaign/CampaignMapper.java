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
    CampaignDTO toDto(Campaign entity);

    @Mapping(target = "proposedBy", ignore = true)
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "managedBy", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "campaignApplications", ignore = true)
    @Mapping(target = "campaignCampaignPhotos", ignore = true)
    @Mapping(target = "campaignAttendances", ignore = true)
    @Mapping(target = "campaignProgresses", ignore = true)
    Campaign toEntity(CampaignDTO dto);

    @Mapping(target = "proposedBy", ignore = true)
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "managedBy", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "campaignApplications", ignore = true)
    @Mapping(target = "campaignCampaignPhotos", ignore = true)
    @Mapping(target = "campaignAttendances", ignore = true)
    @Mapping(target = "campaignProgresses", ignore = true)
    void updateEntity(@MappingTarget Campaign entity, CampaignDTO dto);
}
