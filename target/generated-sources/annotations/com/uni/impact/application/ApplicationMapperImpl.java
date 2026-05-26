package com.uni.impact.application;

import com.uni.impact.campaign.Campaign;
import com.uni.impact.user.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-23T14:59:40+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ApplicationMapperImpl implements ApplicationMapper {

    @Override
    public ApplicationResponseDTO toDto(Application entity) {
        if ( entity == null ) {
            return null;
        }

        ApplicationResponseDTO applicationResponseDTO = new ApplicationResponseDTO();

        applicationResponseDTO.setStudent( entityStudentUserId( entity ) );
        applicationResponseDTO.setCampaign( entityCampaignCampaignId( entity ) );
        applicationResponseDTO.setReviewedBy( entityReviewedByUserId( entity ) );
        applicationResponseDTO.setRemovedBy( entityRemovedByUserId( entity ) );
        applicationResponseDTO.setId( entity.getId() );
        applicationResponseDTO.setMotivationLetter( entity.getMotivationLetter() );
        applicationResponseDTO.setStatus( entity.getStatus() );
        applicationResponseDTO.setRejectionReason( entity.getRejectionReason() );
        applicationResponseDTO.setAdminNotes( entity.getAdminNotes() );
        applicationResponseDTO.setAppliedAt( entity.getAppliedAt() );
        applicationResponseDTO.setWithdrawnAt( entity.getWithdrawnAt() );
        applicationResponseDTO.setCreatedAt( entity.getCreatedAt() );
        applicationResponseDTO.setUpdatedAt( entity.getUpdatedAt() );
        applicationResponseDTO.setReviewedAt( entity.getReviewedAt() );
        applicationResponseDTO.setRemovalReason( entity.getRemovalReason() );
        applicationResponseDTO.setRemovedAt( entity.getRemovedAt() );

        return applicationResponseDTO;
    }

    @Override
    public Application toEntity(ApplicationRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Application application = new Application();

        application.setMotivationLetter( dto.getMotivationLetter() );
        application.setStatus( dto.getStatus() );
        application.setAdminNotes( dto.getAdminNotes() );
        application.setRejectionReason( dto.getRejectionReason() );
        application.setAppliedAt( dto.getAppliedAt() );
        application.setReviewedAt( dto.getReviewedAt() );
        application.setRemovalReason( dto.getRemovalReason() );

        return application;
    }

    @Override
    public void updateEntity(Application entity, ApplicationRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getMotivationLetter() != null ) {
            entity.setMotivationLetter( dto.getMotivationLetter() );
        }
        if ( dto.getStatus() != null ) {
            entity.setStatus( dto.getStatus() );
        }
        if ( dto.getAdminNotes() != null ) {
            entity.setAdminNotes( dto.getAdminNotes() );
        }
        if ( dto.getRejectionReason() != null ) {
            entity.setRejectionReason( dto.getRejectionReason() );
        }
        if ( dto.getAppliedAt() != null ) {
            entity.setAppliedAt( dto.getAppliedAt() );
        }
        if ( dto.getReviewedAt() != null ) {
            entity.setReviewedAt( dto.getReviewedAt() );
        }
        if ( dto.getRemovalReason() != null ) {
            entity.setRemovalReason( dto.getRemovalReason() );
        }
    }

    private Long entityStudentUserId(Application application) {
        if ( application == null ) {
            return null;
        }
        User student = application.getStudent();
        if ( student == null ) {
            return null;
        }
        Long userId = student.getUserId();
        if ( userId == null ) {
            return null;
        }
        return userId;
    }

    private Long entityCampaignCampaignId(Application application) {
        if ( application == null ) {
            return null;
        }
        Campaign campaign = application.getCampaign();
        if ( campaign == null ) {
            return null;
        }
        Long campaignId = campaign.getCampaignId();
        if ( campaignId == null ) {
            return null;
        }
        return campaignId;
    }

    private Long entityReviewedByUserId(Application application) {
        if ( application == null ) {
            return null;
        }
        User reviewedBy = application.getReviewedBy();
        if ( reviewedBy == null ) {
            return null;
        }
        Long userId = reviewedBy.getUserId();
        if ( userId == null ) {
            return null;
        }
        return userId;
    }

    private Long entityRemovedByUserId(Application application) {
        if ( application == null ) {
            return null;
        }
        User removedBy = application.getRemovedBy();
        if ( removedBy == null ) {
            return null;
        }
        Long userId = removedBy.getUserId();
        if ( userId == null ) {
            return null;
        }
        return userId;
    }
}
