package com.uni.impact.attendance;

import com.uni.impact.campaign.Campaign;
import com.uni.impact.user.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-23T14:59:41+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class AttendanceMapperImpl implements AttendanceMapper {

    @Override
    public AttendanceResponseDTO toDto(Attendance entity) {
        if ( entity == null ) {
            return null;
        }

        AttendanceResponseDTO attendanceResponseDTO = new AttendanceResponseDTO();

        attendanceResponseDTO.setStudent( entityStudentUserId( entity ) );
        attendanceResponseDTO.setCampaign( entityCampaignCampaignId( entity ) );
        attendanceResponseDTO.setRecordedBy( entityRecordedByUserId( entity ) );
        attendanceResponseDTO.setAttendanceId( entity.getAttendanceId() );
        attendanceResponseDTO.setAttendanceDate( entity.getAttendanceDate() );
        attendanceResponseDTO.setStatus( entity.getStatus() );
        attendanceResponseDTO.setHoursThatDay( entity.getHoursThatDay() );
        attendanceResponseDTO.setNotes( entity.getNotes() );
        attendanceResponseDTO.setRecordedAt( entity.getRecordedAt() );
        attendanceResponseDTO.setCreatedAt( entity.getCreatedAt() );
        attendanceResponseDTO.setUpdatedAt( entity.getUpdatedAt() );

        attendanceResponseDTO.setStudentName( entity.getStudent() == null ? null : (entity.getStudent().getFirstName() + " " + entity.getStudent().getLastName()) );
        attendanceResponseDTO.setRecordedByName( entity.getRecordedBy() == null ? null : (entity.getRecordedBy().getFirstName() + " " + entity.getRecordedBy().getLastName()) );

        return attendanceResponseDTO;
    }

    @Override
    public Attendance toEntity(AttendanceRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Attendance attendance = new Attendance();

        attendance.setAttendanceDate( dto.getAttendanceDate() );
        attendance.setStatus( dto.getStatus() );
        attendance.setHoursThatDay( dto.getHoursThatDay() );
        attendance.setNotes( dto.getNotes() );

        return attendance;
    }

    @Override
    public void updateEntity(Attendance entity, AttendanceRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getAttendanceDate() != null ) {
            entity.setAttendanceDate( dto.getAttendanceDate() );
        }
        if ( dto.getStatus() != null ) {
            entity.setStatus( dto.getStatus() );
        }
        if ( dto.getHoursThatDay() != null ) {
            entity.setHoursThatDay( dto.getHoursThatDay() );
        }
        if ( dto.getNotes() != null ) {
            entity.setNotes( dto.getNotes() );
        }
    }

    private Long entityStudentUserId(Attendance attendance) {
        if ( attendance == null ) {
            return null;
        }
        User student = attendance.getStudent();
        if ( student == null ) {
            return null;
        }
        Long userId = student.getUserId();
        if ( userId == null ) {
            return null;
        }
        return userId;
    }

    private Long entityCampaignCampaignId(Attendance attendance) {
        if ( attendance == null ) {
            return null;
        }
        Campaign campaign = attendance.getCampaign();
        if ( campaign == null ) {
            return null;
        }
        Long campaignId = campaign.getCampaignId();
        if ( campaignId == null ) {
            return null;
        }
        return campaignId;
    }

    private Long entityRecordedByUserId(Attendance attendance) {
        if ( attendance == null ) {
            return null;
        }
        User recordedBy = attendance.getRecordedBy();
        if ( recordedBy == null ) {
            return null;
        }
        Long userId = recordedBy.getUserId();
        if ( userId == null ) {
            return null;
        }
        return userId;
    }
}
