from fastapi import FastAPI
from pydantic import BaseModel


class ReviewWorkflowRequest(BaseModel):
    assignmentId: str
    paperId: str
    conferenceId: str
    reviewerId: str
    score: int
    confidence: str
    recommendation: str
    comments: str | None = None


class ReviewWorkflowResponse(BaseModel):
    paperId: str
    suggestedStatus: str
    message: str


app = FastAPI(title="Paperflow Workflow Helper", version="0.1.0")


@app.post("/internal/workflow/reviews/submit", response_model=ReviewWorkflowResponse)
def process_review(payload: ReviewWorkflowRequest) -> ReviewWorkflowResponse:
    """
    Lightweight helper that suggests a paper status based on review data.
    Spring Boot calls this internally when a review is submitted.
    """
    if payload.score >= 7 and payload.recommendation.upper() == "ACCEPT":
        suggested_status = "ACCEPTED"
        msg = f"Auto-decision: ACCEPT based on score {payload.score}."
    else:
        suggested_status = "REJECTED"
        msg = f"Auto-decision: REJECT based on score {payload.score}."

    return ReviewWorkflowResponse(
        paperId=payload.paperId,
        suggestedStatus=suggested_status,
        message=msg,
    )

