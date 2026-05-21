package com.uni.impact.application;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ApplicationMapper {

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "campaign", ignore = true)
    @Mapping(target = "reviewedBy", ignore = true)
    @Mapping(target = "removedBy", ignore = true)
    ApplicationDTO toDto(Application entity);


    @Mapping(target = "student", ignore = true)
    @Mapping(target = "campaign", ignore = true)
    @Mapping(target = "reviewedBy", ignore = true)
    @Mapping(target = "removedBy", ignore = true)
    Application toEntity(ApplicationDTO dto);

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "campaign", ignore = true)
    @Mapping(target = "reviewedBy", ignore = true)
    @Mapping(target = "removedBy", ignore = true)
    void updateEntity(@MappingTarget Application entity, ApplicationDTO dto);
}
