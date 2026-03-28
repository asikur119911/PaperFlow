
## SERVICE: Identity & Access Management Service

API:

#### Name: Register User

Method: POST

Endpoint: /paperflow/v1/auth/register

Description: Creates a new user account (Author, Chair, or generic user). Triggers email verification workflow.

Request Body: { "email": "user@univ.edu", "password": "securePass123", "fullName": "Dr. John Doe", "affiliation": "BUET", "country": "Bangladesh" }

Response: { "userId": "uuid-123", "status": "PENDING_VERIFICATION", "message": "Verification email sent." }

Called By: User (Frontend)

Workflow Stage: Onboarding

Notes: Publishes 'user.registered' event to Notification Service.

***Name: Verify Email***

Method: POST

Endpoint: /paperflow/v1/auth/verify-email

Description: Validates the token sent via email to activate the account.

Request Body: { "token": "encrypted-verification-token" }

Response: { "status": "VERIFIED", "authToken": "jwt-token-xyz" }

Called By: User (Frontend via Email Link)

Workflow Stage: Onboarding

Notes: Auto-login after verification as per requirements.

### Name: Authenticate User (Login)

Method: POST

Endpoint: /paperflow/v1/auth/login

Description: Authenticates credentials and issues JWT with claims (roles, userId).

Request Body: { "email": "user@univ.edu", "password": "input-password" }

Response: { "accessToken": "jwt...", "refreshToken": "rt-token...", "expiresIn": 3600 }

Called By: User (Frontend)

Workflow Stage: Authentication

Notes: Supports standard OAuth2 flows if external providers are added later.

###  Name: Get User Profile

Method: GET

Endpoint: /paperflow/v1/users/{userId}/profile

Description: Retrieves profile details including immutable fields (email) and mutable contact info.

Request Body: N/A

Response: { "userId": "...", "fullName": "...", "email": "...", "affiliation": "...", "country": "...", "roles": ["AUTHOR", "REVIEWER","PC_CHAIR"] }

Called By: User (Frontend)

Workflow Stage: Dashboard Loading

Notes: Used to populate the "Profile Module".

### Name: Update User Profile

Method: PUT

Endpoint: /paperflow/v1/users/{userId}/profile

Description: Updates allowed fields (Affiliation, Contact, Country). Email is immutable.

Request Body: { "affiliation": "New Univ", "contact": "+88017..." }

Response: { "userId": "...", "updatedAt": "timestamp" }

Called By: User (Frontend)

Workflow Stage: Profile Management

Notes: N/A

### Name: Get User History

Method: GET

Endpoint: /paperflow/v1/users/{userId}/history

Description: Aggregates user participation (Conferences Created, Authored In, Reviewed For).

Request Body: N/A

Response: { "created": [{confId, title}], "authored": [{confId, paperId}], "reviewed": [{confId, paperId}] }

Called By: User (Frontend)

Workflow Stage: Profile Analysis

Notes: Likely aggregates data via internal calls to Conference/Submission services or uses cached event data.

### Name: Batch Get Users

Method: POST

Endpoint: /paperflow/v1/internal/users/batch

Description: Internal endpoint to resolve user details from a list of user IDs (e.g., for displaying Author names on a paper).

Request Body: { "userIds": ["uuid-1", "uuid-2"] }

Response: { "users": [ { "id": "uuid-1", "name": "...", "email": "..." } ] }

Called By: Conference Service, Submission Service, Review Service

Workflow Stage: Data Aggregation

Notes: Optimized for high-throughput resolution.

***what problem does it solve ?? 
### 1. Eliminates the "N+1" Network Problem

Without this API, if the **Submission Service** needs to display a list of 50 papers, and each paper has 3 authors, the system would have to make **150 separate HTTP calls** to the Identity Service to fetch names for every ID.

- **With this API:** The Submission Service collects all unique author IDs (e.g., 150 IDs), makes **one single POST request**, and receives all user details in a single response. This drastically reduces network latency and overhead.
    

### 2. Implementation of the "API Composition" Pattern

It acts as a data provider for the **API Gateway** or other services that need to aggregate data.

- **Scenario:** A Chair views the "All Papers" dashboard.
    
- **Step A:** The **Submission Service** fetches the list of papers. It sees `author_id: "uuid-1"` and `author_id: "uuid-2"`.
    
- **Step B:** The Submission Service (or the Gateway) calls `/paperflow/v1/internal/users/batch` with `["uuid-1", "uuid-2"]`.
    
- **Step C:** The **Identity Service** executes an optimized SQL query (e.g., `SELECT * FROM users WHERE id IN (...)`) and returns the map.
    
- **Step D:** The dashboard displays "Paper Title by **Dr. John Doe**" instead of "Paper Title by **uuid-1**".

### Name: Validate Token

Method: GET

