package com.uni.impact.progress;


import com.uni.impact.campaign.Campaign;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.user.User;
import com.uni.impact.user.UserRepository;
import com.uni.impact.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final ProgressMapper progressMapper;

    public Page<Progress> findAll(Pageable pageable) {
        return progressRepository.findAll(pageable);
    }

    public Progress findById(final Long progressId) {
        return progressRepository.findById(progressId).orElseThrow(NotFoundException::new);
    }

    public Page<Progress> findByCampaign(final Long campaignId, Pageable pageable) {
        return progressRepository.findByCampaignCampaignId(campaignId, pageable);
    }

    @Transactional
    public Progress create(final ProgressDTO progressDTO) {
        if (progressDTO.getProgressId() != null) {
            throw new IllegalArgumentException("A new progress cannot already have an ID");
        }
        Progress progress = progressMapper.toEntity(progressDTO);
        applyRelations(progress, progressDTO);
        return progressRepository.save(progress);
    }

    @Transactional
    public Progress update(final Long progressId, final ProgressDTO progressDTO) {
        Progress progress = progressRepository.findById(progressId)
                .orElseThrow(NotFoundException::new);
        progressMapper.updateEntity(progress, progressDTO);
        applyRelations(progress, progressDTO);
        return progressRepository.save(progress);
    }

    public void delete(final Long progressId) {
        final Progress progress = progressRepository.findById(progressId)
                .orElseThrow(NotFoundException::new);
        try {
            progressRepository.delete(progress);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to delete progress. It might be referenced by other entities.");
        }
    }

    private void applyRelations(final Progress progress, final ProgressDTO progressDTO) {
        final Campaign campaign = progressDTO.getCampaign() == null ? null : campaignRepository.findById(progressDTO.getCampaign())
                .orElseThrow(() -> new NotFoundException("campaign not found"));
        progress.setCampaign(campaign);
        final User updatedBy = progressDTO.getUpdatedBy() == null ? null : userRepository.findById(progressDTO.getUpdatedBy())
                .orElseThrow(() -> new NotFoundException("updatedBy not found"));
        progress.setUpdatedBy(updatedBy);
    }
}
