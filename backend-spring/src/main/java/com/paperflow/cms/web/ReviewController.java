package com.paperflow.cms.web;

import com.paperflow.cms.domain.Assignment;
import com.paperflow.cms.domain.Review;
import com.paperflow.cms.service.AssignmentService;
import com.paperflow.cms.web.dto.ReviewDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/paperflow/v1")
public class ReviewController {

    private final AssignmentService assignmentService;

    public ReviewController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping("/assignments")
    public ResponseEntity<ReviewDtos.ManualAssignmentResponse> manualAssignment(
        @RequestBody ReviewDtos.ManualAssignmentRequest request
    ) {
        Assignment assignment = assignmentService.createManualAssignment(
            request.paperId(),
            request.reviewerId()
        );
        return ResponseEntity.ok(
            new ReviewDtos.ManualAssignmentResponse(
                assignment.getId(),
                "ASSIGNED"
            )
        );
    }

    @GetMapping("/reviews/pending")
    public ResponseEntity<ReviewDtos.PendingReviewsResponse> pending(
        @RequestParam("reviewerId") String reviewerId
    ) {
        List<Assignment> assignments = assignmentService.pendingAssignmentsForReviewer(reviewerId);
        List<ReviewDtos.PendingReviewsResponse.AssignmentInfo> items = assignments.stream()
            .map(a -> new ReviewDtos.PendingReviewsResponse.AssignmentInfo(
                a.getPaper().getTitle(),
                Instant.now().toString(),
                a.getStatus().name(),
                a.getId()
            ))
            .toList();
        return ResponseEntity.ok(new ReviewDtos.PendingReviewsResponse(items));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ReviewDtos.SubmitReviewResponse> submitReview(
        @RequestBody ReviewDtos.SubmitReviewRequest request
    ) {
        Review review = assignmentService.submitReview(
            request.assignmentId(),
            request.score(),
            request.confidence(),
            request.recommendation(),
            request.comments()
        );
        return ResponseEntity.ok(
            new ReviewDtos.SubmitReviewResponse(
                review.getId(),
                "SUBMITTED"
            )
        );
    }
}

