package com.uni.impact.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {
	Page<Application> findByCampaignCampaignId(Long campaignId, Pageable pageable);
	Page<Application> findByStudentUserId(Long userId, Pageable pageable);

	@Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
	List<Object[]> countGroupedByStatus();
}
