package com.uni.impact.progress;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/progresses")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;
    private final ProgressMapper progressMapper;

    @GetMapping
    public ResponseEntity<Page<ProgressDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(progressService.findAll(pageable).map(progressMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgressDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(progressMapper.toDto(progressService.findById(id)));
    }
    // Creation / update / delete are handled via campaign-scoped endpoints in ProgressCampaignController
    // (POST /api/v1/campaigns/{id}/progress and GET /api/v1/campaigns/{id}/progress)
}
