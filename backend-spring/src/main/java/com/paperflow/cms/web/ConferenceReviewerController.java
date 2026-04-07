package com.paperflow.cms.web;

import com.paperflow.cms.service.ReviewerAssignmentService;
import com.paperflow.cms.web.dto.ReviewerAssignmentDtos;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/paperflow/v1/conferences")
public class ConferenceReviewerController {

    private final ReviewerAssignmentService reviewerAssignmentService;

    public ConferenceReviewerController(ReviewerAssignmentService reviewerAssignmentService) {
        this.reviewerAssignmentService = reviewerAssignmentService;
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<?> inviteReviewers(
        @PathVariable("id") String conferenceId,
        @RequestBody ReviewerAssignmentDtos.InviteReviewersRequest request
    ) {
        try {
            ReviewerAssignmentDtos.InviteReviewersResponse response =
                reviewerAssignmentService.inviteReviewers(conferenceId, request.emails());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<?> assignReviewers(@PathVariable("id") String conferenceId) {
        try {
            ReviewerAssignmentDtos.AssignReviewersResponse response =
                reviewerAssignmentService.assignReviewers(conferenceId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<?> conferenceAssignments(@PathVariable("id") String conferenceId) {
        try {
            ReviewerAssignmentDtos.ConferenceAssignmentsResponse response =
                reviewerAssignmentService.conferenceAssignments(conferenceId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }
}
