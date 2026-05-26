package com.uni.impact.progress;

import com.uni.impact.campaign.Campaign;
import com.uni.impact.user.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-23T14:59:41+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ProgressMapperImpl implements ProgressMapper {

    @Override
    public ProgressResponseDTO toDto(Progress entity) {
        if ( entity == null ) {
            return null;
        }

        ProgressResponseDTO progressResponseDTO = new ProgressResponseDTO();

        progressResponseDTO.setCampaign( entityCampaignCampaignId( entity ) );
        progressResponseDTO.setUpdatedBy( entityUpdatedByUserId( entity ) );
        progressResponseDTO.setProgressId( entity.getProgressId() );
        progressResponseDTO.setPercentage( entity.getPercentage() );
        progressResponseDTO.setNotes( entity.getNotes() );
        progressResponseDTO.setCreatedAt( entity.getCreatedAt() );
        progressResponseDTO.setUpdatedAt( entity.getUpdatedAt() );

        return progressResponseDTO;
    }

    @Override
    public Progress toEntity(ProgressRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Progress progress = new Progress();

        progress.setPercentage( dto.getPercentage() );
        progress.setNotes( dto.getNotes() );

        return progress;
    }

    @Override
    public void updateEntity(Progress entity, ProgressRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getPercentage() != null ) {
            entity.setPercentage( dto.getPercentage() );
        }
        if ( dto.getNotes() != null ) {
            entity.setNotes( dto.getNotes() );
        }
    }

    private Long entityCampaignCampaignId(Progress progress) {
        if ( progress == null ) {
            return null;
        }
        Campaign campaign = progress.getCampaign();
        if ( campaign == null ) {
            return null;
        }
        Long campaignId = campaign.getCampaignId();
        if ( campaignId == null ) {
            return null;
        }
        return campaignId;
    }

    private Long entityUpdatedByUserId(Progress progress) {
        if ( progress == null ) {
            return null;
        }
        User updatedBy = progress.getUpdatedBy();
        if ( updatedBy == null ) {
            return null;
        }
        Long userId = updatedBy.getUserId();
        if ( userId == null ) {
            return null;
        }
        return userId;
    }
}
