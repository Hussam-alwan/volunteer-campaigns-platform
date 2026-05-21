package com.uni.impact.attendance;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Getter
@Setter
public class AttendanceDTO {

    private Long attendanceId;

    @NotNull
    private LocalDate attendanceDate;

    @NotNull
    private AttendanceStatus status;

    @NotNull
    private Double hoursThatDay;

    private String notes;

    @NotNull
    private LocalDateTime recordedAt;

    @NotNull
    private LocalDateTime createdAt;

    @NotNull
    private LocalDateTime updatedAt;

    @NotNull
    private Long student;

    @NotNull
    private Long campaign;

    @NotNull
    private Long recordedBy;

}
