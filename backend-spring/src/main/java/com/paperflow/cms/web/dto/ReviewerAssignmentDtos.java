package com.paperflow.cms.web.dto;

import java.util.List;

public class ReviewerAssignmentDtos {

    public record InviteReviewersRequest(
        List<String> emails
    ) {}

    public record InviteReviewersResponse(
        String conferenceId,
        int invitedCount,
        List<String> invitedReviewerIds,
        String message
    ) {}

    public record AssignReviewersResponse(
        String conferenceId,
        int totalPapers,
        int totalAssignmentsCreated,
        String message
    ) {}

    public record ReviewerSummary(
        String reviewerId,
        String reviewerEmail,
        String reviewerName
    ) {}

    public record PaperAssignmentSummary(
        String paperId,
        String paperTitle,
        List<ReviewerSummary> reviewers
    ) {}

    public record ConferenceAssignmentsResponse(
        String conferenceId,
        int totalPapers,
        List<PaperAssignmentSummary> assignments
    ) {}

    public record ReviewerDashboardPaper(
        String conferenceId,
        String conferenceTitle,
        String paperId,
        String paperTitle
    ) {}

    public record ReviewerDashboardResponse(
        String reviewerId,
        List<ReviewerDashboardPaper> papers
    ) {}
}
