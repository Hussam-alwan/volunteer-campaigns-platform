package com.uni.impact.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class StudentsPerCollegeDTO {

    private Long collegeId;
    private String collegeName;
    private Long studentCount;
}