package com.paperflow.cms.repository;

import com.paperflow.cms.domain.Assignment;
import com.paperflow.cms.domain.User;
import com.paperflow.cms.domain.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, String> {

    @Query("SELECT a FROM Assignment a JOIN FETCH a.paper WHERE a.reviewer = :reviewer AND a.status = :status")
    List<Assignment> findByReviewerAndStatus(@Param("reviewer") User reviewer, @Param("status") AssignmentStatus status);

    List<Assignment> findByPaper_Conference_Id(String conferenceId);

    List<Assignment> findByReviewer_Id(String reviewerId);
}

