package com.uni.impact.dashboard;

import com.uni.impact.application.ApplicationRepository;
import com.uni.impact.application.ApplicationStatus;
import com.uni.impact.attendance.AttendanceRepository;
import com.uni.impact.attendance.AttendanceStatus;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.campaign.CampaignStatus;
import com.uni.impact.college.CollegeRepository;
import com.uni.impact.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService.getStats")
class DashboardServiceTest {

    @Mock UserRepository userRepository;
    @Mock CampaignRepository campaignRepository;
    @Mock CollegeRepository collegeRepository;
    @Mock AttendanceRepository attendanceRepository;
    @Mock ApplicationRepository applicationRepository;

    @InjectMocks DashboardService service;

    @Test
    void aggregatesCountsAndGroupedQueries() {
        when(userRepository.countByStudentNumberIsNotNull()).thenReturn(100L);
        when(campaignRepository.countByStatus(CampaignStatus.ONGOING)).thenReturn(5L);
        when(collegeRepository.count()).thenReturn(3L);
        when(attendanceRepository.count()).thenReturn(200L);
        when(attendanceRepository.countByStatus(AttendanceStatus.PRESENT)).thenReturn(150L);
        when(userRepository.countStudentsGroupedByCollege()).thenReturn(List.of(
                new Object[]{1L, "CS", 60L},
                new Object[]{2L, "Eng", 40L}
        ));
        when(applicationRepository.countGroupedByStatus()).thenReturn(List.of(
                new Object[]{ApplicationStatus.PENDING, 7L},
                new Object[]{ApplicationStatus.APPROVED, 3L}
        ));

        DashboardStatsDTO stats = service.getStats();

        assertThat(stats.getTotalStudents()).isEqualTo(100L);
        assertThat(stats.getActiveCampaigns()).isEqualTo(5L);
        assertThat(stats.getColleges()).isEqualTo(3L);
        assertThat(stats.getAvgAttendance()).isEqualTo(75.0);
        assertThat(stats.getStudentsPerCollege())
                .extracting("collegeId", "collegeName", "studentCount")
                .containsExactly(tuple(1L, "CS", 60L), tuple(2L, "Eng", 40L));
        assertThat(stats.getApplicationStatusCounts())
                .containsEntry(ApplicationStatus.PENDING, 7L)
                .containsEntry(ApplicationStatus.APPROVED, 3L)
                .containsEntry(ApplicationStatus.REJECTED, 0L)
                .containsEntry(ApplicationStatus.CANCELLED, 0L)
                .containsEntry(ApplicationStatus.WITHDRAWN, 0L);
    }

    @Test
    void attendanceRateIsZeroWhenNoAttendanceRows() {
        stubAllReposEmpty();
        when(attendanceRepository.count()).thenReturn(0L);

        DashboardStatsDTO stats = service.getStats();

        assertThat(stats.getAvgAttendance()).isEqualTo(0.0);
        verify(attendanceRepository, org.mockito.Mockito.never()).countByStatus(AttendanceStatus.PRESENT);
    }

    @Test
    void attendanceRateRoundedToTwoDecimalPlaces() {
        stubAllReposEmpty();
        when(attendanceRepository.count()).thenReturn(3L);
        when(attendanceRepository.countByStatus(AttendanceStatus.PRESENT)).thenReturn(1L);

        DashboardStatsDTO stats = service.getStats();

        // 1/3 * 100 = 33.333... rounded to 33.33
        assertThat(stats.getAvgAttendance()).isEqualTo(33.33);
    }

    @Test
    void statusCountsDefaultMissingEnumValuesToZero() {
        stubAllReposEmpty();
        when(attendanceRepository.count()).thenReturn(0L);
        when(applicationRepository.countGroupedByStatus()).thenReturn(List.<Object[]>of(
                new Object[]{ApplicationStatus.PENDING, 4L}
        ));

        DashboardStatsDTO stats = service.getStats();

        assertThat(stats.getApplicationStatusCounts())
                .hasSize(ApplicationStatus.values().length)
                .containsEntry(ApplicationStatus.PENDING, 4L)
                .containsEntry(ApplicationStatus.APPROVED, 0L)
                .containsEntry(ApplicationStatus.REJECTED, 0L)
                .containsEntry(ApplicationStatus.CANCELLED, 0L)
                .containsEntry(ApplicationStatus.WITHDRAWN, 0L);
    }

    private void stubAllReposEmpty() {
        lenient().when(userRepository.countByStudentNumberIsNotNull()).thenReturn(0L);
        lenient().when(campaignRepository.countByStatus(CampaignStatus.ONGOING)).thenReturn(0L);
        lenient().when(collegeRepository.count()).thenReturn(0L);
        lenient().when(userRepository.countStudentsGroupedByCollege()).thenReturn(List.of());
        lenient().when(applicationRepository.countGroupedByStatus()).thenReturn(List.of());
    }
}
