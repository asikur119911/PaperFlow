package com.paperflow.cms.web;

import com.paperflow.cms.domain.Conference;
import com.paperflow.cms.service.ConferenceService;
import com.paperflow.cms.web.dto.ConferenceDtos;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/paperflow/v1")
public class ConferenceController {

    private final ConferenceService conferenceService;

    public ConferenceController(ConferenceService conferenceService) {
        this.conferenceService = conferenceService;
    }

    @PostMapping("/conferences")
    public ResponseEntity<ConferenceDtos.CreateConferenceResponse> create(
        @RequestBody ConferenceDtos.CreateConferenceRequest request
    ) {
        Conference c = conferenceService.createConference(
            request.title(),
            request.acronym(),
            request.researchArea(),
            request.startDate(),
            request.venue()
        );
        return ResponseEntity.ok(
            new ConferenceDtos.CreateConferenceResponse(
                c.getId(),
                c.getStatus() != null ? c.getStatus() : "DRAFT"
            )
        );
    }

    @GetMapping("/conferences")
    public ResponseEntity<ConferenceDtos.ListConferencesResponse> list(
        @RequestParam(name = "status", required = false) String status,
        @RequestParam(name = "area", required = false) String area,
        @RequestParam(name = "page", defaultValue = "1") int page,
        @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        Page<Conference> conferences = conferenceService.listConferences(page, limit);
        List<ConferenceDtos.ConferenceSummary> data = conferences.stream()
            .map(c -> new ConferenceDtos.ConferenceSummary(
                c.getId(),
                c.getTitle(),
                null
            ))
            .toList();
        ConferenceDtos.ListConferencesResponse.Meta meta =
            new ConferenceDtos.ListConferencesResponse.Meta(conferences.getTotalElements());
        return ResponseEntity.ok(new ConferenceDtos.ListConferencesResponse(data, meta));
    }
}

