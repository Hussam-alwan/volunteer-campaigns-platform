package com.uni.impact.dashboard;

import com.uni.impact.application.ApplicationRepository;
import com.uni.impact.application.ApplicationStatus;
import com.uni.impact.attendance.AttendanceRepository;
import com.uni.impact.attendance.AttendanceStatus;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.campaign.CampaignStatus;
import com.uni.impact.college.CollegeRepository;
import com.uni.impact.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final CollegeRepository collegeRepository;
    private final AttendanceRepository attendanceRepository;
    private final ApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDTO getStats() {
        DashboardStatsDTO dto = new DashboardStatsDTO();

        dto.setTotalStudents(userRepository.countByStudentNumberIsNotNull());
        dto.setActiveCampaigns(campaignRepository.countByStatus(CampaignStatus.ONGOING));
        dto.setColleges(collegeRepository.count());
        dto.setAvgAttendance(calculateAttendanceRate());
        dto.setStudentsPerCollege(mapStudentsPerCollege(userRepository.countStudentsGroupedByCollege()));
        dto.setApplicationStatusCounts(mapApplicationStatusCounts(applicationRepository.countGroupedByStatus()));

        return dto;
    }

    private double calculateAttendanceRate() {
        long total = attendanceRepository.count();
        if (total == 0) {
            return 0.0;
        }
        long present = attendanceRepository.countByStatus(AttendanceStatus.PRESENT);
        double rate = (present * 100.0) / total;
        return Math.round(rate * 100.0) / 100.0;
    }

    private List<StudentsPerCollegeDTO> mapStudentsPerCollege(List<Object[]> rows) {
        return rows.stream()
                .map(row -> new StudentsPerCollegeDTO(
                        (Long) row[0],
                        (String) row[1],
                        (Long) row[2]))
                .toList();
    }

    private Map<ApplicationStatus, Long> mapApplicationStatusCounts(List<Object[]> rows) {
        Map<ApplicationStatus, Long> counts = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            counts.put(status, 0L);
        }
        for (Object[] row : rows) {
            counts.put((ApplicationStatus) row[0], (Long) row[1]);
        }
        return counts;
    }
}
