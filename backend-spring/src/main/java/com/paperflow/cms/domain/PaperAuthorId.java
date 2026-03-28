package com.paperflow.cms.domain;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PaperAuthorId implements Serializable {

    private String paperId;
    private String userId;

    public PaperAuthorId() {
    }

    public PaperAuthorId(String paperId, String userId) {
        this.paperId = paperId;
        this.userId = userId;
    }

    public String getPaperId() {
        return paperId;
    }

    public void setPaperId(String paperId) {
        this.paperId = paperId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PaperAuthorId that = (PaperAuthorId) o;
        return Objects.equals(paperId, that.paperId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(paperId, userId);
    }
}

