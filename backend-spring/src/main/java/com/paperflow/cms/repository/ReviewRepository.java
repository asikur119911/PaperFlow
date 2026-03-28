package com.paperflow.cms.repository;

import com.paperflow.cms.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, String> {
}

