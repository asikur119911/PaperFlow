package com.paperflow.cms.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PaperDtos {

    public record SubmitPaperRequest(
        String conferenceId,
        String userId,
        String title,
        @JsonProperty("abstract") String paperAbstract,
        java.util.List<String> authors,
        String researchArea
    ) {}

    public record SubmitPaperResponse(
        String paperId,
        String status
    ) {}

    public record PaperSummary(
        String id,
        String title,
        String status,
        String conference_name
    ) {}

    public record ListPapersResponse(
        java.util.List<PaperSummary> data,
        long total
    ) {}
}

