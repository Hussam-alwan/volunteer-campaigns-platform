package com.uni.impact.campaign;

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
    public ResponseEntity<Page<CampaignDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(campaignService.findAll(pageable).map(campaignMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(campaignMapper.toDto(campaignService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<CampaignDTO> create(@Valid @RequestBody CampaignDTO campaignDTO) {
        Campaign created = campaignService.create(campaignDTO);
        return ResponseEntity.created(URI.create("/api/v1/campaigns/" + created.getCampaignId()))
                .body(campaignMapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampaignDTO> update(@PathVariable Long id, @RequestBody @Valid final CampaignDTO campaignDTO) {
        campaignService.update(id, campaignDTO);
        return ResponseEntity.ok(campaignMapper.toDto(campaignService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable final Long id) {
        campaignService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
