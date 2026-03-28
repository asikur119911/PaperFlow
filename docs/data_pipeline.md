### SYSTEM DATA FLOW OVERVIEW

The CMS operates on a **Distributed Event-Driven Architecture**. The core backbone is an Event Bus (e.g., Kafka/RabbitMQ) decoupling services.

- **Synchronous Layer (REST/gRPC):** Used for direct client interactions (Command/Query), API Gateway routing, and inter-service calls requiring strong consistency (e.g., token validation).
    
- **Asynchronous Layer (Message Broker):** Used for side effects, domain event propagation, eventual consistency updates, and decoupled processing (notifications, analytics).
    
- **Data Lake/Warehouse:** Consumes events for reporting and audit logs.
    

***some definitions***
- gRPC - google's open source remote procedure call , used to connect microservices (synchronous )
- events - instead of directly calling another microservice we create an event which is placed in a pipe(this pipe's name is kafka , rabbitmq ) , and other microservices listen to this pipe.If anything important happens , they pick it up and work on it (asynchronous version of grpc)
---

### SERVICE DATA PIPELINE

#### 1. Identity & Access Management (IAM) Service

**Owned Data:** User Credentials, Global Profiles, System Roles (Admin), Refresh Tokens.

- **Inbound Data Sources:**
    
    - User Registration Forms (Client).
        
    - Login Requests (Client).
        
- **Outbound Data Targets:**
    
    - JWT Tokens (to Client).
        
    - `UserCreated` events (to Event Bus).
        
- **Synchronous Data Flow:**
    
    - **Inbound:** `POST /auth/login` (Authentication), `POST /auth/register`.
        
    - **Outbound:** None (Self-contained).
        
- **Asynchronous Events Produced:**
    
    - `UserRegistered` → Notification Service (Welcome Email), Conference Service (Author profile init).
        
    - `ProfileUpdated` → Conference Service (Update cached author details).
        
- **Asynchronous Events Consumed:**
    
    - None.
        
- **Storage Strategy:**
    
    - **DB:** Relational (PostgreSQL) for strict ACID compliance on credentials.
        
    - **Cache:** Redis for active session/token blocklisting.
        

#### 2. Conference Management Service

**Owned Data:** Conference Metadata, Venues, Important Dates, Chair/PC Chair Assignments, Conference-Specific Roles.

- **Inbound Data Sources:**
    
    - Chair Inputs (CFP creation).
        
    - Search Queries (Homepage).
        
- **Outbound Data Targets:**
    
    - Conference Public Details (to Client/Homepage).
        
- **Synchronous Data Flow:**
    
    - **Inbound:** `GET /conferences` (Public listing), `POST /conferences` (Create CFP).
        
    - **Outbound:** `gRPC GetUserContext` (to IAM) for validating Chair permissions.
        
- **Asynchronous Events Produced:**
    
    - `ConferenceCreated` → Payment Service (Setup billing accounts).
        
    - `ConferencePublished` → Notification Service (Alert interested users).
        
    - `DeadlineExtended` → Submission Service (Update validation rules), Review Service (Update review windows).
        
- **Asynchronous Events Consumed:**
    
    - `PaymentSuccess` (from Payment Service) → Activates Paid Conferences.
        
- **Storage Strategy:**
    
    - **DB:** Document Store (MongoDB) for flexible conference schemas and JSON-heavy configurations.
        
    - **Read Replica:** Elasticsearch for Homepage/Search module.
        

#### 3. Submission & Paper Service

**Owned Data:** Papers (Metadata), Abstracts, Authorship Links, File References (Blob Storage keys), Submission Status.

- **Inbound Data Sources:**
    
    - Author Submissions.
        
    - Paper Updates.
        
- **Outbound Data Targets:**
    
    - Paper Status (to Authors).
        
- **Synchronous Data Flow:**
    
    - **Inbound:** `POST /submissions`, `PUT /submissions/{id}`.
        
    - **Internal:** Calls Blob Storage (S3/MinIO) for file upload.
        
- **Asynchronous Events Produced:**
    
    - `PaperSubmitted` → Review Service (Initialize review slots), Notification Service (Ack email), Analytics.
        
    - `PaperUpdated` → Review Service (Invalidate old reviews if necessary).
        
    - `PaperWithdrawn` → Review Service (Cancel assignments).
        
- **Asynchronous Events Consumed:**
    
    - `ReviewDecisionMade` (from Review Service) → Updates status to Accepted/Rejected.
        
    - `DeadlineExtended` (from Conference Service) → Updates internal validation logic.
        
- **Storage Strategy:**
    
    - **DB:** Polyglot. PostgreSQL for metadata/relationships. Object Storage (S3) for PDF files.
        
    - **Consistency:** Eventual consistency for status updates via Review Service.
        

#### 4. Review & Assignment Service

**Owned Data:** Reviewer Pool, Assignments, Review Scores, Comments, Conflicts of Interest, Decisions.

- **Inbound Data Sources:**
    
    - Chair Assignments.
        
    - Reviewer Scores/Comments.
        
- **Outbound Data Targets:**
    
    - Review Reports.
        
- **Synchronous Data Flow:**
    
    - **Inbound:** `POST /reviews`, `POST /assignments`.
        
    - **Outbound:** `gRPC CheckConflict` (Internal logic or calls shared library).
        
- **Asynchronous Events Produced:**
    
    - `ReviewerAssigned` → Notification Service (Invite Reviewer).
        
    - `ReviewSubmitted` → Submission Service (Update progress), Analytics.
        
    - `DecisionFinalized` → Submission Service (Update paper status), Notification Service (Notify Author).
        
- **Asynchronous Events Consumed:**
    
    - `PaperSubmitted` (from Submission Service) → Creates "Unassigned" entry.
        
    - `UserRegistered` (from IAM) → Updates potential reviewer pool logic.
        
- **Storage Strategy:**
    
    - **DB:** Relational (PostgreSQL) for complex joins between Reviewers, Papers, and Scores.
        

#### 5. Notification & Messaging Service

**Owned Data:** Email Templates, Notification Logs, User Notification Preferences.

- **Inbound Data Sources:**
    
    - Events from ALL services.
        
- **Outbound Data Targets:**
    
    - SMTP Server / Push Notification Gateway.
        
- **Synchronous Data Flow:**
    
    - **Inbound:** `GET /notifications` (User inbox in UI).
        
- **Asynchronous Events Produced:**
    
    - `NotificationSent` → Analytics (Delivery tracking).
        
    - `NotificationFailed` → Ops Dashboard.
        
- **Asynchronous Events Consumed:**
    
    - `UserRegistered`, `PaperSubmitted`, `ReviewerAssigned`, `DecisionFinalized`, `PaymentSuccess`, `ConferencePublished`.
        
- **Storage Strategy:**
    
    - **DB:** NoSQL (Cassandra/DynamoDB) for high-write volume of logs.
        

#### 6. Payment & Billing Service

**Owned Data:** Invoices, Transaction Records, Payment Gateway References, Conference Fee Config.

- **Inbound Data Sources:**
    
    - Payment Gateways (Webhooks).
        
    - User Payment Initiations.
        
- **Outbound Data Targets:**
    
    - Receipts.
        
- **Synchronous Data Flow:**
    
    - **Inbound:** `POST /payments/initiate`.
        
    - **Outbound:** Calls Stripe/PayPal APIs.
        
- **Asynchronous Events Produced:**
    
    - `PaymentSuccess` → Conference Service (Activate), Submission Service (Unlock submission if paid).
        
    - `PaymentFailed` → Notification Service.
        
- **Asynchronous Events Consumed:**
    
    - `ConferenceCreated` → Creates billing ledger for the organizer.
        
- **Storage Strategy:**
    
    - **DB:** ACID-compliant Relational DB (PostgreSQL) with strict isolation levels.
        

---

### EVENT STREAM ARCHITECTURE

**Broker:** Kafka (High throughput) or RabbitMQ (Complex routing).

**Format:** CloudEvents (JSON).

|**Topic Name**|**Producer**|**Partition Key**|**Payload Example**|
|---|---|---|---|
|`cms.iam.users`|IAM|`user_id`|`{ event: "UserRegistered", userId: "u123", email: "..." }`|
|`cms.conf.lifecycle`|Conference|`conf_id`|`{ event: "ConferencePublished", confId: "c99", dates: {...} }`|
|`cms.paper.flow`|Submission|`paper_id`|`{ event: "PaperSubmitted", paperId: "p50", track: "AI", authorId: "u123" }`|
|`cms.review.ops`|Review|`paper_id`|`{ event: "ReviewerAssigned", reviewerId: "u55", paperId: "p50" }`|
|`cms.billing.tx`|Payment|`tx_id`|`{ event: "PaymentSuccess", amount: 100.00, refId: "c99", type: "ConferenceFee" }`|

---

### END-TO-END DATA FLOW SCENARIOS

#### Scenario 1: Paper Submission Flow

1. **User Action:** Author uploads PDF and metadata via Frontend.
    
2. **API Gateway:** Routes `POST /submissions` to **Submission Service**.
    
3. **Submission Service (Sync):**
    
    - Validates Deadline (Internal Cache or Sync call to Conference Service).
        
    - Uploads PDF to **Object Storage** (S3).
        
    - Saves metadata to **Submission DB** (Status: `RECEIVED`).
        
    - Returns `201 Created` to Client.
        
4. **Submission Service (Async):** Publishes `PaperSubmitted` event to `cms.paper.flow`.
    
5. **Consumers:**
    
    - **Notification Service:** Sends "Submission Received" email to Author.
        
    - **Review Service:** Creates a generic "Reviewable Item" entry in **Review DB**.
        
    - **Analytics Service:** Increments "Total Submissions" counter.
        

#### Scenario 2: Automatic Reviewer Assignment

1. **Trigger:** `PaperSubmitted` event received by **Review Service**.
    
2. **Review Service (Internal):**
    
    - Queries **Review DB** for Reviewer pool with matching "Research Area".
        
    - Checks "Conflict of Interest" (e.g., same institution, previous co-author).
        
    - Selects Reviewer (Algorithm).
        
    - Writes Assignment to **Review DB**.
        
3. **Review Service (Async):** Publishes `ReviewerAssigned` event to `cms.review.ops`.
    
4. **Consumers:**
    
    - **Notification Service:** Sends "Invitation to Review" email to the Reviewer.
        
    - **Paper Management Module (Aggregator):** Updates the Chair's dashboard view.
        

#### Scenario 3: Chair Decision (Accept/Reject)

1. **User Action:** Chair clicks "Accept" on Dashboard.
    
2. **API Gateway:** Routes `POST /decisions` to **Review Service**.
    
3. **Review Service (Sync):** Updates **Review DB** (Decision: `ACCEPT`). Returns `200 OK`.
    
4. **Review Service (Async):** Publishes `DecisionFinalized` event.
    
5. **Consumers:**
    
    - **Submission Service:** Updates Paper Status to `ACCEPTED`. Locks editing.
        
    - **Notification Service:** Queues "Acceptance Letter" email.
        
    - **Conference Service:** Updates "Accepted Papers" count for the conference stats.
        

---

### ANALYTICS & REPORTING PIPELINE

To support the "PC Chair" and "Chair" dashboards without querying microservices directly:

1. **Ingestion:** A **connector** (e.g., Kafka Connect) streams all events from `cms.*` topics.
    
2. **Processing:** Apache Flink or Spark Streaming aggregates data (e.g., "Reviews per Reviewer", "Submissions per Country").
    
3. **Storage (Data Warehouse):** Data is dumped into a Read-Optimized store (e.g., ClickHouse or Snowflake).
    
4. **Visualization:** The Frontend queries a dedicated **Analytics Service** (GraphQL) that reads solely from this warehouse, ensuring heavy reporting queries do not slow down operational microservices.
    

### FAILURE HANDLING & CONSISTENCY

1. **Idempotency:** All event consumers track `event_id` in a generic `processed_events` table to prevent duplicate processing (e.g., sending the same email twice).
    
2. **Retry Policy:** DLQ (Dead Letter Queue) implemented for Notification Service (if SMTP fails) and Payment Service (if Webhook fails).
    
3. **Saga Pattern:** Used for complex transactions like "Paid Conference Creation" (Create Conference -> Initiate Payment -> If Payment Fails -> Rollback/Hide Conference).