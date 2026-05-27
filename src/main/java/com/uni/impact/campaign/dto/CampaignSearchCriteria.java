package com.uni.impact.campaign.dto;

import com.uni.impact.campaign.CampaignStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CampaignSearchCriteria {

    private String searchText;
    private CampaignStatus status;
    private Long categoryId;
    private Long collegeId;
    private Long proposedByUserId;

}

