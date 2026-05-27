package com.uni.impact.college;

import com.uni.impact.user.UserRepository;
import com.uni.impact.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CollegeService {

    private final CollegeRepository collegeRepository;
    private final CollegeMapper collegeMapper;
    private final UserRepository userRepository;

    public Page<College> findAll(Pageable pageable) {
        return collegeRepository.findAll(pageable);
    }

    public Page<College> search(final String query, final Pageable pageable) {
        if (query == null || query.isBlank()) {
            return collegeRepository.findAll(pageable);
        }
        return collegeRepository
                .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query, pageable);
    }

    public College findById(final Long collegeId) {
        return collegeRepository.findById(collegeId)
                .orElseThrow(NotFoundException::new);
    }

    @Transactional
    public College create(final CollegeRequestDTO collegeDTO) {
        College college = collegeMapper.toEntity(collegeDTO);
        return collegeRepository.save(college);
    }

    @Transactional
    public College update(final Long collegeId, final CollegeRequestDTO collegeDTO) {
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(NotFoundException::new);
        collegeMapper.updateEntity(college, collegeDTO);
        return collegeRepository.save(college);
    }

    @Transactional
    public void delete(final Long collegeId) {
        final College college = collegeRepository.findById(collegeId)
                .orElseThrow(NotFoundException::new);
        if (userRepository.existsByCollege_CollegeId(collegeId)) {
            throw new IllegalStateException("Unable to delete college. It is referenced by one or more users.");
        }
        collegeRepository.delete(college);
    }
}
