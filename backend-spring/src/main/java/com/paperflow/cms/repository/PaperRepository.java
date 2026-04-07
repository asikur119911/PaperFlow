package com.paperflow.cms.repository;

import com.paperflow.cms.domain.Paper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.Query;

public interface PaperRepository extends JpaRepository<Paper, String> {
    java.util.List<Paper> findByConference_Id(String conferenceId);

    @Query("SELECT p FROM Paper p JOIN FETCH p.conference WHERE p.createdBy.id = :userId")
    java.util.List<Paper> findByUserId(@Param("userId") String userId);
    // @Query(value="SELECT * FROM papers p WHERE p.createdBy = :userId",nativeQuery = true)
    // java.util.List<Paper> findByUserId(@Param("userId") String userId);
}

