package com.paperflow.cms.service;

import com.paperflow.cms.domain.Conference;
import com.paperflow.cms.domain.Paper;
import com.paperflow.cms.domain.PaperStatus;
import com.paperflow.cms.domain.User;
import com.paperflow.cms.repository.ConferenceRepository;
import com.paperflow.cms.repository.PaperRepository;
import com.paperflow.cms.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class PaperService {

    private final PaperRepository paperRepository;
    private final ConferenceRepository conferenceRepository;
    private final UserRepository userRepository;

    public PaperService(PaperRepository paperRepository,
                        ConferenceRepository conferenceRepository,
                        UserRepository userRepository) {
        this.paperRepository = paperRepository;
        this.conferenceRepository = conferenceRepository;
        this.userRepository = userRepository;
    }

    public Paper submitPaper(String conferenceId,
                             String userId,
                             String title,
                             String abstractText,
                             String researchArea) {
        Conference conf = conferenceRepository.findById(conferenceId)
            .orElseThrow(() -> new IllegalArgumentException("Conference not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Paper paper = new Paper();
        paper.setConference(conf);
        paper.setCreatedBy(user);
        paper.setTitle(title);
        paper.setAbstractText(abstractText);
        paper.setResearchArea(researchArea);
        paper.setStatus(PaperStatus.SUBMITTED);
        return paperRepository.save(paper);
    }

    public java.util.List<Paper> listConferencePapers(String conferenceId) {
       
            return paperRepository.findByConference_Id(conferenceId);
        
    }
    public java.util.List<Paper> listIndividualPapers(String userId) {
       
            return paperRepository.findByUserId(userId);
        
    }
    public Paper updateStatus(String paperId, PaperStatus status) {
        Paper paper = paperRepository.findById(paperId)
            .orElseThrow(() -> new IllegalArgumentException("Paper not found"));
        paper.setStatus(status);
        return paperRepository.save(paper);
    }
}

