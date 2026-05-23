package com.uni.impact.application;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
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
    public ResponseEntity<Page<ApplicationResponseDTO>> findAll(@ModelAttribute VolunteerSearchCriteria criteria, Pageable pageable) {
        Page<Application> applications = applicationService.searchVolunteers(criteria, pageable);
        return ResponseEntity.ok(applications.map(applicationMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationMapper.toDto(applicationService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApplicationResponseDTO> create(@Valid @RequestBody ApplicationRequestDTO applicationDTO) {
        Application created = applicationService.create(applicationDTO);
        return ResponseEntity
                .created(URI.create("/api/v1/applications/" + created.getId()))
                .body(applicationMapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationResponseDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid final ApplicationRequestDTO applicationDTO) {
        applicationService.update(id, applicationDTO);
        return ResponseEntity.ok(applicationMapper.toDto(applicationService.findById(id)));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<ApplicationResponseDTO>> myApplications(
            Pageable pageable,
            @RequestParam String email) {
        return ResponseEntity.ok(applicationService.findByStudentEmail(email, pageable).map(applicationMapper::toDto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponseDTO> changeStatus(@PathVariable Long id, @RequestBody final ApplicationRequestDTO applicationDTO) {
        applicationService.changeStatus(id, applicationDTO.getStatus(), null, applicationDTO.getRejectionReason());
        return ResponseEntity.ok(applicationMapper.toDto(applicationService.findById(id)));
    }

    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<ApplicationResponseDTO> withdraw(@PathVariable Long id, @RequestParam String email) {
        final com.uni.impact.user.User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new RuntimeException("user not found"));
        applicationService.withdraw(id, user.getUserId());
        return ResponseEntity.ok(applicationMapper.toDto(applicationService.findById(id)));
    }

    @PatchMapping("/{id}/remove")
    public ResponseEntity<ApplicationResponseDTO> remove(@PathVariable Long id,
                                                 @RequestBody final ApplicationRequestDTO applicationDTO,
                                                 @RequestParam(required = false) String email) {
        Long removerId = null;
        if (email != null) {
            final com.uni.impact.user.User u = userRepository.findByEmailIgnoreCase(email).orElse(null);
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
