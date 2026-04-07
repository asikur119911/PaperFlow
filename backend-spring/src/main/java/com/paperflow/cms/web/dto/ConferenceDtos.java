package com.paperflow.cms.web.dto;

import java.time.OffsetDateTime;
import java.util.List;

public class ConferenceDtos {

    public record CreateConferenceRequest(
        String chairId,
        String title,
        String acronym,
        String researchArea,
        OffsetDateTime startDate,
        OffsetDateTime endDate,
        OffsetDateTime submissionDeadline,
        String venue
    ) {}

    public record CreateConferenceResponse(
        String conferenceId,
        String status
    ) {}

    public record ConferenceSummary(
        String id,
        String title,
        String researchArea,
        String bannerUrl

    ) {}

    public record Meta(long total) {}

    public record ListConferencesResponse(
        List<ConferenceSummary> data,
        Meta meta
    ) {}
}
