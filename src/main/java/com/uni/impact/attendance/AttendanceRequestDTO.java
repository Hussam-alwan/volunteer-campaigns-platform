package com.uni.impact.attendance;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;


@Getter
@Setter
public class AttendanceRequestDTO {

    @NotNull
    private LocalDate attendanceDate;

    @NotNull
    private AttendanceStatus status;

    @NotNull
    private Double hoursThatDay;

    private String notes;

    @NotNull
    private Long student;

    @NotNull
    private Long recordedBy;

}
