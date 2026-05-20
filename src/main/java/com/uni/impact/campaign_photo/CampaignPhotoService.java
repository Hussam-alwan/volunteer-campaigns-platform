package com.uni.impact.campaign_photo;


import com.uni.impact.campaign.Campaign;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.progress.Progress;
import com.uni.impact.progress.ProgressRepository;
import com.uni.impact.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CampaignPhotoService {

    private final CampaignPhotoRepository campaignPhotoRepository;
    private final CampaignRepository campaignRepository;
    private final ProgressRepository progressRepository;
    private final CampaignPhotoMapper campaignPhotoMapper;

    public Page<CampaignPhoto> findAll(Pageable pageable) {
        return campaignPhotoRepository.findAll(pageable);
    }

    public CampaignPhoto findById(final Long photoId) {
        return campaignPhotoRepository.findById(photoId).orElseThrow(NotFoundException::new);
    }

    @Transactional
    public CampaignPhoto create(final CampaignPhotoDTO campaignPhotoDTO) {
        if (campaignPhotoDTO.getPhotoId() != null) {
            throw new IllegalArgumentException("A new campaign photo cannot already have an ID");
        }
        CampaignPhoto campaignPhoto = campaignPhotoMapper.toEntity(campaignPhotoDTO);
        applyRelations(campaignPhoto, campaignPhotoDTO);
        return campaignPhotoRepository.save(campaignPhoto);
    }

    @Transactional
    public CampaignPhoto update(final Long photoId, final CampaignPhotoDTO campaignPhotoDTO) {
        CampaignPhoto campaignPhoto = campaignPhotoRepository.findById(photoId)
                .orElseThrow(NotFoundException::new);
        campaignPhotoMapper.updateEntity(campaignPhoto, campaignPhotoDTO);
        applyRelations(campaignPhoto, campaignPhotoDTO);
        return campaignPhotoRepository.save(campaignPhoto);
    }

    public void delete(final Long photoId) {
        final CampaignPhoto campaignPhoto = campaignPhotoRepository.findById(photoId)
                .orElseThrow(NotFoundException::new);
       try {
              campaignPhotoRepository.delete(campaignPhoto);
         } catch (final Exception e) {
              throw new IllegalStateException("Unable to delete campaign photo", e);
       }
    }

    private void applyRelations(final CampaignPhoto campaignPhoto, final CampaignPhotoDTO campaignPhotoDTO) {
        final Campaign campaign = campaignPhotoDTO.getCampaign() == null ? null : campaignRepository.findById(campaignPhotoDTO.getCampaign())
                .orElseThrow(() -> new NotFoundException("campaign not found"));
        campaignPhoto.setCampaign(campaign);
        final Progress progress = campaignPhotoDTO.getProgress() == null ? null : progressRepository.findById(campaignPhotoDTO.getProgress())
                .orElseThrow(() -> new NotFoundException("progress not found"));
        campaignPhoto.setProgress(progress);
    }
}
