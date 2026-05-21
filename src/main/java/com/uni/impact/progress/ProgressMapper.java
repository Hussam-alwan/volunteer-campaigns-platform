package com.uni.impact.progress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProgressMapper {

    @Mapping(target = "campaign", source = "campaign.campaignId")
    @Mapping(target = "updatedBy", source = "updatedBy.userId")
    ProgressDTO toDto(Progress entity);

    @Mapping(target = "campaign", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "progressCampaignPhotos", ignore = true)
    Progress toEntity(ProgressDTO dto);

    @Mapping(target = "campaign", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "progressCampaignPhotos", ignore = true)
    void updateEntity(@MappingTarget Progress entity, ProgressDTO dto);
}
