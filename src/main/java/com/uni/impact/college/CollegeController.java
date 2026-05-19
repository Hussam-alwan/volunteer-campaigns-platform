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
    public ResponseEntity<Page<CollegeDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(collegeService.findAll(pageable).map(collegeMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollegeDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(collegeMapper.toDto(collegeService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<CollegeDTO> create(@Valid @RequestBody CollegeDTO collegeDTO) {
        College created = collegeService.create(collegeDTO);
        return ResponseEntity.created(URI.create("/api/v1/colleges/" + created.getCollegeId()))
                .body(collegeMapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CollegeDTO> update(@PathVariable Long id, @RequestBody @Valid final CollegeDTO collegeDTO) {
        collegeService.update(id, collegeDTO);
        return ResponseEntity.ok(collegeMapper.toDto(collegeService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable final Long id) {
        collegeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
