package com.paperflow.cms.repository;

import com.paperflow.cms.domain.Assignment;
import com.paperflow.cms.domain.User;
import com.paperflow.cms.domain.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, String> {

    List<Assignment> findByReviewerAndStatus(User reviewer, AssignmentStatus status);
}

