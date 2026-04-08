package com.paperflow.cms.web;

import com.paperflow.cms.domain.Assignment;
import com.paperflow.cms.domain.Review;
import com.paperflow.cms.service.AssignmentService;
import com.paperflow.cms.web.dto.ReviewDtos;
import com.paperflow.cms.web.dto.ReviewerAssignmentDtos;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @PostMapping("/conferences/{id}/invite")
    public ResponseEntity<?> inviteReviewers(
        @PathVariable("id") String conferenceId,
        @RequestBody ReviewerAssignmentDtos.InviteReviewersRequest request
    ) {
        try {
            ReviewerAssignmentDtos.InviteReviewersResponse response =
                assignmentService.inviteReviewers(conferenceId, request.emails());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @PostMapping("/conferences/{id}/assign")
    public ResponseEntity<?> assignReviewers(@PathVariable("id") String conferenceId) {
        try {
            ReviewerAssignmentDtos.AssignReviewersResponse response =
                assignmentService.assignReviewers(conferenceId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    @GetMapping("/conferences/{id}/assignments")
    public ResponseEntity<?> conferenceAssignments(@PathVariable("id") String conferenceId) {
        try {
            ReviewerAssignmentDtos.ConferenceAssignmentsResponse response =
                assignmentService.conferenceAssignments(conferenceId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @PostMapping("/assignments")
    public ResponseEntity<ReviewDtos.ManualAssignmentResponse> manualAssignment(
        @RequestBody ReviewDtos.ManualAssignmentRequest request
    ) {
        Assignment assignment = assignmentService.createManualAssignment(
            request.paperId(),
            request.reviewerEmail()
        );
        return ResponseEntity.ok(
            new ReviewDtos.ManualAssignmentResponse(
                assignment.getId(),
                "ASSIGNED"
            )
        );
    }

    @GetMapping("/reviews/reviewer-dashboard")
    public ResponseEntity<ReviewerAssignmentDtos.ReviewerDashboardResponse> reviewerDashboard(
        @RequestParam("reviewerId") String reviewerId
    ) {
        return ResponseEntity.ok(assignmentService.reviewerDashboard(reviewerId));
    }

    @GetMapping("/reviews/pending")
    public ResponseEntity<ReviewDtos.PendingReviewsResponse> pending(
        @RequestParam("reviewerId") String reviewerId
    ) {
        List<Assignment> assignments = assignmentService.pendingAssignmentsForReviewer(reviewerId);
        List<ReviewDtos.AssignmentInfo> items = assignments.stream()
            .map(a -> new ReviewDtos.AssignmentInfo(
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

