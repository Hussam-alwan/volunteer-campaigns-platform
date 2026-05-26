package com.uni.impact.campaign;

import com.uni.impact.category.Category;
import com.uni.impact.user.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-23T14:59:41+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CampaignMapperImpl implements CampaignMapper {

    @Override
    public CampaignResponseDTO toDto(Campaign entity) {
        if ( entity == null ) {
            return null;
        }

        CampaignResponseDTO campaignResponseDTO = new CampaignResponseDTO();

        campaignResponseDTO.setProposedBy( entityProposedByUserId( entity ) );
        campaignResponseDTO.setApprovedBy( entityApprovedByUserId( entity ) );
        campaignResponseDTO.setManagedBy( entityManagedByUserId( entity ) );
        campaignResponseDTO.setCategory( entityCategoryCategoryId( entity ) );
        campaignResponseDTO.setCampaignId( entity.getCampaignId() );
        campaignResponseDTO.setTitle( entity.getTitle() );
        campaignResponseDTO.setDescription( entity.getDescription() );
        campaignResponseDTO.setLocation( entity.getLocation() );
        campaignResponseDTO.setStartDate( entity.getStartDate() );
        campaignResponseDTO.setEndDate( entity.getEndDate() );
        campaignResponseDTO.setMaxVolunteers( entity.getMaxVolunteers() );
        campaignResponseDTO.setStatus( entity.getStatus() );
        campaignResponseDTO.setPublishedAt( entity.getPublishedAt() );
        campaignResponseDTO.setCreatedAt( entity.getCreatedAt() );
        campaignResponseDTO.setUpdatedAt( entity.getUpdatedAt() );

        return campaignResponseDTO;
    }

    @Override
    public Campaign toEntity(CampaignRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Campaign campaign = new Campaign();

        campaign.setTitle( dto.getTitle() );
        campaign.setDescription( dto.getDescription() );
        campaign.setLocation( dto.getLocation() );
        campaign.setStartDate( dto.getStartDate() );
        campaign.setEndDate( dto.getEndDate() );
        campaign.setMaxVolunteers( dto.getMaxVolunteers() );
        campaign.setStatus( dto.getStatus() );

        return campaign;
    }

    @Override
    public void updateEntity(Campaign entity, CampaignRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getTitle() != null ) {
            entity.setTitle( dto.getTitle() );
        }
        if ( dto.getDescription() != null ) {
            entity.setDescription( dto.getDescription() );
        }
        if ( dto.getLocation() != null ) {
            entity.setLocation( dto.getLocation() );
        }
        if ( dto.getStartDate() != null ) {
            entity.setStartDate( dto.getStartDate() );
        }
        if ( dto.getEndDate() != null ) {
            entity.setEndDate( dto.getEndDate() );
        }
        if ( dto.getMaxVolunteers() != null ) {
            entity.setMaxVolunteers( dto.getMaxVolunteers() );
        }
        if ( dto.getStatus() != null ) {
            entity.setStatus( dto.getStatus() );
        }
    }

    private Long entityProposedByUserId(Campaign campaign) {
        if ( campaign == null ) {
            return null;
        }
        User proposedBy = campaign.getProposedBy();
        if ( proposedBy == null ) {
            return null;
        }
        Long userId = proposedBy.getUserId();
        if ( userId == null ) {
            return null;
        }
        return userId;
    }

    private Long entityApprovedByUserId(Campaign campaign) {
        if ( campaign == null ) {
            return null;
        }
        User approvedBy = campaign.getApprovedBy();
        if ( approvedBy == null ) {
            return null;
        }
        Long userId = approvedBy.getUserId();
        if ( userId == null ) {
            return null;
        }
        return userId;
    }

    private Long entityManagedByUserId(Campaign campaign) {
        if ( campaign == null ) {
            return null;
        }
        User managedBy = campaign.getManagedBy();
        if ( managedBy == null ) {
            return null;
        }
        Long userId = managedBy.getUserId();
        if ( userId == null ) {
            return null;
        }
        return userId;
    }

    private Long entityCategoryCategoryId(Campaign campaign) {
        if ( campaign == null ) {
            return null;
        }
        Category category = campaign.getCategory();
        if ( category == null ) {
            return null;
        }
        Long categoryId = category.getCategoryId();
        if ( categoryId == null ) {
            return null;
        }
        return categoryId;
    }
}
