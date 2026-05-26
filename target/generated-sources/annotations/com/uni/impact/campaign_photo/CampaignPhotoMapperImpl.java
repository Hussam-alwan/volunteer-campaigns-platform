package com.uni.impact.campaign_photo;

import com.uni.impact.campaign.Campaign;
import com.uni.impact.progress.Progress;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-23T14:59:41+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CampaignPhotoMapperImpl implements CampaignPhotoMapper {

    @Override
    public CampaignPhotoResponseDTO toDto(CampaignPhoto entity) {
        if ( entity == null ) {
            return null;
        }

        CampaignPhotoResponseDTO campaignPhotoResponseDTO = new CampaignPhotoResponseDTO();

        campaignPhotoResponseDTO.setCampaign( entityCampaignCampaignId( entity ) );
        campaignPhotoResponseDTO.setProgress( entityProgressProgressId( entity ) );
        campaignPhotoResponseDTO.setPhotoId( entity.getPhotoId() );
        campaignPhotoResponseDTO.setPhotoUrl( entity.getPhotoUrl() );
        campaignPhotoResponseDTO.setUploadedAt( entity.getUploadedAt() );
        campaignPhotoResponseDTO.setCreatedAt( entity.getCreatedAt() );
        campaignPhotoResponseDTO.setUpdatedAt( entity.getUpdatedAt() );

        return campaignPhotoResponseDTO;
    }

    @Override
    public CampaignPhoto toEntity(CampaignPhotoRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        CampaignPhoto campaignPhoto = new CampaignPhoto();

        campaignPhoto.setPhotoUrl( dto.getPhotoUrl() );
        campaignPhoto.setUploadedAt( dto.getUploadedAt() );

        return campaignPhoto;
    }

    @Override
    public void updateEntity(CampaignPhoto entity, CampaignPhotoRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getPhotoUrl() != null ) {
            entity.setPhotoUrl( dto.getPhotoUrl() );
        }
        if ( dto.getUploadedAt() != null ) {
            entity.setUploadedAt( dto.getUploadedAt() );
        }
    }

    private Long entityCampaignCampaignId(CampaignPhoto campaignPhoto) {
        if ( campaignPhoto == null ) {
            return null;
        }
        Campaign campaign = campaignPhoto.getCampaign();
        if ( campaign == null ) {
            return null;
        }
        Long campaignId = campaign.getCampaignId();
        if ( campaignId == null ) {
            return null;
        }
        return campaignId;
    }

    private Long entityProgressProgressId(CampaignPhoto campaignPhoto) {
        if ( campaignPhoto == null ) {
            return null;
        }
        Progress progress = campaignPhoto.getProgress();
        if ( progress == null ) {
            return null;
        }
        Long progressId = progress.getProgressId();
        if ( progressId == null ) {
            return null;
        }
        return progressId;
    }
}
