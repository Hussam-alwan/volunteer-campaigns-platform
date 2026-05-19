package com.uni.impact.category;

import com.uni.impact.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    public Page<Category> findAll(Pageable pageable) {
        return categoryRepository.findAll(pageable);
    }

    public Category findById(final Long categoryId) {
        return categoryRepository.findById(categoryId).orElseThrow(NotFoundException::new);
    }

    @Transactional
    public Category create(final CategoryDTO categoryDTO) {
        if (categoryDTO.getCategoryId() != null) {
            throw new IllegalArgumentException("A new category cannot already have an ID");
        }
        Category category = categoryMapper.toEntity(categoryDTO);
        return categoryRepository.save(category);
    }

    @Transactional
    public Category update(final Long categoryId, final CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(NotFoundException::new);
        categoryMapper.updateEntity(category, categoryDTO);
        return categoryRepository.save(category);
    }

    public void delete(final Long categoryId) {
        final Category category = categoryRepository.findById(categoryId)
                .orElseThrow(NotFoundException::new);
        try {
            categoryRepository.delete(category);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to delete category. It might be referenced by other entities.");
        }
    }
}
