package com.paperflow.cms.service;

import com.paperflow.cms.domain.Assignment;
import com.paperflow.cms.domain.AssignmentStatus;
import com.paperflow.cms.domain.Paper;
import com.paperflow.cms.domain.PaperStatus;
import com.paperflow.cms.domain.Review;
import com.paperflow.cms.domain.User;
import com.paperflow.cms.repository.AssignmentRepository;
import com.paperflow.cms.repository.PaperRepository;
import com.paperflow.cms.repository.ReviewRepository;
import com.paperflow.cms.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final PaperRepository paperRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final WorkflowClient workflowClient;
    private final PaperService paperService;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             PaperRepository paperRepository,
                             UserRepository userRepository,
                             ReviewRepository reviewRepository,
                             WorkflowClient workflowClient,
                             PaperService paperService) {
        this.assignmentRepository = assignmentRepository;
        this.paperRepository = paperRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.workflowClient = workflowClient;
        this.paperService = paperService;
    }

    public Assignment createManualAssignment(String paperId, String reviewerId) {
        Paper paper = paperRepository.findById(paperId)
            .orElseThrow(() -> new IllegalArgumentException("Paper not found"));
        User reviewer = userRepository.findById(reviewerId)
            .orElseThrow(() -> new IllegalArgumentException("Reviewer not found"));

        Assignment assignment = new Assignment();
        assignment.setPaper(paper);
        assignment.setReviewer(reviewer);
        assignment.setStatus(AssignmentStatus.ASSIGNED);
        return assignmentRepository.save(assignment);
    }

    public List<Assignment> pendingAssignmentsForReviewer(String reviewerId) {
        User reviewer = userRepository.findById(reviewerId)
            .orElseThrow(() -> new IllegalArgumentException("Reviewer not found"));
        return assignmentRepository.findByReviewerAndStatus(reviewer, AssignmentStatus.ASSIGNED);
    }

    public Review submitReview(String assignmentId,
                               int score,
                               String confidence,
                               String recommendation,
                               String comments) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        Review review = new Review();
        review.setAssignment(assignment);
        review.setScore(score);
        review.setConfidence(confidence);
        review.setComments(comments);
        if ("ACCEPT".equalsIgnoreCase(recommendation)) {
            review.setRecommendation(com.paperflow.cms.domain.DecisionRecommendation.ACCEPT);
        } else if ("REVISE".equalsIgnoreCase(recommendation)) {
            review.setRecommendation(com.paperflow.cms.domain.DecisionRecommendation.REVISE);
        } else {
            review.setRecommendation(com.paperflow.cms.domain.DecisionRecommendation.REJECT);
        }

        Review saved = reviewRepository.save(review);

        assignment.setStatus(AssignmentStatus.REVIEW_SUBMITTED);
        assignmentRepository.save(assignment);

        String suggestedStatus = workflowClient.getSuggestedStatus(
            assignment.getId(),
            assignment.getPaper().getId(),
            assignment.getPaper().getConference().getId(),
            assignment.getReviewer().getId(),
            saved
        );

        if ("ACCEPTED".equalsIgnoreCase(suggestedStatus)) {
            paperService.updateStatus(assignment.getPaper().getId(), PaperStatus.ACCEPTED);
        } else if ("REJECTED".equalsIgnoreCase(suggestedStatus)) {
            paperService.updateStatus(assignment.getPaper().getId(), PaperStatus.REJECTED);
        } else if ("REVISION_REQUIRED".equalsIgnoreCase(suggestedStatus)) {
            paperService.updateStatus(assignment.getPaper().getId(), PaperStatus.REVISION_REQUIRED);
        } else {
            paperService.updateStatus(assignment.getPaper().getId(), PaperStatus.UNDER_REVIEW);
        }

        return saved;
    }
}

