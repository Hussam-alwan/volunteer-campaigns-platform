package com.uni.impact.attendance;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;

@RestController
@RequestMapping(value = "/api/v1/campaigns")
@RequiredArgsConstructor
public class AttendanceCampaignController {

    private final AttendanceService attendanceService;
    private final AttendanceMapper attendanceMapper;

    @PostMapping("/{id}/attendance")
    public ResponseEntity<AttendanceResponseDTO> createAttendance(@PathVariable Long id, @RequestBody AttendanceRequestDTO attendanceDTO) {
        Attendance created = attendanceService.create(id, attendanceDTO);
        return ResponseEntity.created(URI.create("/api/v1/attendances/" + created.getAttendanceId()))
                .body(attendanceMapper.toDto(created));
    }

    @PostMapping("/{id}/attendance/bulk")
    public ResponseEntity<Void> createAttendanceBulk(@PathVariable Long id, @RequestBody List<AttendanceRequestDTO> attendanceList) {
        attendanceService.createBulk(id, attendanceList);
        return ResponseEntity.status(CREATED).build();
    }

    @GetMapping("/{id}/attendance")
    public ResponseEntity<Page<AttendanceResponseDTO>> getAttendance(@PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(attendanceService.findByCampaign(id, pageable).map(attendanceMapper::toDto));
    }
}
