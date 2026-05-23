package com.uni.impact.campaign_photo;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/campaign-photos")
@RequiredArgsConstructor
public class CampaignPhotoController {

    private final CampaignPhotoService campaignPhotoService;
    private final CampaignPhotoMapper campaignPhotoMapper;

    @GetMapping
    public ResponseEntity<Page<CampaignPhotoResponseDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(campaignPhotoService.findAll(pageable).map(campaignPhotoMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignPhotoResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(campaignPhotoMapper.toDto(campaignPhotoService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        campaignPhotoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
