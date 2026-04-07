package com.paperflow.cms.service;

import com.paperflow.cms.domain.Conference;
import com.paperflow.cms.repository.ConferenceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class ConferenceService {

    private final ConferenceRepository conferenceRepository;

    public ConferenceService(ConferenceRepository conferenceRepository) {
        this.conferenceRepository = conferenceRepository;
    }

    public Conference createConference(
            String title,
            String acronym,
            String researchArea,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            OffsetDateTime submissionDeadline,
            String venue) {
        Conference c = new Conference();
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
