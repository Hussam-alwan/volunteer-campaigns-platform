package com.uni.impact.application;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/v1/campaigns")
@RequiredArgsConstructor
public class ApplicationCampaignController {

    private final ApplicationService applicationService;
    private final ApplicationMapper applicationMapper;

    @PostMapping("/{id}/apply")
    public ResponseEntity<Void> apply(@PathVariable Long id,
                                      @RequestBody(required = false) ApplicationDTO applicationDTO,
                                      @RequestParam(required = false) String email) {
        applicationService.applyToCampaign(id, email, applicationDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<Page<ApplicationDTO>> getApplications(@PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(applicationService.findByCampaign(id, pageable).map(applicationMapper::toDto));
    }
}

