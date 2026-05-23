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
    public CampaignPhoto create(final CampaignPhotoRequestDTO campaignPhotoDTO) {
        CampaignPhoto campaignPhoto = campaignPhotoMapper.toEntity(campaignPhotoDTO);
        applyRelations(campaignPhoto, campaignPhotoDTO);
        return campaignPhotoRepository.save(campaignPhoto);
    }

    @Transactional
    public CampaignPhoto createFromFile(final Long campaignId, final MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        validateImage(file);

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new NotFoundException("Campaign not found"));

        String filename = UUID.randomUUID() + buildExtension(file);

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

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new NotFoundException("Campaign not found"));

        java.util.List<CampaignPhoto> saved = new java.util.ArrayList<>();

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
            validateImage(file);

            String filename = UUID.randomUUID() + buildExtension(file);

            try {
                saved.add(saveFileAndCreatePhoto(campaign, filename, file.getBytes()));
            } catch (IOException e) {
                throw new IllegalStateException("Failed to upload file: " + e.getMessage(), e);
            }
        }

        return saved;
    }

    private void validateImage(final MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
    }

    private String buildExtension(final MultipartFile file) {
        String original = file.getOriginalFilename();
        if (original == null) return "";
        int dot = original.lastIndexOf('.');
        if (dot < 0 || dot == original.length() - 1) return "";
        String ext = original.substring(dot + 1).toLowerCase().replaceAll("[^a-z0-9]", "");
        return ext.isEmpty() ? "" : "." + ext;
    }

    @Transactional
    public CampaignPhoto update(final Long photoId, final CampaignPhotoRequestDTO campaignPhotoDTO) {
        CampaignPhoto campaignPhoto = campaignPhotoRepository.findById(photoId)
                .orElseThrow(NotFoundException::new);
        campaignPhotoMapper.updateEntity(campaignPhoto, campaignPhotoDTO);
        applyRelations(campaignPhoto, campaignPhotoDTO);
        return campaignPhotoRepository.save(campaignPhoto);
    }

    @Transactional
    public void delete(final Long photoId) {
        final CampaignPhoto campaignPhoto = campaignPhotoRepository.findById(photoId)
                .orElseThrow(NotFoundException::new);
        try {
            deleteFileOnDisk(campaignPhoto.getPhotoUrl());
            campaignPhotoRepository.delete(campaignPhoto);
        } catch (final Exception e) {
            throw new IllegalStateException("Unable to delete campaign photo", e);
        }
    }

    @Transactional
    public void deleteByCampaign(final Long campaignId) {
        java.util.List<CampaignPhoto> photos = campaignPhotoRepository.findAllByCampaignCampaignId(campaignId);
        for (CampaignPhoto photo : photos) {
            deleteFileOnDisk(photo.getPhotoUrl());
        }
        campaignPhotoRepository.deleteAll(photos);
    }

    private void deleteFileOnDisk(final String photoUrl) {
        if (photoUrl == null) return;
        // photoUrl is stored as "/uploads/photos/<filename>" — keep only the filename
        String filename = photoUrl.substring(photoUrl.lastIndexOf('/') + 1);
        if (filename.isEmpty()) return;
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            // make sure we never escape the upload dir
            Path base = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!filePath.toAbsolutePath().startsWith(base)) return;
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // best-effort: row delete still proceeds
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

    private void applyRelations(final CampaignPhoto campaignPhoto, final CampaignPhotoRequestDTO campaignPhotoDTO) {
        final Campaign campaign = campaignPhotoDTO.getCampaign() == null ? null : campaignRepository.findById(campaignPhotoDTO.getCampaign())
                .orElseThrow(() -> new NotFoundException("campaign not found"));
        campaignPhoto.setCampaign(campaign);
        final Progress progress = campaignPhotoDTO.getProgress() == null ? null : progressRepository.findById(campaignPhotoDTO.getProgress())
                .orElseThrow(() -> new NotFoundException("progress not found"));
        campaignPhoto.setProgress(progress);
    }
}
