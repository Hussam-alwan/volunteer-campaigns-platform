package com.uni.impact.college;

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

    public Page<College> findAll(Pageable pageable) {
        return collegeRepository.findAll(pageable);
    }

    public College findById(final Long collegeId) {
        return collegeRepository.findById(collegeId)
                .orElseThrow(NotFoundException::new);
    }

    @Transactional
    public College create(final CollegeDTO collegeDTO) {
        if (collegeDTO.getCollegeId() != null) {
            throw new IllegalArgumentException("A new college cannot already have an ID");
        }
        College college = collegeMapper.toEntity(collegeDTO);
        return collegeRepository.save(college);
    }

    @Transactional
    public College update(final Long collegeId, final CollegeDTO collegeDTO) {
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(NotFoundException::new);
        collegeMapper.updateEntity(college, collegeDTO);
        return collegeRepository.save(college);
    }

    public void delete(final Long collegeId) {
        final College college = collegeRepository.findById(collegeId)
                .orElseThrow(NotFoundException::new);
        try {
            collegeRepository.delete(college);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to delete college. It might be referenced by other entities.");
        }
    }
}
