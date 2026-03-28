package com.paperflow.cms.web;

import com.paperflow.cms.domain.Paper;
import com.paperflow.cms.service.PaperService;
import com.paperflow.cms.web.dto.PaperDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/paperflow/v1")
public class PaperController {

    private final PaperService paperService;

    public PaperController(PaperService paperService) {
        this.paperService = paperService;
    }

    @PostMapping("/papers")
    public ResponseEntity<PaperDtos.SubmitPaperResponse> submit(
        @RequestBody PaperDtos.SubmitPaperRequest request
    ) {
        Paper paper = paperService.submitPaper(
            request.conferenceId(),
            request.title(),
            request.abstract(),
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

