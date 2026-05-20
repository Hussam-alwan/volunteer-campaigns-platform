package com.uni.impact.attendance;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

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

    @PostMapping
    public ResponseEntity<AttendanceDTO> create(@Valid @RequestBody AttendanceDTO attendanceDTO) {
        Attendance created = attendanceService.create(attendanceDTO);
        return ResponseEntity.created(URI.create("/api/v1/attendances/" + created.getAttendanceId()))
                .body(attendanceMapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceDTO> update(@PathVariable Long id, @RequestBody @Valid final AttendanceDTO attendanceDTO) {
        attendanceService.update(id, attendanceDTO);
        return ResponseEntity.ok(attendanceMapper.toDto(attendanceService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable final Long id) {
        attendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
