package com.uni.impact.application;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import com.uni.impact.user.UserRepository;
import com.uni.impact.application.dto.VolunteerSearchCriteria;


@RestController
@RequestMapping(value = "/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationMapper applicationMapper;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<ApplicationDTO>> findAll(@ModelAttribute VolunteerSearchCriteria criteria, Pageable pageable) {
        Page<Application> applications = applicationService.searchVolunteers(criteria, pageable);
        return ResponseEntity.ok(applications.map(applicationMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationMapper.toDto(applicationService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApplicationDTO> create(@Valid @RequestBody ApplicationDTO applicationDTO) {
        Application created = applicationService.create(applicationDTO);
        return ResponseEntity
                .created(URI.create("/api/v1/applications/" + created.getId()))
                .body(applicationMapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid final ApplicationDTO applicationDTO) {
        applicationService.update(id, applicationDTO);
        return ResponseEntity.ok(applicationMapper.toDto(applicationService.findById(id)));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<ApplicationDTO>> myApplications(
            Pageable pageable,
            @AuthenticationPrincipal Jwt jwt) {
        String email = jwt == null ? null : jwt.getClaimAsString("email");
        return ResponseEntity.ok(applicationService.findByStudentEmail(email, pageable).map(applicationMapper::toDto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationDTO> changeStatus(@PathVariable Long id, @RequestBody final ApplicationDTO applicationDTO) {
        applicationService.changeStatus(id, applicationDTO.getStatus(), null, applicationDTO.getRejectionReason());
        return ResponseEntity.ok(applicationMapper.toDto(applicationService.findById(id)));
    }

    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<ApplicationDTO> withdraw(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        String email = jwt == null ? null : jwt.getClaimAsString("email");
        final com.uni.impact.user.User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new RuntimeException("user not found"));
        applicationService.withdraw(id, user.getUserId());
        return ResponseEntity.ok(applicationMapper.toDto(applicationService.findById(id)));
    }

    @PatchMapping("/{id}/remove")
    public ResponseEntity<ApplicationDTO> remove(@PathVariable Long id, @RequestBody final ApplicationDTO applicationDTO,
                                                 @AuthenticationPrincipal Jwt jwt) {
        // removal typically done by admin; passing remover if available
        Long removerId = null;
        if (jwt != null) {
            final com.uni.impact.user.User u = userRepository.findByEmailIgnoreCase(jwt.getClaimAsString("email")).orElse(null);
            removerId = u == null ? null : u.getUserId();
        }
        applicationService.remove(id, removerId, applicationDTO.getRemovalReason());
        return ResponseEntity.ok(applicationMapper.toDto(applicationService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable final Long id) {
        applicationService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
