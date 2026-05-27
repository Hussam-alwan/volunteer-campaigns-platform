package com.uni.impact.campaign_photo;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class CampaignPhotoRequestDTO {

    @NotNull
    @Size(max = 500)
    private String photoUrl;

    @NotNull
    private LocalDateTime uploadedAt;

    @NotNull
    private Long campaign;

    private Long progress;

}
