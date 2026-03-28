# Paperflow CMS Hello-World Prototype

Minimal end-to-end prototype of the Paperflow Conference Management System (CMS), using:

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Core Backend**: Spring Boot (H2 in-memory DB)
- **Workflow Helper**: FastAPI (review decision helper)

This prototype demonstrates the core workflow:

1. User registers
2. User (Chair) creates a conference
3. Author submits a paper to the conference
4. Chair assigns a reviewer
5. Reviewer submits a review
6. FastAPI suggests a paper decision
7. UI reflects updated paper status

---

## 1. Backend Setup

### 1.1 FastAPI (workflow helper)

**Directory**: `workflow-fastapi/`

```bash
cd workflow-fastapi
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Defaults:

- Port: `8001`
- Base URL (for Spring): `http://localhost:8001`

---

### 1.2 Spring Boot (core CMS service)

**Directory**: `backend-spring/`

Requirements:

- Java 17+
- Maven wrapper (`./mvnw`) is included via Spring Boot tooling

Run:

```bash
cd backend-spring
FASTAPI_BASE_URL=http://localhost:8001 ./mvnw spring-boot:run
```

Defaults:

- Port: `8080`
- DB: H2 in-memory
- Base API URL: `http://localhost:8080/paperflow/v1/...`

Environment:

- `FASTAPI_BASE_URL` (optional, defaults to `http://localhost:8001`):
  - Used by Spring to call the FastAPI helper at `/internal/workflow/reviews/submit`.

---

## 2. Frontend Setup (Next.js + Tailwind)

**Directory**: `frontend/`

Requirements:

- Node.js 18+

Install dependencies:

```bash
cd frontend
npm install
```

Environment:

Create `.env.local` in `frontend/`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Run the dev server:

```bash
npm run dev
```

Defaults:

- Port: `3000`
- App URL: `http://localhost:3000`

Tailwind CSS is already wired via:

- `tailwind.config.ts`
- `postcss.config.mjs`
- `styles/globals.css`

---

## 3. Local Service Communication

Ports and URLs:

- **Spring Boot**: `http://localhost:8080`
  - Public APIs:
    - `POST /paperflow/v1/auth/register`
    - `POST /paperflow/v1/auth/login`
    - `GET  /paperflow/v1/conferences`
    - `POST /paperflow/v1/conferences`
    - `POST /paperflow/v1/papers`
    - `POST /paperflow/v1/assignments`
    - `GET  /paperflow/v1/reviews/pending`
    - `POST /paperflow/v1/reviews`
- **FastAPI**: `http://localhost:8001`
  - Internal-only (Spring → FastAPI):
    - `POST /internal/workflow/reviews/submit`
- **Next.js**: `http://localhost:3000`
  - Uses `NEXT_PUBLIC_API_BASE_URL` to call Spring, e.g.:
    - `http://localhost:8080/paperflow/v1/auth/register`
    - `http://localhost:8080/paperflow/v1/conferences`
    - `http://localhost:8080/paperflow/v1/papers`

---

## 4. End-to-End Testing Workflow

Make sure all three services are running:

1. FastAPI:

   ```bash
   cd workflow-fastapi
   source .venv/bin/activate
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

2. Spring Boot:

   ```bash
   cd backend-spring
   FASTAPI_BASE_URL=http://localhost:8001 ./mvnw spring-boot:run
   ```

3. Next.js:

   ```bash
   cd frontend
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 npm run dev
   ```

Then follow this flow in the browser (`http://localhost:3000`):

### Step 1: Register users

1. Open `http://localhost:3000/auth/signup`.
2. Create three accounts:
   - Chair: `chair@univ.edu` (backend auto-assigns `CHAIR` role).
   - Reviewer: `reviewer@univ.edu` (backend auto-assigns `REVIEWER` role).
   - Author: e.g. `author@univ.edu` (backend treats as `AUTHOR`).