Endpoint: /paperflow/v1/internal/auth/validate

Description: Internal hook for paperflow Gateway/Services to validate JWT signatures and permissions.

Request Body: Header: Authorization

Response: { "isValid": true, "claims": { "sub": "uuid", "roles": [...] } }

Called By: API Gateway / Other Services

Workflow Stage: Request Authorization

Notes: High-performance caching required.

---

## SERVICE: Conference Management Service

API:

### Name: Create Conference

Method: POST

Endpoint: /paperflow/v1/conferences

Description: Allows a Chair/PC Chair to initialize a new conference context.

Request Body: { "title": "ICSE 2026", "acronym": "ICSE26", "researchArea": "Computer Science", "startDate": "2026-10-10", "venue": "Dhaka" }

Response: { "conferenceId": "conf-uuid", "status": "DRAFT" }

Called By: User (Chair)

Workflow Stage: Conference Setup

Notes: Creator is automatically assigned 'CHAIR' role for this conference scope.

### Name: Update Conference Configuration

Method: PUT

Endpoint: /paperflow/v1/conferences/{conferenceId}

Description: Updates critical details, payment config, and deadlines.

Request Body: { "submissionDeadline": "2026-08-01", "paymentConfig": { "currency": "USD", "amount": 100 }, "instructions": "..." }

Response: { "conferenceId": "...", "status": "UPDATED" }

Called By: User (Chair)

Workflow Stage: Conference Management

Notes: Triggers notifications if deadlines are extended.

### Name: List Conferences (Homepage)

Method: GET

Endpoint: /paperflow/v1/conferences

Description: Public listing of active/upcoming conferences with filtering.

Request Body: Query Params: ?status=OPEN&area=CS&page=1&limit=20

Response: { "data": [ { "id": "...", "title": "...", "bannerUrl": "..." } ], "meta": { "total": 50 } }

Called By: User (Public/Guest)

Workflow Stage: Discovery

Notes: Serves the "Homepage Module" banner and list.

### Name: Get Conference Details

Method: GET

Endpoint: /paperflow/v1/conferences/{conferenceId}

Description: Detailed view of a specific conference (Deadlines, Organizers, Tracks).

Request Body: N/A

Response: { "title": "...", "organizers": [...], "deadlines": {...}, "submissionType": "DOUBLE_BLIND" }

Called By: User (Author/Reviewer)

Workflow Stage: Conference Landing

Notes: N/A

### Name: Invite Reviewers/PC Chairs

Method: POST

Endpoint: /paperflow/v1/conferences/{conferenceId}/invitations

Description: Sends invites to users to join as Reviewer or PC Chair.

Request Body: { "role": "REVIEWER", "candidates": [ { "email": "a@b.com" }, { "userId": "uuid-5" } ] }

Response: { "invitedCount": 2, "failed": [] }

Called By: User (Chair)

Workflow Stage: Team Building

Notes: Supports manual entry or results from Bulk Upload. Publishes 'invitation.created' event.

### Name: Bulk Upload Reviewers

Method: POST

Endpoint: /paperflow/v1/conferences/{conferenceId}/reviewers/import

Description: Parses CSV/Excel file to bulk invite reviewers.

Request Body: Multipart/form-data (File: reviewers.csv)

Response: { "processed": 100, "errors": ["Row 5: Invalid Email"] }

Called By: User (Chair)

Workflow Stage: Team Building

Notes: Processes file, validates, and triggers the Invitation API internally.

### Name: Check Conference Status

Method: GET

Endpoint: /paperflow/v1/internal/conferences/{conferenceId}/status

Description: Internal check to validate if a conference is accepting submissions/reviews.

Request Body: N/A

Response: { "isOpen": true, "stage": "SUBMISSION", "isBlind": true }

Called By: Submission Service, Review Service

Workflow Stage: Validation

Notes: Critical for enforcing business logic (e.g., stopping edits after deadline).

---

## SERVICE: Submission & Paper Service

API:

### Name: Submit Paper

Method: POST

Endpoint: /paperflow/v1/papers

Description: Creates a new paper submission record.

Request Body: { "conferenceId": "conf-uuid", "title": "AI in 2026", "abstract": "...", "authors": [...], "track": "ML" }

Response: { "paperId": "paper-uuid", "status": "SUBMITTED" }

Called By: User (Author)

Workflow Stage: Submission

Notes: Validates conference submission deadline via Conference Service.

### Name: Upload Manuscript

Method: POST

Endpoint: /paperflow/v1/papers/{paperId}/files

Description: Uploads the PDF/Docx file for the paper.

Request Body: Multipart/form-data (File)

Response: { "fileUrl": "s3://...", "uploadedAt": "timestamp" }

Called By: User (Author)

Workflow Stage: Submission

Notes: Virus scan hook recommended.

### Name: Download Manuscript

