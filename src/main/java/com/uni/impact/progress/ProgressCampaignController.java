package com.uni.impact.progress;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping(value = "/api/v1/campaigns")
@RequiredArgsConstructor
public class ProgressCampaignController {

    private final ProgressService progressService;
    private final ProgressMapper progressMapper;

    @PostMapping("/{id}/progress")
    public ResponseEntity<ProgressDTO> createProgress(@PathVariable Long id, @RequestBody ProgressDTO progressDTO) {
        progressDTO.setCampaign(id);
        Progress created = progressService.create(progressDTO);
        return ResponseEntity.created(URI.create("/api/v1/progresses/" + created.getProgressId()))
                .body(progressMapper.toDto(created));
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<Page<ProgressDTO>> getProgress(@PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(progressService.findByCampaign(id, pageable).map(progressMapper::toDto));
    }
}

