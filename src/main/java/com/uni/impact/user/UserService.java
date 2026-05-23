package com.uni.impact.user;

import com.uni.impact.college.College;
import com.uni.impact.college.CollegeRepository;
import com.uni.impact.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public Page<User> findAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public User findById(final Long userId) {
        return userRepository.findById(userId).orElseThrow(NotFoundException::new);
    }

    public User findByEmail(final String email) {
        return userRepository.findByEmailIgnoreCase(email).orElseThrow(NotFoundException::new);
    }

    @Transactional
    public User create(final UserRequestDTO userDTO) {
        if (userDTO.getPassword() == null || userDTO.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (emailExists(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        User user = userMapper.toEntity(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        applyRelations(user, userDTO);
        return userRepository.save(user);
    }

    @Transactional
    public User update(final Long userId, final UserRequestDTO userDTO) {
        User user = userRepository.findById(userId).orElseThrow(NotFoundException::new);
        userMapper.updateEntity(user, userDTO);
        if (userDTO.getPassword() != null && !userDTO.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        applyRelations(user, userDTO);
        return userRepository.save(user);
    }

    @Transactional
    public void delete(final Long userId) {
        final User user = userRepository.findById(userId).orElseThrow(NotFoundException::new);
        userRepository.delete(user);
    }

    private void applyRelations(final User user, final UserRequestDTO userDTO) {
        final College college = userDTO.getCollege() == null ? null : collegeRepository.findById(userDTO.getCollege())
                .orElseThrow(() -> new NotFoundException("college not found"));
        user.setCollege(college);
    }

    public boolean emailExists(final String email) {
        return userRepository.existsByEmailIgnoreCase(email);
    }

    @Transactional
    public User ban(final Long id) {
        User user = userRepository.findById(id).orElseThrow(NotFoundException::new);
        if (Boolean.TRUE.equals(user.getIsBanned())) {
            return user;
        }
        user.setIsBanned(true);
        return userRepository.save(user);
    }
}
