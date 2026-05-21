package com.uni.impact.application;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;


@RestController
@RequestMapping(value = "/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationMapper applicationMapper;


    @GetMapping
    public ResponseEntity<Page<ApplicationDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(applicationService.findAll(pageable).map(applicationMapper::toDto));
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable final Long id) {
        applicationService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
