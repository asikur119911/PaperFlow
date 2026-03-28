package com.paperflow.cms.web.dto;

import java.util.List;

public class ReviewDtos {

    public record ManualAssignmentRequest(
        String paperId,
        String reviewerId
    ) {}

    public record ManualAssignmentResponse(
        String assignmentId,
        String status
    ) {}

    public record SubmitReviewRequest(
        String assignmentId,
        int score,
        String confidence,
        String recommendation,
        String comments
    ) {}

    public record SubmitReviewResponse(
        String reviewId,
        String status
    ) {}

    public record PendingReviewsResponse(
        List<AssignmentInfo> assignments
    ) {
        public record AssignmentInfo(
            String paperTitle,
            String deadline,
            String status,
            String assignmentId
        ) {}
    }
}

