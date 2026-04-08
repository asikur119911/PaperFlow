package com.paperflow.cms.repository;

import com.paperflow.cms.domain.ConferenceInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConferenceInvitationRepository extends JpaRepository<ConferenceInvitation, String> {

    @Query("SELECT ci FROM ConferenceInvitation ci WHERE ci.conference.id = :conferenceId AND ci.user IS NOT NULL")
    List<ConferenceInvitation> findAcceptedByConferenceId(@Param("conferenceId") String conferenceId);

    boolean existsByConference_IdAndUser_Id(String conferenceId, String userId);
}
