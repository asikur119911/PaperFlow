package com.paperflow.cms.repository;

import com.paperflow.cms.domain.ReviewerAssignment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewerAssignmentRepository extends JpaRepository<ReviewerAssignment, String> {

    @Query("select ra from ReviewerAssignment ra where ra.reviewer.id = :reviewerId")
    List<ReviewerAssignment> findAllByReviewerId(@Param("reviewerId") String reviewerId);

    @Query("select ra from ReviewerAssignment ra where ra.conference.id = :conferenceId")
    List<ReviewerAssignment> findAllByConferenceId(@Param("conferenceId") String conferenceId);
}
