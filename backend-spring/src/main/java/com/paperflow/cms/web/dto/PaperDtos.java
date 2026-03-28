package com.paperflow.cms.web.dto;

public class PaperDtos {

    public record SubmitPaperRequest(
        String conferenceId,
        String title,
        String paper_abstract,
        java.util.List<String> authors,
        String track
    ) {}

    public record SubmitPaperResponse(
        String paperId,
        String status
    ) {}
}

