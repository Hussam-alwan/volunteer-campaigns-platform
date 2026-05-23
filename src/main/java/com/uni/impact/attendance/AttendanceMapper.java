package com.uni.impact.attendance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AttendanceMapper {

    @Mapping(target = "student", source = "student.userId")
    @Mapping(target = "studentName", expression = "java(entity.getStudent() == null ? null : (entity.getStudent().getFirstName() + \" \" + entity.getStudent().getLastName()))")
    @Mapping(target = "campaign", source = "campaign.campaignId")
    @Mapping(target = "recordedBy", source = "recordedBy.userId")
    @Mapping(target = "recordedByName", expression = "java(entity.getRecordedBy() == null ? null : (entity.getRecordedBy().getFirstName() + \" \" + entity.getRecordedBy().getLastName()))")
    AttendanceResponseDTO toDto(Attendance entity);

    @Mapping(target = "attendanceId", ignore = true)
    @Mapping(target = "recordedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "campaign", ignore = true)
    @Mapping(target = "recordedBy", ignore = true)
    Attendance toEntity(AttendanceRequestDTO dto);

    @Mapping(target = "attendanceId", ignore = true)
    @Mapping(target = "recordedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "campaign", ignore = true)
    @Mapping(target = "recordedBy", ignore = true)
    void updateEntity(@MappingTarget Attendance entity, AttendanceRequestDTO dto);
}
