package com.uni.impact.attendance;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;


@Getter
@Setter
public class AttendanceDTO {

    private Long attendanceId;

    @NotNull
    private LocalDate attendanceDate;

    @NotNull
    private AttendanceStatus status;

    @NotNull
    private Integer hoursThatDay;

    private String notes;

    @NotNull
    private OffsetDateTime recordedAt;

    @NotNull
    private Long student;

    @NotNull
    private Long campaign;

    @NotNull
    private Long recordedBy;

}
