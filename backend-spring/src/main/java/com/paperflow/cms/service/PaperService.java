package com.paperflow.cms.service;

import com.paperflow.cms.domain.Conference;
import com.paperflow.cms.domain.Paper;
import com.paperflow.cms.domain.PaperStatus;
import com.paperflow.cms.repository.ConferenceRepository;
import com.paperflow.cms.repository.PaperRepository;
import org.springframework.stereotype.Service;

@Service
public class PaperService {

    private final PaperRepository paperRepository;
    private final ConferenceRepository conferenceRepository;

    public PaperService(PaperRepository paperRepository,
                        ConferenceRepository conferenceRepository) {
        this.paperRepository = paperRepository;
        this.conferenceRepository = conferenceRepository;
    }

    public Paper submitPaper(String conferenceId,
                             String title,
                             String abstractText,
                             String track) {
        Conference conf = conferenceRepository.findById(conferenceId)
            .orElseThrow(() -> new IllegalArgumentException("Conference not found"));

        Paper paper = new Paper();
        paper.setConference(conf);
        paper.setTitle(title);
        paper.setAbstractText(abstractText);
        paper.setTrack(track);
        paper.setStatus(PaperStatus.SUBMITTED);
        return paperRepository.save(paper);
    }

    public java.util.List<Paper> listPapers(String conferenceId) {
        if (conferenceId != null && !conferenceId.isBlank()) {
            return paperRepository.findByConference_Id(conferenceId);
        }
        return paperRepository.findAll();
    }

    public Paper updateStatus(String paperId, PaperStatus status) {
        Paper paper = paperRepository.findById(paperId)
            .orElseThrow(() -> new IllegalArgumentException("Paper not found"));
        paper.setStatus(status);
        return paperRepository.save(paper);
    }
}

