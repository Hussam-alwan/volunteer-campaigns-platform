package com.uni.impact.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByCollege_CollegeId(Long collegeId);

    Optional<User> findByEmailIgnoreCase(String email);

    long countByStudentNumberIsNotNull();

    @Query("""
            SELECT u.college.collegeId, u.college.name, COUNT(u)
            FROM User u
            WHERE u.studentNumber IS NOT NULL
            GROUP BY u.college.collegeId, u.college.name
            ORDER BY u.college.name
            """)
    List<Object[]> countStudentsGroupedByCollege();
}
