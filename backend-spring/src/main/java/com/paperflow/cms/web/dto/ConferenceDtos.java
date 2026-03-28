package com.paperflow.cms.web.dto;

import java.util.List;

public class ConferenceDtos {

    public record CreateConferenceRequest(
        String title,
        String acronym,
        String researchArea,
        String startDate,
        String venue
    ) {}

    public record CreateConferenceResponse(
        String conferenceId,
        String status
    ) {}

    public record ConferenceSummary(
        String id,
        String title,
        String bannerUrl
    ) {}

    public record ListConferencesResponse(
        List<ConferenceSummary> data,
        Meta meta
    ) {
        public record Meta(long total) {}
    }
}