Method: GET

Endpoint: /paperflow/v1/papers/{paperId}/download

Description: downloads the PDF/Docx file for the paper with watermarked downloaded from "abc" conference 

Request: { "fileUrl": "s3://...", "uploadedAt": "timestamp" }

Response  Body: Multipart/form-data (File)

Called By: PC chair 

Workflow Stage:manual plagiarism check 

Notes: the watermark is needed , else what if the pc chair downloads the paper and publishes as his own ? 

### Name: Get Paper Details

Method: GET

Endpoint: /paperflow/v1/papers/{paperId}

Description: Retrieves paper info. Sanitizes author info if requester is a Reviewer and conference is Double-Blind.

Request Body: N/A

Response: { "title": "...", "abstract": "...", "fileUrl": "...", "authors": [HIDDEN_IF_BLIND] }

Called By: User (Author/Reviewer/Chair)

Workflow Stage: Review/Management

Notes: Logic: If (Requester == Reviewer AND Conf == DoubleBlind) -> Mask Authors.

### Name: List Papers

Method: GET

Endpoint: /paperflow/v1/papers

Description: Lists papers based on context (My Papers for Author, All Papers for Chair).

Request Body: Query Params: ?conferenceId=...&authorId=...&status=UNDER_REVIEW

Response: { "papers": [...] }

Called By: User (Author/Chair)

Workflow Stage: Dashboard

Notes: Chair sees all; Author sees only own.

### Name: Update Paper

Method: PUT

Endpoint: /paperflow/v1/papers/{paperId}

Description: Updates title, abstract, or authors.

Request Body: { "title": "New Title", "abstract": "Updated..." }

Response: { "status": "UPDATED" }

Called By: User (Author)

Workflow Stage: Submission Refinement

Notes: BLOCKED if Conference Service returns status "REVIEW_STARTED".

### Name: Withdraw Paper

Method: POST

Endpoint: /paperflow/v1/papers/{paperId}/withdraw

Description: Author withdraws paper before decision.

Request Body: { "reason": "Conflict found" }

Response: { "status": "WITHDRAWN" }

Called By: User (Author)

Workflow Stage: Pre-Decision

Notes: N/A

### Name: Update Paper Status (Decision)

Method: PATCH

Endpoint: /paperflow/v1/papers/{paperId}/status

Description: Chair finalizes decision (Accept/Reject).

Request Body: { "status": "ACCEPTED", "comments": "Congratulations..." }

Response: { "paperId": "...", "newStatus": "ACCEPTED" }

Called By: User (Chair)

Workflow Stage: Decision Making

Notes: Triggers Notification Service (Acceptance/Rejection Email).


---

## SERVICE: Review & Assignment Service

API:

### Name: Auto-Assign Reviewers

Method: POST

Endpoint: /paperflow/v1/assignments/auto

Description: Triggers algorithm to match papers to reviewers based on domain/expertise conflicts.

Request Body: { "conferenceId": "conf-uuid", "algorithm": "TPMS", "maxPapersPerReviewer": 5 }

Response: { "jobId": "job-123", "status": "PROCESSING" }

Called By: User (Chair)

Workflow Stage: Assignment

Notes: Long-running async process.

### Name: Manual Assignment

Method: POST

Endpoint: /paperflow/v1/assignments

Description: Manually links a reviewer to a paper.

Request Body: { "paperId": "paper-uuid", "reviewerId": "user-uuid" }

Response: { "assignmentId": "assign-uuid", "status": "ASSIGNED" }

Called By: User (Chair)

Workflow Stage: Assignment

Notes: Checks Conflict of Interest (COI) before assigning.

### Name: Submit Review

Method: POST

Endpoint: /paperflow/v1/reviews

Description: Reviewer submits score and recommendation.

Request Body: { "assignmentId": "...", "score": 8, "confidence": "HIGH", "recommendation": "ACCEPT", "comments": "..." }

Response: { "reviewId": "...", "status": "SUBMITTED" }

Called By: User (Reviewer)

Workflow Stage: Reviewing

Notes: Validates if review deadline is active.

### Name: Get Pending Reviews

Method: GET

Endpoint: /paperflow/v1/reviews/pending

Description: Dashboard for reviewers to see assigned work.

Request Body: Query Params: ?reviewerId=...

Response: { "assignments": [ { "paperTitle": "...", "deadline": "...", "status": "PENDING" } ] }

Called By: User (Reviewer)

Workflow Stage: Dashboard

Notes: N/A

### Name: Get Paper Reviews

Method: GET

Endpoint: /paperflow/v1/papers/{paperId}/reviews

Description: Aggregates all reviews for a specific paper.

Request Body: N/A

Response: { "reviews": [ { "score": 8, "rec": "ACCEPT", "reviewerId": "MASKED" } ] }

Called By: User (Chair/Author)

