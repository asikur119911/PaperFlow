package com.paperflow.cms.web;

import com.paperflow.cms.service.ReviewerAssignmentService;
import com.paperflow.cms.web.dto.ReviewerAssignmentDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/paperflow/v1/users")
public class UserReviewerController {

    private final ReviewerAssignmentService reviewerAssignmentService;

    public UserReviewerController(ReviewerAssignmentService reviewerAssignmentService) {
        this.reviewerAssignmentService = reviewerAssignmentService;
    }

    @GetMapping("/{userId}/reviewer-dashboard")
    public ResponseEntity<ReviewerAssignmentDtos.ReviewerDashboardResponse> reviewerDashboard(
        @PathVariable("userId") String userId
    ) {
        ReviewerAssignmentDtos.ReviewerDashboardResponse response =
            reviewerAssignmentService.reviewerDashboard(userId);
        return ResponseEntity.ok(response);
    }
}
