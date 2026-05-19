package com.uni.impact.category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CategoryMapper {

    CategoryDTO toDto(Category entity);

    @Mapping(target = "categoryCampaigns", ignore = true)
    Category toEntity(CategoryDTO dto);

    @Mapping(target = "categoryCampaigns", ignore = true)
    void updateEntity(@MappingTarget Category entity, CategoryDTO dto);
}
