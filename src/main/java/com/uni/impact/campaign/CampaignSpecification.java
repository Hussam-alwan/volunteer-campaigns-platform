package com.uni.impact.campaign;

import com.uni.impact.campaign.dto.CampaignSearchCriteria;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

public final class CampaignSpecification {

    private CampaignSpecification() {
    }

    public static Specification<Campaign> withSearchCriteria(CampaignSearchCriteria criteria) {
        return (Root<Campaign> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Predicate predicate = cb.conjunction();

            if (criteria.getSearchText() != null && !criteria.getSearchText().trim().isEmpty()) {
                String searchPattern = "%" + criteria.getSearchText().toLowerCase() + "%";
                predicate = cb.and(predicate,
                        cb.or(
                                cb.like(cb.lower(root.get("title")), searchPattern),
                                cb.like(cb.lower(root.get("description")), searchPattern)
                        )
                );
            }

            if (criteria.getStatus() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), criteria.getStatus()));
            }

            if (criteria.getCategoryId() != null) {
                Join<Object, Object> categoryJoin = root.join("category");
                predicate = cb.and(predicate, cb.equal(categoryJoin.get("categoryId"), criteria.getCategoryId()));
            }

            if (criteria.getCollegeId() != null) {
                Join<Object, Object> userJoin = root.join("proposedBy");
                Join<Object, Object> collegeJoin = userJoin.join("college");
                predicate = cb.and(predicate, cb.equal(collegeJoin.get("collegeId"), criteria.getCollegeId()));
            }

            if (criteria.getProposedByUserId() != null) {
                Join<Object, Object> userJoin = root.join("proposedBy");
                predicate = cb.and(predicate, cb.equal(userJoin.get("userId"), criteria.getProposedByUserId()));
            }

            return predicate;
        };
    }
}
