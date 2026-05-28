package com.uni.impact.campaign_photo;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping(value = "/api/v1/campaigns")
@RequiredArgsConstructor
@Tag(name = "Campaign Photos", description = "Campaign photo management endpoints")
public class CampaignPhotoCampaignController {

    private final CampaignPhotoService campaignPhotoService;
    private final CampaignPhotoMapper campaignPhotoMapper;

    @PostMapping("/{id}/photos")
    @Operation(summary = "Create photo from URL", description = "Create a campaign photo using a photo URL")
    public ResponseEntity<CampaignPhotoResponseDTO> createPhoto(@PathVariable Long id, @RequestBody CampaignPhotoRequestDTO photoDTO) {
        photoDTO.setCampaign(id);
        CampaignPhoto created = campaignPhotoService.create(photoDTO);
        return ResponseEntity.created(URI.create("/api/v1/campaign-photos/" + created.getPhotoId()))
                .body(campaignPhotoMapper.toDto(created));
    }

    @PostMapping(value = "/{id}/photos/upload", consumes = MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload photo file", description = "Upload a photo file for a campaign")
    public ResponseEntity<CampaignPhotoResponseDTO> uploadPhoto(
            @PathVariable Long id,
            @RequestPart(value = "file") MultipartFile file) {
        CampaignPhoto created = campaignPhotoService.createFromFile(id, file);
        return ResponseEntity.created(URI.create("/api/v1/campaign-photos/" + created.getPhotoId()))
                .body(campaignPhotoMapper.toDto(created));
    }

    @PostMapping(value = "/{id}/photos/uploads", consumes = MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload multiple photo files", description = "Upload multiple photo files for a campaign")
    public ResponseEntity<List<CampaignPhotoResponseDTO>> uploadPhotos(
            @PathVariable Long id,
            @RequestPart(value = "files") MultipartFile[] files) {
        List<CampaignPhoto> created = campaignPhotoService.createFromFiles(id, files);
        List<CampaignPhotoResponseDTO> dtos = created.stream().map(campaignPhotoMapper::toDto).toList();
        return ResponseEntity.created(URI.create("/api/v1/campaign-photos"))
                .body(dtos);
    }

    @GetMapping("/{id}/photos")
    @Operation(summary = "Get campaign photos", description = "Get all photos for a campaign")
    public ResponseEntity<Page<CampaignPhotoResponseDTO>> getPhotos(@PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(campaignPhotoService.findByCampaign(id, pageable).map(campaignPhotoMapper::toDto));
    }
}
