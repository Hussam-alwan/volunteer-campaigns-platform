package com.uni.impact.campaign_photo;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping(value = "/api/v1/campaign-photos")
@RequiredArgsConstructor
public class CampaignPhotoController {

    private final CampaignPhotoService campaignPhotoService;
    private final CampaignPhotoMapper campaignPhotoMapper;

    @GetMapping
    public ResponseEntity<Page<CampaignPhotoDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(campaignPhotoService.findAll(pageable).map(campaignPhotoMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignPhotoDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(campaignPhotoMapper.toDto(campaignPhotoService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<CampaignPhotoDTO> create(@Valid @RequestBody CampaignPhotoDTO campaignPhotoDTO) {
        CampaignPhoto created = campaignPhotoService.create(campaignPhotoDTO);
        return ResponseEntity.created(URI.create("/api/v1/campaign-photos/" + created.getPhotoId()))
                .body(campaignPhotoMapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampaignPhotoDTO> update(@PathVariable Long id, @RequestBody @Valid final CampaignPhotoDTO campaignPhotoDTO) {
        campaignPhotoService.update(id, campaignPhotoDTO);
        return ResponseEntity.ok(campaignPhotoMapper.toDto(campaignPhotoService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable final Long id) {
        campaignPhotoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
