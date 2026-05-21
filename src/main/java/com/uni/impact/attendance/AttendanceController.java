package com.uni.impact.attendance;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/attendances")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceMapper attendanceMapper;

    @GetMapping
    public ResponseEntity<Page<AttendanceDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(attendanceService.findAll(pageable).map(attendanceMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceMapper.toDto(attendanceService.findById(id)));
    }
    // Creation / update / delete are handled via campaign-scoped endpoints in AttendanceCampaignController
    // (POST /api/v1/campaigns/{id}/attendance, /attendance/bulk, GET /api/v1/campaigns/{id}/attendance)
}
