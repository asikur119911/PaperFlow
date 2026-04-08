package com.paperflow.cms.service;

import com.paperflow.cms.domain.Assignment;
import com.paperflow.cms.domain.AssignmentStatus;
import com.paperflow.cms.domain.Conference;
import com.paperflow.cms.domain.Paper;
import com.paperflow.cms.domain.PaperStatus;
import com.paperflow.cms.domain.Review;
import com.paperflow.cms.domain.User;
import com.paperflow.cms.repository.AssignmentRepository;
import com.paperflow.cms.repository.ConferenceInvitationRepository;
import com.paperflow.cms.repository.ConferenceRepository;
import com.paperflow.cms.repository.PaperRepository;
import com.paperflow.cms.repository.ReviewRepository;
import com.paperflow.cms.repository.UserRepository;
import com.paperflow.cms.web.dto.ReviewerAssignmentDtos;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final PaperRepository paperRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ConferenceRepository conferenceRepository;
    private final ConferenceInvitationRepository conferenceInvitationRepository;
    private final WorkflowClient workflowClient;
    private final PaperService paperService;

    private final Random random = new Random();

    public AssignmentService(
        AssignmentRepository assignmentRepository,
        PaperRepository paperRepository,
        UserRepository userRepository,
        ReviewRepository reviewRepository,
        ConferenceRepository conferenceRepository,
        ConferenceInvitationRepository conferenceInvitationRepository,
        WorkflowClient workflowClient,
        PaperService paperService
    ) {
        this.assignmentRepository = assignmentRepository;
        this.paperRepository = paperRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.conferenceRepository = conferenceRepository;
        this.conferenceInvitationRepository = conferenceInvitationRepository;
        this.workflowClient = workflowClient;
        this.paperService = paperService;
    }

    public Assignment createManualAssignment(String paperId, String reviewerEmail) {
        Paper paper = paperRepository.findById(paperId)
            .orElseThrow(() -> new IllegalArgumentException("Paper not found"));
        User reviewer = userRepository.findByEmail(reviewerEmail)
            .orElseThrow(() -> new IllegalArgumentException("Reviewer email not found"));

        Assignment assignment = new Assignment();
        assignment.setPaper(paper);
        assignment.setReviewer(reviewer);
        assignment.setStatus(AssignmentStatus.ASSIGNED);
        return assignmentRepository.save(assignment);
    }

    @Transactional(readOnly = true)
    public List<Assignment> pendingAssignmentsForReviewer(String reviewerId) {
        User reviewer = userRepository.findById(reviewerId)
            .orElseThrow(() -> new IllegalArgumentException("Reviewer not found"));
        return assignmentRepository.findByReviewerAndStatus(reviewer, AssignmentStatus.ASSIGNED);
    }

    @Transactional
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

    @Transactional
    public ReviewerAssignmentDtos.InviteReviewersResponse inviteReviewers(
        String conferenceId,
        List<String> emails
    ) {
        Conference conference = ensureConferenceExists(conferenceId);

        List<String> sanitizedEmails = emails == null
            ? List.of()
            : emails.stream().filter(Objects::nonNull).map(String::trim).filter(s -> !s.isEmpty()).toList();

        if (sanitizedEmails.isEmpty()) {
            throw new IllegalArgumentException("At least one reviewer email is required");
        }

        List<User> invitedUsers = new ArrayList<>();
        List<String> missingEmails = new ArrayList<>();

        for (String email : sanitizedEmails) {
            userRepository.findByEmail(email).ifPresentOrElse(invitedUsers::add, () -> missingEmails.add(email));
        }

        if (!missingEmails.isEmpty()) {
            throw new IllegalArgumentException("These emails do not exist: " + String.join(", ", missingEmails));
        }

        for (User user : invitedUsers) {
            if (!conferenceInvitationRepository.existsByConference_IdAndUser_Id(conferenceId, user.getId())) {
                com.paperflow.cms.domain.ConferenceInvitation invitation = new com.paperflow.cms.domain.ConferenceInvitation();
                invitation.setConference(conference);
                invitation.setUser(user);
                invitation.setEmail(user.getEmail());
                invitation.setRole(com.paperflow.cms.domain.UserRole.REVIEWER);
                invitation.setStatus("INVITED");
                conferenceInvitationRepository.save(invitation);
            }
        }

        return new ReviewerAssignmentDtos.InviteReviewersResponse(
            conferenceId,
            invitedUsers.size(),
            invitedUsers.stream().map(User::getId).toList(),
            "Invitations verified successfully"
        );
    }

    @Transactional
    public ReviewerAssignmentDtos.AssignReviewersResponse assignReviewers(String conferenceId) {
        ensureConferenceExists(conferenceId);
        List<Paper> papers = paperRepository.findByConference_Id(conferenceId);
        if (papers.isEmpty()) {
            throw new IllegalArgumentException("No papers found for conference");
        }

        List<com.paperflow.cms.domain.ConferenceInvitation> invitations =
            conferenceInvitationRepository.findAcceptedByConferenceId(conferenceId);
        if (invitations.isEmpty()) {
            throw new IllegalStateException("No invited reviewers found for conference");
        }

        List<User> invitedUsers = invitations.stream()
            .map(com.paperflow.cms.domain.ConferenceInvitation::getUser)
            .toList();

        int created = 0;
        for (Paper paper : papers) {
            User selectedReviewer = invitedUsers.get(random.nextInt(invitedUsers.size()));
            Assignment assignment = new Assignment();
            assignment.setPaper(paper);
            assignment.setReviewer(selectedReviewer);
            assignment.setStatus(AssignmentStatus.ASSIGNED);
            assignmentRepository.save(assignment);
            created++;
        }

        return new ReviewerAssignmentDtos.AssignReviewersResponse(
            conferenceId,
            papers.size(),
            created,
            "Reviewer assignment completed"
        );
    }

    @Transactional(readOnly = true)
    public ReviewerAssignmentDtos.ConferenceAssignmentsResponse conferenceAssignments(String conferenceId) {
        ensureConferenceExists(conferenceId);
        List<Paper> papers = paperRepository.findByConference_Id(conferenceId);
        List<Assignment> assignments = assignmentRepository.findByPaper_Conference_Id(conferenceId);

        Map<String, List<ReviewerAssignmentDtos.ReviewerSummary>> reviewersByPaperId = new LinkedHashMap<>();
        for (Assignment assignment : assignments) {
            String paperId = assignment.getPaper().getId();
            reviewersByPaperId.computeIfAbsent(paperId, ignored -> new ArrayList<>())
                .add(new ReviewerAssignmentDtos.ReviewerSummary(
                    assignment.getReviewer().getId(),
                    assignment.getReviewer().getEmail(),
                    assignment.getReviewer().getFullName()
                ));
        }

        List<ReviewerAssignmentDtos.PaperAssignmentSummary> result = papers.stream()
            .map(paper -> new ReviewerAssignmentDtos.PaperAssignmentSummary(
                paper.getId(),
                paper.getTitle(),
                reviewersByPaperId.getOrDefault(paper.getId(), List.of())
            ))
            .toList();

        return new ReviewerAssignmentDtos.ConferenceAssignmentsResponse(
            conferenceId,
            papers.size(),
            result
        );
    }

    @Transactional(readOnly = true)
    public ReviewerAssignmentDtos.ReviewerDashboardResponse reviewerDashboard(String userId) {
        User reviewer = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Reviewer not found"));

        List<Assignment> assignments = assignmentRepository.findByReviewer_Id(userId);
        Collection<ReviewerAssignmentDtos.ReviewerDashboardPaper> papers = assignments.stream()
            .map(a -> new ReviewerAssignmentDtos.ReviewerDashboardPaper(
                a.getPaper().getConference().getId(),
                a.getPaper().getConference().getTitle(),
                a.getPaper().getId(),
                a.getPaper().getTitle()
            ))
            .collect(
                LinkedHashSet::new,
                LinkedHashSet::add,
                LinkedHashSet::addAll
            );

        return new ReviewerAssignmentDtos.ReviewerDashboardResponse(
            reviewer.getId(),
            new ArrayList<>(papers)
        );
    }

    private Conference ensureConferenceExists(String conferenceId) {
        return conferenceRepository.findById(conferenceId)
            .orElseThrow(() -> new IllegalArgumentException("Conference not found"));
    }
}
