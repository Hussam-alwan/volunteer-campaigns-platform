package com.uni.impact.campaign;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CampaignStatusUpdateDTO {

    @NotNull
    private CampaignStatus status;

}

