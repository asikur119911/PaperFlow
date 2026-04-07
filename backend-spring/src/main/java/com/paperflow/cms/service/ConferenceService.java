package com.paperflow.cms.service;

import com.paperflow.cms.domain.Conference;
import com.paperflow.cms.domain.User;
import com.paperflow.cms.repository.ConferenceRepository;
import com.paperflow.cms.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class ConferenceService {

    private final ConferenceRepository conferenceRepository;
    private final UserRepository userRepository;

    public ConferenceService(ConferenceRepository conferenceRepository,
                             UserRepository userRepository) {
        this.conferenceRepository = conferenceRepository;
        this.userRepository = userRepository;
    }

    public Conference createConference(
            String chairId,
            String title,
            String acronym,
            String researchArea,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            OffsetDateTime submissionDeadline,
            String venue) {
        User chair = userRepository.findById(chairId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conference c = new Conference();
        c.setChair(chair);
        c.setTitle(title);
        c.setAcronym(acronym);
        c.setResearchArea(researchArea);
        c.setStartDate(startDate);
        c.setEndDate(endDate);
        c.setSubmissionDeadline(submissionDeadline);
        c.setVenue(venue);
        c.setStatus("DRAFT");
        return conferenceRepository.save(c);
    }

    public Page<Conference> listConferences(int page, int limit) {
        return conferenceRepository.findAll(PageRequest.of(page - 1, limit));
    }
}
