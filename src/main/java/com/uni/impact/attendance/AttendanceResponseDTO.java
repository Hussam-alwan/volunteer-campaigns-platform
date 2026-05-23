package com.uni.impact.attendance;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Getter
@Setter
public class AttendanceResponseDTO {

    private Long attendanceId;

    private LocalDate attendanceDate;

    private AttendanceStatus status;

    private Double hoursThatDay;

    private String notes;

    private LocalDateTime recordedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long student;

    private String studentName;

    private Long campaign;

    private Long recordedBy;

    private String recordedByName;

}
