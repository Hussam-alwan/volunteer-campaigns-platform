package com.uni.impact.attendance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AttendanceMapper {

    @Mapping(target = "student", source = "student.userId")
    @Mapping(target = "campaign", source = "campaign.campaignId")
    @Mapping(target = "recordedBy", source = "recordedBy.userId")
    AttendanceDTO toDto(Attendance entity);

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "campaign", ignore = true)
    @Mapping(target = "recordedBy", ignore = true)
    Attendance toEntity(AttendanceDTO dto);

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "campaign", ignore = true)
    @Mapping(target = "recordedBy", ignore = true)
    void updateEntity(@MappingTarget Attendance entity, AttendanceDTO dto);
}
