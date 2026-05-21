package com.uni.impact.attendance;

import com.uni.impact.campaign.Campaign;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.user.User;
import com.uni.impact.user.UserRepository;
import com.uni.impact.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final AttendanceMapper attendanceMapper;

    public Page<Attendance> findAll(Pageable pageable) {
        return attendanceRepository.findAll(pageable);
    }
    public Attendance findById(final Long attendanceId) {
        return attendanceRepository.findById(attendanceId).orElseThrow(NotFoundException::new);
    }

    public Page<Attendance> findByCampaign(final Long campaignId,Pageable pageable) {
        return attendanceRepository.findByCampaignCampaignId(campaignId, pageable);
    }

    @Transactional
    public Attendance create(final AttendanceDTO attendanceDTO) {
        if (attendanceDTO.getAttendanceId() != null) {
            throw new IllegalArgumentException("A new attendance cannot already have an ID");
        }
        Attendance attendance = attendanceMapper.toEntity(attendanceDTO);
        applyRelations(attendance, attendanceDTO);
        return attendanceRepository.save(attendance);
    }

    @Transactional
    public void createBulk(final java.util.List<AttendanceDTO> attendanceList) {
        for (AttendanceDTO dto : attendanceList) {
            create(dto);
        }
    }

    @Transactional
    public Attendance update(final Long attendanceId, final AttendanceDTO attendanceDTO) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(NotFoundException::new);
        attendanceMapper.updateEntity(attendance, attendanceDTO);
        applyRelations(attendance, attendanceDTO);
        return attendanceRepository.save(attendance);
    }

    public void delete(final Long attendanceId) {
        final Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(NotFoundException::new);
       try {
              attendanceRepository.delete(attendance);
         } catch (final Exception e) {
              throw new IllegalStateException("attendance could not be deleted");
       }
    }

    public Double getTotalHoursForUser(final Long userId) {
        List<Attendance> list = attendanceRepository.findByStudentUserId(userId);
        return list.stream().mapToDouble(a -> a.getHoursThatDay() == null ? 0d : a.getHoursThatDay()).sum();
    }


    private void applyRelations(final Attendance attendance, final AttendanceDTO attendanceDTO) {
        final User student = attendanceDTO.getStudent() == null ? null : userRepository.findById(attendanceDTO.getStudent())
                .orElseThrow(() -> new NotFoundException("student not found"));
        attendance.setStudent(student);
        final Campaign campaign = attendanceDTO.getCampaign() == null ? null : campaignRepository.findById(attendanceDTO.getCampaign())
                .orElseThrow(() -> new NotFoundException("campaign not found"));
        attendance.setCampaign(campaign);
        final User recordedBy = attendanceDTO.getRecordedBy() == null ? null : userRepository.findById(attendanceDTO.getRecordedBy())
                .orElseThrow(() -> new NotFoundException("recordedBy not found"));
        attendance.setRecordedBy(recordedBy);
    }
}
