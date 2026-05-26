package com.uni.impact.category;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-23T14:59:40+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public CategoryResponseDTO toDto(Category entity) {
        if ( entity == null ) {
            return null;
        }

        CategoryResponseDTO categoryResponseDTO = new CategoryResponseDTO();

        categoryResponseDTO.setCategoryId( entity.getCategoryId() );
        categoryResponseDTO.setName( entity.getName() );
        categoryResponseDTO.setCreatedAt( entity.getCreatedAt() );
        categoryResponseDTO.setUpdatedAt( entity.getUpdatedAt() );

        return categoryResponseDTO;
    }

    @Override
    public Category toEntity(CategoryRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Category category = new Category();

        category.setName( dto.getName() );

        return category;
    }

    @Override
    public void updateEntity(Category entity, CategoryRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getName() != null ) {
            entity.setName( dto.getName() );
        }
    }
}
