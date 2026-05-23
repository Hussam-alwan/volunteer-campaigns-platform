package com.uni.impact.application;

import com.uni.impact.application.dto.VolunteerSearchCriteria;
import com.uni.impact.user.User;
import com.uni.impact.user.UserRepository;
import com.uni.impact.util.NotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

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
        final User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new NotFoundException("user not found"));
        applicationService.withdraw(id, user.getUserId());
        return ResponseEntity.ok(applicationMapper.toDto(applicationService.findById(id)));
    }

    @PatchMapping("/{id}/remove")
    public ResponseEntity<ApplicationResponseDTO> remove(@PathVariable Long id,
                                                         @RequestBody final ApplicationRequestDTO applicationDTO,
                                                         @RequestParam(required = false) String email) {
        Long removerId = null;
        if (email != null) {
            removerId = userRepository.findByEmailIgnoreCase(email)
                    .map(User::getUserId)
                    .orElse(null);
        }
        applicationService.remove(id, removerId, applicationDTO.getRemovalReason());
        return ResponseEntity.ok(applicationMapper.toDto(applicationService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable final Long id) {
        applicationService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
