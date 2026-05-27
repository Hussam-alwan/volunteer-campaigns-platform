package com.uni.impact.campaign;

import com.uni.impact.campaign.dto.CampaignSearchCriteria;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping(value = "/api/v1/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;
    private final CampaignMapper campaignMapper;

    @GetMapping
    public ResponseEntity<Page<CampaignResponseDTO>> findAll(@ModelAttribute CampaignSearchCriteria criteria, Pageable pageable) {
        Page<Campaign> campaigns = campaignService.searchCampaigns(criteria, pageable);
        return ResponseEntity.ok(campaigns.map(campaignMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(campaignMapper.toDto(campaignService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<CampaignResponseDTO> create(@Valid @RequestBody CampaignRequestDTO campaignDTO) {
        Campaign created = campaignService.create(campaignDTO);
        return ResponseEntity.created(URI.create("/api/v1/campaigns/" + created.getCampaignId()))
                .body(campaignMapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampaignResponseDTO> update(@PathVariable Long id, @RequestBody @Valid final CampaignRequestDTO campaignDTO) {
        campaignService.update(id, campaignDTO);
        return ResponseEntity.ok(campaignMapper.toDto(campaignService.findById(id)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CampaignResponseDTO> patchDetails(@PathVariable Long id, @RequestBody final CampaignRequestDTO campaignDTO) {
        campaignService.patchDetails(id, campaignDTO);
        return ResponseEntity.ok(campaignMapper.toDto(campaignService.findById(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CampaignResponseDTO> updateStatus(@PathVariable Long id, @RequestBody final CampaignStatusUpdateDTO statusDTO) {
        campaignService.updateStatus(id, statusDTO.getStatus());
        return ResponseEntity.ok(campaignMapper.toDto(campaignService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable final Long id) {
        campaignService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