Workflow Stage: Decision/Feedback

Notes: Author only sees this AFTER decision is released. Reviewer IDs masked for Author.

### Name: Declare Conflict of Interest

Method: POST

Endpoint: /paperflow/v1/conflicts

Description: Reviewer or Author declares COI to prevent assignment.

Request Body: { "paperId": "...", "reason": "Institutional" }

Response: { "status": "RECORDED" }

Called By: User (Reviewer/Author)

Workflow Stage: Assignment Prep

Notes: Used by the Auto-Assign algorithm.


### note :  checking for plagiarism or flagging self referrals are background tasks 
---

## SERVICE: Notification & Messaging Service

API:

### Name: Send Email (System)

Method: POST

Endpoint: /paperflow/v1/internal/notifications/email

Description: Generic internal endpoint for sending transactional emails.

Request Body: { "to": "user@email.com", "template": "VERIFY_EMAIL", "data": { "name": "John", "link": "..." } }

Response: { "messageId": "msg-123" }

Called By: All Services (Internal)

Workflow Stage: Communication

Notes: Handles Verification, Ack, Decisions.

### Name: Get User Notifications

Method: GET

Endpoint: /paperflow/v1/notifications

Description: User in-app notification feed (Bell icon).

Request Body: Query Params: ?userId=...&read=false

Response: { "notifications": [ { "id": "...", "message": "Paper assigned", "type": "ALERT" } ] }

Called By: User (Frontend)

Workflow Stage: Dashboard

Notes: N/A

### Name: Mark Notification Read

Method: PATCH

Endpoint: /paperflow/v1/notifications/{id}/read

Description: Updates read status.

Request Body: N/A

Response: { "status": "READ" }

Called By: User (Frontend)

Workflow Stage: Dashboard

Notes: N/A

### Name: Send Bulk Reminders

Method: POST

Endpoint: /paperflow/v1/notifications/reminders

Description: Chair triggers reminders to Reviewers with pending tasks.

Request Body: { "conferenceId": "...", "targetGroup": "PENDING_REVIEWERS", "templateId": "REMINDER_1" }

Response: { "recipientCount": 45, "status": "QUEUED" }

Called By: User (Chair)

Workflow Stage: Monitoring

Notes: "Reviewer-wise summary" logic is calculated here or in Review Service and passed as data.

### Name: Invitation Response Handler

Method: POST

Endpoint: /paperflow/v1/notifications/invitations/{inviteId}/respond

Description: Handles user clicking "Accept/Decline" on an invitation email.

Request Body: { "response": "ACCEPT" }

Response: { "status": "UPDATED" }

Called By: User (Frontend via Email)

Workflow Stage: Team Building

Notes: If ACCEPT, triggers callback to Conference Service to add role.

---

### SERVICE: Payment & Billing Service

API:

### Name: Configure Conference Fees

Method: POST

Endpoint: /paperflow/v1/payments/config

Description: Sets fee structure (Early bird, Regular, Author fee).

Request Body: { "conferenceId": "...", "currency": "USD", "items": [{ "type": "AUTHOR_REG", "amount": 500 }] }

Response: { "configId": "..." }

Called By: User (Chair)

Workflow Stage: Conference Setup

Notes: N/A

### Name: Create Payment Intent

Method: POST

Endpoint: /paperflow/v1/payments/intent

Description: Initiates a transaction (e.g., Stripe/PayPal intent).

Request Body: { "conferenceId": "...", "userId": "...", "itemType": "AUTHOR_REG" }

Response: { "clientSecret": "...", "transactionId": "tx-pending" }

Called By: User (Author/Attendee)

Workflow Stage: Registration

Notes: Returns data needed by Frontend payment SDK.

### Name: Payment Webhook

Method: POST

Endpoint: /paperflow/v1/webhooks/payment-provider

Description: Receives asynchronous success/failure signal from Gateway (Stripe/PayPal).

Request Body: Provider specific JSON

Response: 200 OK

Called By: External Payment Gateway

Workflow Stage: Processing

Notes: Updates local transaction status to PAID. Triggers Receipt Email.

### Name: Get Invoice/Receipt

Method: GET

Endpoint: /paperflow/v1/payments/transactions/{transactionId}/invoice

Description: Generates PDF invoice for the user.

Request Body: N/A

Response: Binary PDF

Called By: User (Author)

Workflow Stage: Post-Payment

Notes: N/A

### Name: Verify Payment Status

Method: GET

Endpoint: /paperflow/v1/internal/payments/status

Description: Internal check to see if an author has paid before allowing final paper upload (Camera Ready).

Request Body: Query Params: ?userId=...&conferenceId=...

Response: { "isPaid": true, "transactionId": "..." }

Called By: Submission Service / Conference Service


Workflow Stage: Final Submission

Notes: Gatekeeper API.