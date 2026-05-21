package com.uni.impact.attendance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
	Page<Attendance> findByCampaignCampaignId(Long campaignId, Pageable pageable);
	List<Attendance> findByStudentUserId(Long userId);
	Page<Attendance> findByStudentUserId(Long userId, Pageable pageable);
}
