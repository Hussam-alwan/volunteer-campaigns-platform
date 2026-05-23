package com.uni.impact.application.dto;

import com.uni.impact.application.ApplicationStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VolunteerSearchCriteria {

    private String searchText;
    private ApplicationStatus status;
    private Long collegeId;
    private Long campaignId;
    private Long studentId;

}

