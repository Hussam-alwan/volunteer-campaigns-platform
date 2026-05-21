package com.uni.impact.application;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/v1/campaigns")
@RequiredArgsConstructor
public class ApplicationCampaignController {

    private final ApplicationService applicationService;
    private final ApplicationMapper applicationMapper;

    @PostMapping("/{id}/apply")
    public ResponseEntity<Void> apply(@PathVariable Long id, @RequestBody(required = false) ApplicationDTO applicationDTO,
                                      @AuthenticationPrincipal Jwt jwt) {
        String email = jwt == null ? null : jwt.getClaimAsString("email");
        applicationService.applyToCampaign(id, email, applicationDTO);
        return ResponseEntity.ok().build();
    }

    // GET /api/v1/campaigns/{id}/applications
    @GetMapping("/{id}/applications")
    public ResponseEntity<Page<ApplicationDTO>> getApplications(@PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(applicationService.findByCampaign(id, pageable).map(applicationMapper::toDto));
    }
}

