package com.uni.impact.application;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class ApplicationRequestDTO {

    private String motivationLetter;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    @Size(max = 500)
    private String rejectionReason;

    private String adminNotes;

    @NotNull
    private LocalDateTime appliedAt;

    private LocalDateTime reviewedAt;

    private String removalReason;

    @NotNull
    private Long student;

    @NotNull
    private Long campaign;

    private Long reviewedBy;

    private Long removedBy;

}
