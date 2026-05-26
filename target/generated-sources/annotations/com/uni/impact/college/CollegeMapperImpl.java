package com.uni.impact.college;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-23T14:59:40+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CollegeMapperImpl implements CollegeMapper {

    @Override
    public CollegeResponseDTO toDto(College entity) {
        if ( entity == null ) {
            return null;
        }

        CollegeResponseDTO collegeResponseDTO = new CollegeResponseDTO();

        collegeResponseDTO.setCollegeId( entity.getCollegeId() );
        collegeResponseDTO.setName( entity.getName() );
        collegeResponseDTO.setDescription( entity.getDescription() );
        collegeResponseDTO.setCreatedAt( entity.getCreatedAt() );
        collegeResponseDTO.setUpdatedAt( entity.getUpdatedAt() );

        return collegeResponseDTO;
    }

    @Override
    public College toEntity(CollegeRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        College college = new College();

        college.setName( dto.getName() );
        college.setDescription( dto.getDescription() );

        return college;
    }

    @Override
    public void updateEntity(College entity, CollegeRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getName() != null ) {
            entity.setName( dto.getName() );
        }
        if ( dto.getDescription() != null ) {
            entity.setDescription( dto.getDescription() );
        }
    }
}
