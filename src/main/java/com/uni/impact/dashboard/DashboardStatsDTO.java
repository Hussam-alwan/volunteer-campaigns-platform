package com.uni.impact.dashboard;

import com.uni.impact.application.ApplicationStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class DashboardStatsDTO {

    private long totalStudents;
    private long activeCampaigns;
    private long colleges;
    private double avgAttendance;
    private List<StudentsPerCollegeDTO> studentsPerCollege;
    private Map<ApplicationStatus, Long> applicationStatusCounts;
}
