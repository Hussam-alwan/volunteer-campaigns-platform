package com.uni.impact.college;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping(value = "/api/v1/colleges")
@RequiredArgsConstructor
public class CollegeController {

    private final CollegeService collegeService;
    private final CollegeMapper collegeMapper;

    @GetMapping
    public ResponseEntity<Page<CollegeResponseDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(collegeService.findAll(pageable).map(collegeMapper::toDto));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<CollegeResponseDTO>> search(@RequestParam(required = false) String q, Pageable pageable) {
        return ResponseEntity.ok(collegeService.search(q, pageable).map(collegeMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollegeResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(collegeMapper.toDto(collegeService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<CollegeResponseDTO> create(@Valid @RequestBody CollegeRequestDTO collegeDTO) {
        College created = collegeService.create(collegeDTO);
        return ResponseEntity.created(URI.create("/api/v1/colleges/" + created.getCollegeId()))
                .body(collegeMapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CollegeResponseDTO> update(@PathVariable Long id, @RequestBody @Valid final CollegeRequestDTO collegeDTO) {
        collegeService.update(id, collegeDTO);
        return ResponseEntity.ok(collegeMapper.toDto(collegeService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable final Long id) {
        collegeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
