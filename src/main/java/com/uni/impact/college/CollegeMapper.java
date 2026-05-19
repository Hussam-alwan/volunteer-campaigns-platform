package com.uni.impact.college;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CollegeMapper {

    CollegeDTO toDto(College entity);

    @Mapping(target = "collegeUsers", ignore = true)
    College toEntity(CollegeDTO dto);

    @Mapping(target = "collegeUsers", ignore = true)
    void updateEntity(@MappingTarget College entity, CollegeDTO dto);
}
