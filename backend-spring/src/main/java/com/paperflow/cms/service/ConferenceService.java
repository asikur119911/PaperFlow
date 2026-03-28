package com.paperflow.cms.service;

import com.paperflow.cms.domain.Conference;
import com.paperflow.cms.repository.ConferenceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class ConferenceService {

    private final ConferenceRepository conferenceRepository;

    public ConferenceService(ConferenceRepository conferenceRepository) {
        this.conferenceRepository = conferenceRepository;
    }

    public Conference createConference(String title,
                                       String acronym,
                                       String researchArea,
                                       String startDate,
                                       String venue) {
        Conference c = new Conference();
        c.setTitle(title);
        c.setAcronym(acronym);
        c.setResearchArea(researchArea);
        c.setVenue(venue);
        c.setStatus("DRAFT");
        // startDate can be parsed when needed; for hello-world we store title/venue/status
        return conferenceRepository.save(c);
    }

    public Page<Conference> listConferences(int page, int limit) {
        return conferenceRepository.findAll(PageRequest.of(page - 1, limit));
    }
}

