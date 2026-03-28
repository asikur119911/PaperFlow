package com.paperflow.cms.service;

import com.paperflow.cms.config.BackendConfig;
import com.paperflow.cms.domain.DecisionRecommendation;
import com.paperflow.cms.domain.Review;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class WorkflowClient {

    private final RestTemplate restTemplate;
    private final BackendConfig backendConfig;

    public WorkflowClient(RestTemplate restTemplate, BackendConfig backendConfig) {
        this.restTemplate = restTemplate;
        this.backendConfig = backendConfig;
    }

    public String getSuggestedStatus(String assignmentId,
                                     String paperId,
                                     String conferenceId,
                                     String reviewerId,
                                     Review review) {
        String url = backendConfig.getFastapiBaseUrl() + "/internal/workflow/reviews/submit";

        Map<String, Object> payload = Map.of(
            "assignmentId", assignmentId,
            "paperId", paperId,
            "conferenceId", conferenceId,
            "reviewerId", reviewerId,
            "score", review.getScore(),
            "confidence", review.getConfidence(),
            "recommendation", review.getRecommendation() != null
                ? review.getRecommendation().name()
                : DecisionRecommendation.REJECT.name(),
            "comments", review.getComments()
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

        Object suggested = response.getBody() != null ? response.getBody().get("suggestedStatus") : null;
        return suggested != null ? suggested.toString() : "UNDER_REVIEW";
    }
}

