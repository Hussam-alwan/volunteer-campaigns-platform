package com.uni.impact.campaign;

import com.uni.impact.application.ApplicationRepository;
import com.uni.impact.attendance.AttendanceRepository;
import com.uni.impact.campaign.dto.CampaignSearchCriteria;
import com.uni.impact.campaign_photo.CampaignPhotoService;
import com.uni.impact.category.Category;
import com.uni.impact.category.CategoryRepository;
import com.uni.impact.progress.ProgressRepository;
import com.uni.impact.user.User;
import com.uni.impact.user.UserRepository;
import com.uni.impact.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CampaignMapper campaignMapper;
    private final CampaignPhotoService campaignPhotoService;
    private final ApplicationRepository applicationRepository;
    private final AttendanceRepository attendanceRepository;
    private final ProgressRepository progressRepository;

    public Page<Campaign> findAll(Pageable pageable) {
        return campaignRepository.findAll(pageable);
    }


    public Page<Campaign> searchCampaigns(CampaignSearchCriteria criteria, Pageable pageable) {
        Specification<Campaign> spec = CampaignSpecification.withSearchCriteria(criteria);
        return campaignRepository.findAll(spec, pageable);
    }

    public Campaign findById(final Long campaignId) {
        return campaignRepository.findById(campaignId).orElseThrow(NotFoundException::new);
    }

    @Transactional
    public Campaign patchDetails(final Long campaignId, final CampaignRequestDTO campaignDTO) {
        // Mapper ignores nulls so only provided fields are updated; relations are not touched here.
        Campaign campaign = campaignRepository.findById(campaignId).orElseThrow(NotFoundException::new);
        campaignMapper.updateEntity(campaign, campaignDTO);
        return campaignRepository.save(campaign);
    }

    @Transactional
    public Campaign updateStatus(final Long campaignId, final CampaignStatus newStatus) {
        Campaign campaign = campaignRepository.findById(campaignId).orElseThrow(NotFoundException::new);
        CampaignStatus current = campaign.getStatus();
        if (!isValidTransition(current, newStatus)) {
            throw new IllegalArgumentException("Invalid status transition from " + current + " to " + newStatus);
        }
        campaign.setStatus(newStatus);
        return campaignRepository.save(campaign);
    }

    private boolean isValidTransition(final CampaignStatus from, final CampaignStatus to) {
        if (from == to) return true;
        return switch (from) {
            case PENDING ->
                    to == CampaignStatus.APPROVED || to == CampaignStatus.REJECTED || to == CampaignStatus.CANCELED;
            case APPROVED -> to == CampaignStatus.ONGOING || to == CampaignStatus.CANCELED;
            case ONGOING -> to == CampaignStatus.COMPLETED || to == CampaignStatus.CANCELED;
            default -> false; // REJECTED, COMPLETED, CANCELED are terminal
        };
    }

    @Transactional
    public Campaign create(final CampaignRequestDTO campaignDTO) {
        Campaign campaign = campaignMapper.toEntity(campaignDTO);
        applyRelations(campaign, campaignDTO);
        return campaignRepository.save(campaign);
    }

    @Transactional
    public Campaign update(final Long campaignId, final CampaignRequestDTO campaignDTO) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(NotFoundException::new);
        campaignMapper.updateEntity(campaign, campaignDTO);
        applyRelations(campaign, campaignDTO);
        return campaignRepository.save(campaign);
    }

    @Transactional
    public void delete(final Long campaignId) {
        final Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(NotFoundException::new);
        try {
            // Photos first: they FK to both campaign and progress.
            campaignPhotoService.deleteByCampaign(campaignId);
            applicationRepository.deleteByCampaignCampaignId(campaignId);
            attendanceRepository.deleteByCampaignCampaignId(campaignId);
            progressRepository.deleteByCampaignCampaignId(campaignId);
            campaignRepository.delete(campaign);
        } catch (final Exception e) {
            throw new IllegalStateException("campaign could not be deleted", e);
        }
    }


    private void applyRelations(final Campaign campaign, final CampaignRequestDTO campaignDTO) {
        final User proposedBy = campaignDTO.getProposedBy() == null ? null : userRepository.findById(campaignDTO.getProposedBy())
                .orElseThrow(() -> new NotFoundException("proposedBy not found"));
        campaign.setProposedBy(proposedBy);
        final User approvedBy = campaignDTO.getApprovedBy() == null ? null : userRepository.findById(campaignDTO.getApprovedBy())
                .orElseThrow(() -> new NotFoundException("approvedBy not found"));
        campaign.setApprovedBy(approvedBy);
        final User managedBy = campaignDTO.getManagedBy() == null ? null : userRepository.findById(campaignDTO.getManagedBy())
                .orElseThrow(() -> new NotFoundException("managedBy not found"));
        campaign.setManagedBy(managedBy);
        final Category category = campaignDTO.getCategory() == null ? null : categoryRepository.findById(campaignDTO.getCategory())
                .orElseThrow(() -> new NotFoundException("category not found"));
        campaign.setCategory(category);
    }
}