Users are stored in the Spring Boot H2 database via:

- `POST /paperflow/v1/auth/register`

### Step 2: Chair creates a conference

1. (For prototype, just assume you’re acting as the Chair user.)
2. Navigate to `Conferences` → `Create conference` or open:
   - `http://localhost:3000/conferences/new`
3. Fill in:
   - Title, Acronym, Research Area, Start Date, Venue.
4. Submit.

Frontend calls:

- `POST /paperflow/v1/conferences`

Spring Boot saves a `Conference` entity in H2 and returns:

```json
{ "conferenceId": "conf-...", "status": "DRAFT" }
```

You can see it via:

- `http://localhost:3000/conferences` → `GET /paperflow/v1/conferences`

### Step 3: Author submits a paper

1. Simulate logging in as the Author.
2. Navigate to the submission page for a conference:
   - `http://localhost:3000/conferences/<conferenceId>/submit`
3. Fill in Title, Abstract, Track and submit.

Frontend calls:

- `POST /paperflow/v1/papers` with:

```json
{
  "conferenceId": "conf-...",
  "title": "AI in 2026",
  "abstract": "Short abstract...",
  "authors": [],
  "track": "ML"
}
```

Spring Boot stores a `Paper` linked to the `Conference` (status `SUBMITTED`).

### Step 4: Chair assigns a reviewer

1. As Chair, choose a `paperId` and `reviewerId` (for now, via API client or a small temporary UI).
2. Call:

```http
POST /paperflow/v1/assignments
Content-Type: application/json

{
  "paperId": "<paperId>",
  "reviewerId": "<reviewerId>"
}
```

Spring Boot:

- Creates an `Assignment` with status `ASSIGNED`.

### Step 5: Reviewer sees assignment

1. Navigate to the reviewer dashboard:
   - `http://localhost:3000/reviewer`
2. The frontend calls:

```http
GET /paperflow/v1/reviews/pending?reviewerId=<reviewerId>
```

Spring Boot returns assignments; the UI shows them as cards with a **Review** button.

### Step 6: Reviewer submits review (Spring → FastAPI)

1. Click **Review** on an assignment:
   - Opens `http://localhost:3000/reviewer/assignments/<assignmentId>`
2. Fill in Score, Confidence, Recommendation, Comments, then submit.

Frontend calls:

```http
POST /paperflow/v1/reviews
Content-Type: application/json

{
  "assignmentId": "<assignmentId>",
  "score": 8,
  "confidence": "HIGH",
  "recommendation": "ACCEPT",
  "comments": "Solid work."
}
```

Spring Boot:

1. Saves a `Review` and marks `Assignment` as `REVIEW_SUBMITTED`.
2. Calls FastAPI:

   ```http
   POST http://localhost:8001/internal/workflow/reviews/submit
   Content-Type: application/json

   {
     "assignmentId": "<assignmentId>",
     "paperId": "<paperId>",
     "conferenceId": "<conferenceId>",
     "reviewerId": "<reviewerId>",
     "score": 8,
     "confidence": "HIGH",
     "recommendation": "ACCEPT",
     "comments": "Solid work."
   }
   ```

3. FastAPI responds with:

   ```json
   {
     "paperId": "<paperId>",
     "suggestedStatus": "ACCEPTED",
     "message": "Auto-decision: ACCEPT based on score 8."
   }
   ```

4. Spring Boot updates the `Paper` status in H2 to `ACCEPTED` (or `REJECTED`).

### Step 7: Verify updated status in UI

You can verify the decision via:

- Listing conferences/papers (once you add a paper list UI), or
- Inspecting the H2 console if enabled.

The important part of this hello-world is that:

- Review submission from the UI triggers:
  - Spring Boot DB writes
  - A call to FastAPI
  - A status update on the `Paper` entity

You now have a fully runnable, locally testable CMS prototype with all major modules interconnected.

