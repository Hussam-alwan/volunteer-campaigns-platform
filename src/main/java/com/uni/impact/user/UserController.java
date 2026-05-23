package com.uni.impact.user;

import com.uni.impact.attendance.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping(value = "/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(userService.findAll(pageable).map(userMapper::toDto));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> me(@RequestParam String email) {
        return ResponseEntity.ok(userMapper.toDto(userService.findByEmail(email)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userMapper.toDto(userService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@Valid @RequestBody UserRequestDTO userDTO) {
        User created = userService.create(userDTO);
        return ResponseEntity.created(URI.create("/api/v1/users/" + created.getUserId()))
                .body(userMapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable Long id, @RequestBody @Valid final UserRequestDTO userDTO) {
        userService.update(id, userDTO);
        return ResponseEntity.ok(userMapper.toDto(userService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable final Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ban")
    public ResponseEntity<UserResponseDTO> ban(@PathVariable Long id) {
        User user = userService.ban(id);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @GetMapping("/{id}/hours")
    public ResponseEntity<Double> getUserHours(@PathVariable Long id) {
        Double hours = attendanceService.getTotalHoursForUser(id);
        return ResponseEntity.ok(hours);
    }

}
