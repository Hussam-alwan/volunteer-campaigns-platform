package com.uni.impact.application;

import com.uni.impact.application.dto.VolunteerSearchCriteria;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

public class VolunteerSpecification {

    public static Specification<Application> withSearchCriteria(VolunteerSearchCriteria criteria) {
        return (Root<Application> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Predicate predicate = cb.conjunction();

            // Search in student first name, last name, or email
            if (criteria.getSearchText() != null && !criteria.getSearchText().trim().isEmpty()) {
                String searchPattern = "%" + criteria.getSearchText().toLowerCase() + "%";
                Join<Object, Object> studentJoin = root.join("student");
                predicate = cb.and(predicate,
                    cb.or(
                        cb.like(cb.lower(studentJoin.get("firstName")), searchPattern),
                        cb.like(cb.lower(studentJoin.get("lastName")), searchPattern),
                        cb.like(cb.lower(studentJoin.get("email")), searchPattern)
                    )
                );
            }

            // Filter by application status
            if (criteria.getStatus() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), criteria.getStatus()));
            }

            // Filter by college ID through student
            if (criteria.getCollegeId() != null) {
                Join<Object, Object> studentJoin = root.join("student");
                Join<Object, Object> collegeJoin = studentJoin.join("college");
                predicate = cb.and(predicate, cb.equal(collegeJoin.get("collegeId"), criteria.getCollegeId()));
            }

            // Filter by campaign ID
            if (criteria.getCampaignId() != null) {
                Join<Object, Object> campaignJoin = root.join("campaign");
                predicate = cb.and(predicate, cb.equal(campaignJoin.get("campaignId"), criteria.getCampaignId()));
            }

            // Filter by student ID
            if (criteria.getStudentId() != null) {
                Join<Object, Object> studentJoin = root.join("student");
                predicate = cb.and(predicate, cb.equal(studentJoin.get("userId"), criteria.getStudentId()));
            }

            return predicate;
        };
    }
}

