package com.uni.impact.campaign;

import com.uni.impact.campaign.dto.CampaignSearchCriteria;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

public class CampaignSpecification {

    public static Specification<Campaign> withSearchCriteria(CampaignSearchCriteria criteria) {
        return (Root<Campaign> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Predicate predicate = cb.conjunction();

            // Search in title or description
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
                predicate = cb.and(predicate, cb.equal(categoryJoin.get("campaignId"), criteria.getCategoryId()));
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

    /**
     * Filter campaigns by status only
     */
    public static Specification<Campaign> withStatus(CampaignStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status != null) {
                return criteriaBuilder.equal(root.get("status"), status);
            }
            return criteriaBuilder.conjunction();
        };
    }

    /**
     * Filter campaigns by college ID
     */
    public static Specification<Campaign> withCollegeId(Long collegeId) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();
            if (collegeId != null) {
                Join<Object, Object> userJoin = root.join("proposedBy");
                Join<Object, Object> collegeJoin = userJoin.join("college");
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.equal(collegeJoin.get("collegeId"), collegeId));
            }
            return predicate;
        };
    }

    /**
     * Filter campaigns by category ID
     */
    public static Specification<Campaign> withCategoryId(Long categoryId) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();
            if (categoryId != null) {
                Join<Object, Object> categoryJoin = root.join("category");
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.equal(categoryJoin.get("campaignId"), categoryId));
            }
            return predicate;
        };
    }

}

