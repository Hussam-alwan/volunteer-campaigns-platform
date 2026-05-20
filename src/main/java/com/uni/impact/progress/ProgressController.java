package com.uni.impact.progress;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;

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

    @PostMapping
    public ResponseEntity<ProgressDTO> create(@Valid @RequestBody ProgressDTO progressDTO) {
        Progress created = progressService.create(progressDTO);
        return ResponseEntity.created(URI.create("/api/v1/progresses/" + created.getProgressId()))
                .body(progressMapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressDTO> update(@PathVariable Long id, @RequestBody @Valid final ProgressDTO progressDTO) {
        progressService.update(id, progressDTO);
        return ResponseEntity.ok(progressMapper.toDto(progressService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable final Long id) {
        progressService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
