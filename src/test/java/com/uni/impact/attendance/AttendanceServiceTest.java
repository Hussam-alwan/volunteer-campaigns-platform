package com.uni.impact.attendance;

import com.uni.impact.campaign.Campaign;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.user.User;
import com.uni.impact.user.UserRepository;
import com.uni.impact.util.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AttendanceService")
class AttendanceServiceTest {

    @Mock AttendanceRepository attendanceRepository;
    @Mock UserRepository userRepository;
    @Mock CampaignRepository campaignRepository;
    @Mock AttendanceMapper attendanceMapper;

    @InjectMocks AttendanceService service;

    private User student;
    private User recorder;
    private Campaign campaign;
    private Attendance existing;

    @BeforeEach
    void setup() {
        student = new User();
        student.setUserId(10L);
        recorder = new User();
        recorder.setUserId(20L);
        campaign = new Campaign();
        campaign.setCampaignId(30L);

        existing = new Attendance();
        existing.setAttendanceId(1L);
    }

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        void returnsEntity() {
            when(attendanceRepository.findById(1L)).thenReturn(Optional.of(existing));
            assertThat(service.findById(1L)).isSameAs(existing);
        }

        @Test
        void notFoundThrows() {
            when(attendanceRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.findById(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        void resolvesAllRelationsAndStampsRecordedAt() {
            AttendanceRequestDTO dto = baseDto();
            Attendance mapped = new Attendance();
            when(attendanceMapper.toEntity(dto)).thenReturn(mapped);
            when(userRepository.findById(10L)).thenReturn(Optional.of(student));
            when(userRepository.findById(20L)).thenReturn(Optional.of(recorder));
            when(campaignRepository.findById(30L)).thenReturn(Optional.of(campaign));
            when(attendanceRepository.save(mapped)).thenReturn(mapped);

            java.time.LocalDateTime before = java.time.LocalDateTime.now();
            Attendance result = service.create(30L, dto);
            java.time.LocalDateTime after = java.time.LocalDateTime.now();

            assertThat(result).isSameAs(mapped);
            assertThat(mapped.getStudent()).isSameAs(student);
            assertThat(mapped.getRecordedBy()).isSameAs(recorder);
            assertThat(mapped.getCampaign()).isSameAs(campaign);
            assertThat(mapped.getRecordedAt()).isBetween(before, after.plusSeconds(1));
            // sanity on timestamp magnitude
            assertThat(mapped.getRecordedAt()).isCloseTo(java.time.LocalDateTime.now(), within(2, java.time.temporal.ChronoUnit.SECONDS));
        }

        @Test
        void unknownStudentThrowsAndDoesNotSave() {
            AttendanceRequestDTO dto = baseDto();
            when(attendanceMapper.toEntity(dto)).thenReturn(new Attendance());
            when(userRepository.findById(10L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.create(30L, dto))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("student");
            verify(attendanceRepository, never()).save(any());
        }

        @Test
        void unknownCampaignThrows() {
            AttendanceRequestDTO dto = baseDto();
            when(attendanceMapper.toEntity(dto)).thenReturn(new Attendance());
            when(userRepository.findById(10L)).thenReturn(Optional.of(student));
            when(campaignRepository.findById(30L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.create(30L, dto))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("campaign");
        }

        @Test
        void unknownRecorderThrows() {
            AttendanceRequestDTO dto = baseDto();
            when(attendanceMapper.toEntity(dto)).thenReturn(new Attendance());
            when(userRepository.findById(10L)).thenReturn(Optional.of(student));
            when(campaignRepository.findById(30L)).thenReturn(Optional.of(campaign));
            when(userRepository.findById(20L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.create(30L, dto))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("recordedBy");
        }
    }

    @Nested
    @DisplayName("createBulk")
    class CreateBulk {

        @Test
        void delegatesToCreatePerItem() {
            AttendanceRequestDTO a = baseDto();
            AttendanceRequestDTO b = baseDto();
            b.setNotes("second");
            when(attendanceMapper.toEntity(any())).thenAnswer(inv -> new Attendance());
            when(userRepository.findById(10L)).thenReturn(Optional.of(student));
            when(userRepository.findById(20L)).thenReturn(Optional.of(recorder));
            when(campaignRepository.findById(30L)).thenReturn(Optional.of(campaign));

            service.createBulk(30L, List.of(a, b));

            verify(attendanceRepository, times(2)).save(any());
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateCase {

        @Test
        void appliesMapperAndRelations() {
            AttendanceRequestDTO dto = baseDto();
            when(attendanceRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(userRepository.findById(10L)).thenReturn(Optional.of(student));
            when(userRepository.findById(20L)).thenReturn(Optional.of(recorder));
            when(campaignRepository.findById(30L)).thenReturn(Optional.of(campaign));
            when(attendanceRepository.save(existing)).thenReturn(existing);

            Attendance result = service.update(1L, 30L, dto);

            assertThat(result).isSameAs(existing);
            verify(attendanceMapper).updateEntity(existing, dto);
            assertThat(existing.getStudent()).isSameAs(student);
            assertThat(existing.getRecordedBy()).isSameAs(recorder);
            assertThat(existing.getCampaign()).isSameAs(campaign);
        }

        @Test
        void notFoundThrows() {
            when(attendanceRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.update(1L, 30L, baseDto()))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        void removesWhenPresent() {
            when(attendanceRepository.findById(1L)).thenReturn(Optional.of(existing));
            service.delete(1L);
            verify(attendanceRepository).delete(existing);
        }

        @Test
        void notFoundThrows() {
            when(attendanceRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void wrapsRepositoryFailureAsIllegalState() {
            when(attendanceRepository.findById(1L)).thenReturn(Optional.of(existing));
            doThrow(new RuntimeException("boom")).when(attendanceRepository).delete(existing);

            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("attendance could not be deleted");
        }
    }

    @Nested
    @DisplayName("getTotalHoursForUser")
    class TotalHours {

        @Test
        void sumsHoursAcrossAllRowsForUser() {
            Attendance a = new Attendance();
            a.setHoursThatDay(2.5);
            Attendance b = new Attendance();
            b.setHoursThatDay(3.0);
            Attendance c = new Attendance();
            c.setHoursThatDay(null);
            when(attendanceRepository.findByStudentUserId(10L)).thenReturn(List.of(a, b, c));

            assertThat(service.getTotalHoursForUser(10L)).isEqualTo(5.5);
        }

        @Test
        void returnsZeroWhenNoRows() {
            when(attendanceRepository.findByStudentUserId(10L)).thenReturn(List.of());
            assertThat(service.getTotalHoursForUser(10L)).isEqualTo(0.0);
        }
    }

    @Nested
    @DisplayName("create — captured snapshot")
    class CapturedSnapshot {

        @Test
        void savesEntityProducedByMapper() {
            AttendanceRequestDTO dto = baseDto();
            Attendance mapped = new Attendance();
            when(attendanceMapper.toEntity(dto)).thenReturn(mapped);
            when(userRepository.findById(10L)).thenReturn(Optional.of(student));
            when(userRepository.findById(20L)).thenReturn(Optional.of(recorder));
            when(campaignRepository.findById(30L)).thenReturn(Optional.of(campaign));

            service.create(30L, dto);

            ArgumentCaptor<Attendance> captor = ArgumentCaptor.forClass(Attendance.class);
            verify(attendanceRepository).save(captor.capture());
            assertThat(captor.getValue()).isSameAs(mapped);
        }
    }

    private AttendanceRequestDTO baseDto() {
        AttendanceRequestDTO dto = new AttendanceRequestDTO();
        dto.setAttendanceDate(LocalDate.of(2026, 1, 1));
        dto.setStatus(AttendanceStatus.PRESENT);
        dto.setHoursThatDay(4.0);
        dto.setStudent(10L);
        dto.setRecordedBy(20L);
        return dto;
    }
}
