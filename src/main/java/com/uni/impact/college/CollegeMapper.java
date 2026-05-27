package com.uni.impact.college;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CollegeMapper {

    CollegeResponseDTO toDto(College entity);

    @Mapping(target = "collegeId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "collegeUsers", ignore = true)
    College toEntity(CollegeRequestDTO dto);

    @Mapping(target = "collegeId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "collegeUsers", ignore = true)
    void updateEntity(@MappingTarget College entity, CollegeRequestDTO dto);
}
