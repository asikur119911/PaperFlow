package com.paperflow.cms.web;

import com.paperflow.cms.domain.Paper;
import com.paperflow.cms.service.PaperService;
import com.paperflow.cms.web.dto.PaperDtos;
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
public class PaperController {

    private final PaperService paperService;

    public PaperController(PaperService paperService) {
        this.paperService = paperService;
    }

    @GetMapping("/papers")
    public ResponseEntity<PaperDtos.ListPapersResponse> list(
        @RequestParam(name = "conferenceId", required = false) String conferenceId
    ) {
        List<Paper> papers = paperService.listPapers(conferenceId);
        List<PaperDtos.PaperSummary> data = papers.stream()
            .map(p -> new PaperDtos.PaperSummary(
                p.getId(),
                p.getTitle(),
                p.getStatus().name(),
                p.getConference().getId()
            ))
            .toList();
        return ResponseEntity.ok(new PaperDtos.ListPapersResponse(data, data.size()));
    }

    @PostMapping("/papers")
    public ResponseEntity<PaperDtos.SubmitPaperResponse> submit(
        @RequestBody PaperDtos.SubmitPaperRequest request
    ) {
        Paper paper = paperService.submitPaper(
            request.conferenceId(),
            request.title(),
            request.paperAbstract(),
            request.track()
        );
        return ResponseEntity.ok(
            new PaperDtos.SubmitPaperResponse(
                paper.getId(),
                paper.getStatus().name()
            )
        );
    }
}

