package com.uni.impact.user;

import com.uni.impact.college.College;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-23T14:59:41+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponseDTO toDto(User entity) {
        if ( entity == null ) {
            return null;
        }

        UserResponseDTO userResponseDTO = new UserResponseDTO();

        userResponseDTO.setCollege( entityCollegeCollegeId( entity ) );
        userResponseDTO.setUserId( entity.getUserId() );
        userResponseDTO.setStudentNumber( entity.getStudentNumber() );
        userResponseDTO.setFirstName( entity.getFirstName() );
        userResponseDTO.setLastName( entity.getLastName() );
        userResponseDTO.setEmail( entity.getEmail() );
        userResponseDTO.setPhone( entity.getPhone() );
        userResponseDTO.setAcademicYear( entity.getAcademicYear() );
        userResponseDTO.setIsBanned( entity.getIsBanned() );
        userResponseDTO.setCreatedAt( entity.getCreatedAt() );
        userResponseDTO.setUpdatedAt( entity.getUpdatedAt() );

        return userResponseDTO;
    }

    @Override
    public User toEntity(UserRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        User user = new User();

        user.setStudentNumber( dto.getStudentNumber() );
        user.setFirstName( dto.getFirstName() );
        user.setLastName( dto.getLastName() );
        user.setEmail( dto.getEmail() );
        user.setPhone( dto.getPhone() );
        user.setAcademicYear( dto.getAcademicYear() );
        user.setIsBanned( dto.getIsBanned() );

        return user;
    }

    @Override
    public void updateEntity(User entity, UserRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getStudentNumber() != null ) {
            entity.setStudentNumber( dto.getStudentNumber() );
        }
        if ( dto.getFirstName() != null ) {
            entity.setFirstName( dto.getFirstName() );
        }
        if ( dto.getLastName() != null ) {
            entity.setLastName( dto.getLastName() );
        }
        if ( dto.getEmail() != null ) {
            entity.setEmail( dto.getEmail() );
        }
        if ( dto.getPhone() != null ) {
            entity.setPhone( dto.getPhone() );
        }
        if ( dto.getAcademicYear() != null ) {
            entity.setAcademicYear( dto.getAcademicYear() );
        }
        if ( dto.getIsBanned() != null ) {
            entity.setIsBanned( dto.getIsBanned() );
        }
    }

    private Long entityCollegeCollegeId(User user) {
        if ( user == null ) {
            return null;
        }
        College college = user.getCollege();
        if ( college == null ) {
            return null;
        }
        Long collegeId = college.getCollegeId();
        if ( collegeId == null ) {
            return null;
        }
        return collegeId;
    }
}
