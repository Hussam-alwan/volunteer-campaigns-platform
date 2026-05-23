package com.uni.impact.attendance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

	@Override
	@EntityGraph(attributePaths = {"student", "recordedBy"})
	Page<Attendance> findAll(Pageable pageable);

	@Override
	@EntityGraph(attributePaths = {"student", "recordedBy"})
	Optional<Attendance> findById(Long id);

	@EntityGraph(attributePaths = {"student", "recordedBy"})
	Page<Attendance> findByCampaignCampaignId(Long campaignId, Pageable pageable);

	List<Attendance> findByStudentUserId(Long userId);

	void deleteByCampaignCampaignId(Long campaignId);

	long countByStatus(AttendanceStatus status);
}
