package com.uni.impact.campaign_photo;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CampaignPhotoRepository extends JpaRepository<CampaignPhoto, Long> {
	Page<CampaignPhoto> findByCampaignCampaignId(Long campaignId, org.springframework.data.domain.Pageable pageable);

}
