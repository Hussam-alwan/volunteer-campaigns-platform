package com.uni.impact.category;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping(value = "/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    @GetMapping
    public ResponseEntity<Page<CategoryResponseDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(categoryService.findAll(pageable).map(categoryMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryMapper.toDto(categoryService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<CategoryResponseDTO> create(@Valid @RequestBody CategoryRequestDTO categoryDTO) {
        Category created = categoryService.create(categoryDTO);
        return ResponseEntity.created(URI.create("/api/v1/categories/" + created.getCategoryId()))
                .body(categoryMapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> update(@PathVariable Long id, @RequestBody @Valid final CategoryRequestDTO categoryDTO) {
        categoryService.update(id, categoryDTO);
        return ResponseEntity.ok(categoryMapper.toDto(categoryService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable final Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
