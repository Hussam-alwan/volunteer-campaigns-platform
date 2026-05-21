package com.uni.impact.application;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;


@Getter
@Setter
public class ApplicationDTO {

	private Long id;

	private String motivationLetter;

	@NotNull
	@Enumerated(EnumType.STRING)
	private ApplicationStatus status;

	@Size(max = 500)
	private String rejectionReason;

	private String adminNotes;

	@NotNull
	private OffsetDateTime appliedAt;

	@NotNull
	private OffsetDateTime createdAt;

	@NotNull
	private OffsetDateTime updatedAt;

	private OffsetDateTime reviewedAt;

	private String removalReason;

	private OffsetDateTime removedAt;

	@NotNull
	private Long student;

	@NotNull
	private Long campaign;

	private Long reviewedBy;

	private Long removedBy;

}

