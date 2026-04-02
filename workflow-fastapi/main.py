# from fastapi import FastAPI
# from pydantic import BaseModel


# class ReviewWorkflowRequest(BaseModel):
#     assignmentId: str
#     paperId: str
#     conferenceId: str
#     reviewerId: str
#     score: int
#     confidence: str
#     recommendation: str
#     comments: str | None = None


# class ReviewWorkflowResponse(BaseModel):
#     paperId: str
#     suggestedStatus: str
#     message: str


# app = FastAPI(title="Paperflow Workflow Helper", version="0.1.0")


# @app.post("/internal/workflow/reviews/submit", response_model=ReviewWorkflowResponse)
# def process_review(payload: ReviewWorkflowRequest) -> ReviewWorkflowResponse:
#     """
#     Lightweight helper that suggests a paper status based on review data.
#     Spring Boot calls this internally when a review is submitted.
#     """
#     if payload.score >= 7 and payload.recommendation.upper() == "ACCEPT":
#         suggested_status = "ACCEPTED"
#         msg = f"Auto-decision: ACCEPT based on score {payload.score}."
#     else:
#         suggested_status = "REJECTED"
#         msg = f"Auto-decision: REJECT based on score {payload.score}."

#     return ReviewWorkflowResponse(
#         paperId=payload.paperId,
#         suggestedStatus=suggested_status,
#         message=msg,
#     )

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal

app = FastAPI(title="PaperFlow Workflow Helper")

# FIX: Add CORS so Spring Boot (or browser dev tools) can reach this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ReviewPayload(BaseModel):
    assignmentId: str
    paperId: str
    conferenceId: str
    reviewerId: str
    score: int = Field(..., ge=1, le=10)  # FIX: validate range 1–10
    confidence: Literal["LOW", "MEDIUM", "HIGH"]
    recommendation: Literal["ACCEPT", "REJECT", "REVISE"]
    comments: str = ""


class DecisionResponse(BaseModel):
    paperId: str
    suggestedStatus: str
    message: str


@app.post("/internal/workflow/reviews/submit", response_model=DecisionResponse)
def submit_review(payload: ReviewPayload):
    # FIX: REVISE case was missing — caused KeyError crash in original
    decision_map = {
        "ACCEPT": "ACCEPTED",
        "REJECT": "REJECTED",
        "REVISE": "REVISION_REQUIRED",
    }
    suggested = decision_map.get(payload.recommendation)
    if not suggested:
        raise HTTPException(status_code=422, detail="Unknown recommendation value")

    return DecisionResponse(
        paperId=payload.paperId,
        suggestedStatus=suggested,
        message=f"Auto-decision: {payload.recommendation} based on score {payload.score}.",
    )
