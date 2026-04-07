package com.paperflow.cms.service;

import com.paperflow.cms.domain.Conference;
import com.paperflow.cms.domain.Paper;
import com.paperflow.cms.domain.ReviewerAssignment;
import com.paperflow.cms.domain.User;
import com.paperflow.cms.repository.ConferenceRepository;
import com.paperflow.cms.repository.PaperRepository;
import com.paperflow.cms.repository.ReviewerAssignmentRepository;
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
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewerAssignmentService {

    private final ConferenceRepository conferenceRepository;
    private final PaperRepository paperRepository;
    private final UserRepository userRepository;
    private final ReviewerAssignmentRepository reviewerAssignmentRepository;

    private final Map<String, Set<String>> invitedReviewerIdsByConference = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public ReviewerAssignmentService(
        ConferenceRepository conferenceRepository,
        PaperRepository paperRepository,
        UserRepository userRepository,
        ReviewerAssignmentRepository reviewerAssignmentRepository
    ) {
        this.conferenceRepository = conferenceRepository;
        this.paperRepository = paperRepository;
        this.userRepository = userRepository;
        this.reviewerAssignmentRepository = reviewerAssignmentRepository;
    }

    @Transactional
    public ReviewerAssignmentDtos.InviteReviewersResponse inviteReviewers(
        String conferenceId,
        List<String> emails
    ) {
        ensureConferenceExists(conferenceId);

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

        Set<String> invitedIds = invitedReviewerIdsByConference.computeIfAbsent(
            conferenceId,
            ignored -> ConcurrentHashMap.newKeySet()
        );
        invitedUsers.forEach(user -> invitedIds.add(user.getId()));

        return new ReviewerAssignmentDtos.InviteReviewersResponse(
            conferenceId,
            invitedUsers.size(),
            invitedUsers.stream().map(User::getId).toList(),
            "Invitations verified successfully"
        );
    }

    @Transactional
    public ReviewerAssignmentDtos.AssignReviewersResponse assignReviewers(String conferenceId) {
        Conference conference = ensureConferenceExists(conferenceId);
        List<Paper> papers = paperRepository.findByConference_Id(conferenceId);
        if (papers.isEmpty()) {
            throw new IllegalArgumentException("No papers found for conference");
        }

        Set<String> invitedIds = invitedReviewerIdsByConference.getOrDefault(conferenceId, Set.of());
        if (invitedIds.isEmpty()) {
            throw new IllegalStateException("No invited reviewers found for conference");
        }

        List<User> invitedUsers = userRepository.findAllById(invitedIds);
        if (invitedUsers.isEmpty()) {
            throw new IllegalStateException("No valid invited reviewers found in users table");
        }

        int created = 0;
        for (Paper paper : papers) {
            User selectedReviewer = invitedUsers.get(random.nextInt(invitedUsers.size()));
            ReviewerAssignment assignment = new ReviewerAssignment();
            assignment.setConference(conference);
            assignment.setPaper(paper);
            assignment.setReviewer(selectedReviewer);
            reviewerAssignmentRepository.save(assignment);
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
        List<ReviewerAssignment> assignments = reviewerAssignmentRepository.findAllByConferenceId(conferenceId);

        Map<String, List<ReviewerAssignmentDtos.ReviewerSummary>> reviewersByPaperId = new LinkedHashMap<>();
        for (ReviewerAssignment assignment : assignments) {
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

        List<ReviewerAssignment> assignments = reviewerAssignmentRepository.findAllByReviewerId(userId);
        Collection<ReviewerAssignmentDtos.ReviewerDashboardPaper> papers = assignments.stream()
            .map(a -> new ReviewerAssignmentDtos.ReviewerDashboardPaper(
                a.getConference().getId(),
                a.getConference().getTitle(),
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
