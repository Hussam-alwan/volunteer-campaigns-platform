package com.uni.impact.campaign_photo;

import com.uni.impact.campaign.Campaign;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.progress.Progress;
import com.uni.impact.progress.ProgressRepository;
import com.uni.impact.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CampaignPhotoService {

    private final CampaignPhotoRepository campaignPhotoRepository;
    private final CampaignRepository campaignRepository;
    private final ProgressRepository progressRepository;
    private final CampaignPhotoMapper campaignPhotoMapper;

    @Value("${app.upload.dir:uploads/photos}")
    private String uploadDir;

    public Page<CampaignPhoto> findAll(Pageable pageable) {
        return campaignPhotoRepository.findAll(pageable);
    }

    public CampaignPhoto findById(final Long photoId) {
        return campaignPhotoRepository.findById(photoId).orElseThrow(NotFoundException::new);
    }

    public Page<CampaignPhoto> findByCampaign(final Long campaignId,Pageable pageable) {
        return campaignPhotoRepository.findByCampaignCampaignId(campaignId, pageable);
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
    public CampaignPhoto createFromFile(final Long campaignId, final MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        // Validate campaign exists
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new NotFoundException("Campaign not found"));

        // Generate unique filename
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();

        try {
            return saveFileAndCreatePhoto(campaign, filename, file.getBytes());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @Transactional
    public java.util.List<CampaignPhoto> createFromFiles(final Long campaignId, final MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("No files provided");
        }

        // Validate campaign exists
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new NotFoundException("Campaign not found"));

        java.util.List<CampaignPhoto> saved = new java.util.ArrayList<>();

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;

            String filename = java.util.UUID.randomUUID() + "_" + file.getOriginalFilename();

            try {
                saved.add(saveFileAndCreatePhoto(campaign, filename, file.getBytes()));
            } catch (IOException e) {
                throw new IllegalStateException("Failed to upload file: " + e.getMessage(), e);
            }
        }

        return saved;
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


    private CampaignPhoto saveFileAndCreatePhoto(Campaign campaign, String filename, byte[] content) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, content);

        CampaignPhoto campaignPhoto = new CampaignPhoto();
        campaignPhoto.setCampaign(campaign);
        campaignPhoto.setPhotoUrl("/uploads/photos/" + filename);
        campaignPhoto.setUploadedAt(LocalDateTime.now());

        return campaignPhotoRepository.save(campaignPhoto);
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
