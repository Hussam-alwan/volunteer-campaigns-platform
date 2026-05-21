package com.uni.impact.campaign_photo;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;


@Getter
@Setter
public class CampaignPhotoDTO {

    private Long photoId;

    @NotNull
    @Size(max = 500)
    private String photoUrl;

    @NotNull
    private OffsetDateTime uploadedAt;

    @NotNull
    private OffsetDateTime createdAt;

    @NotNull
    private OffsetDateTime updatedAt;

    @NotNull
    private Long campaign;

    private Long progress;

}
