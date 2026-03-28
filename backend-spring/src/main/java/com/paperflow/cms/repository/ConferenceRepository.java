package com.paperflow.cms.repository;

import com.paperflow.cms.domain.Conference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConferenceRepository extends JpaRepository<Conference, String> {
}

