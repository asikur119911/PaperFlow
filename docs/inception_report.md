				





				   INCEPTION REPORT
					 Group 16 , Section C
					
				         Shadman Abid - 2105124 
				         Tousif Fahmeed Quadir - 2105127
				         Nusrat Jahan Tamanna - 2105140
				         Asikur Rahman - 2105144
				         Nusrat Jahan Nidhi - 2105168







1. Complex Engineering Problem Statement
Academic conferences  in Bangladesh relies heavily on expensive foreign softwares (like EasyChair) . The challenge is to design a national scale saas platform capable of serving multiple universities simultaneously .
The complexity lies in:
    • High-Concurrency & Availability: Handling  traffic spikes during submission deadlines without the server crashing.
    • Algorithmic Reviewer Matching: Developing an automated, conflict aware assignment system that  matches abstract keywords with reviewer expertise while  enforcing no same institution and no self referral conflict rules.
    • Synchronous vs. Asynchronous Orchestration: Managing long-running processes (plagiarism checks via Turnitin API, bulk email dispatch) without blocking the user interface or degrading the performance.
    • Data Sovereignty: Ensuring that data remains within secure, self controlled infrastructure rather than relying on shady public cloud providers.
2. Roles and Work Distribution
    • Team Lead :
        ◦  Design of the microservices architecture, database schema design  and infrastructure setup (Podman/Systemd).
    • Full Stack Developer (Backend Focus):
        ◦  Implementation of fast api  endpoints, integration of celery/redis for job queues, and development of the ML based reviewer matching and self referral prevention algorithm.
    • Full Stack Developer (Frontend Focus):
        ◦  Building the react (type script) dashboard, ensuring responsive design for mobile/desktop, and managing complex tasks of submission of papers.
    • QA and DevOps Engineer:
        ◦  Writing automated test suites (pytest) for conflict of interest logic, managing the jenkins CI/CD pipeline. 
3. Background and Market Study
    • Current Market Leader: EasyChair is the industry standard but charges significant fees in dollars. Also there is no integrated automatic check for plagiarism . Reviewer assignment based on expertise of the reviewers is absent as well.
    • Gap Analysis: If a reliable solution is provided for these problems stated above , with enough marketing , all the conferences hosted in any Bangladeshi universities can be hosted within our platform . Also , this service can be extended to international universities as a competitor to easy chair as well.
    • We plan to extend this . In the realm of research paper publishing industry , researchers pay a hefty amount to publish and students pay a hefty amount to read . With our conference management system we can develop another system as an extension of this , where , if the researchers make their paper open access they will have to pay the hosting costs  with a little bit revenue .But the students pay , after meeting the hosting costs and keeping a specific percentage for the profit , will be disbursed among the researchers based on paid user visit to their papers.
4. Overview of Solution Strategy and Technical Methods
    • Architecture: Load balanced cluster with separate application and database layers.
    • Frontend: React (TypeScript) for type-safe, robust user interfaces.
    • Backend: Python (FastAPI) chosen for its speed and native support for AI/ML libraries needed for AI/ML related tasks.
    • Database: PostgreSQL for implementing multi tenancy through row level security  to isolate conference data.
    • Async Processing: Celery + Redis to handle resource intensive tasks (plagiarism checks, email broadcasts) in the background.
    • Infrastructure: Podman (rootless containers) orchestrated via systemd on a server (DigitalOcean/Linode), utilizing nginx as a reverse proxy.
5. Comparison: Existing vs. Proposed Solution
Feature
EasyChair (Standard)
Proposed  Solution
Cost Model
High Fees (dollars)
Low  operational cost 
Hosting
Public cloud 
Self hosted high availability cluster
Reviewer Assignment
Basic keyword matching
ML based self referral checks + institutional conflict logic
Plagiarism Check
Totally manual . Even in paid services  , the papers have to be manually downloaded from website and uploaded on copy checkers.
Automatic integration (turnitin/copyleaks) with additional payment. 
Payments
International credit cards
Local integration (bkash, nagad)
Data Control
Vendor owned
Institution owned
6. Analysis of Economic and Environmental Impact
    • Economic Impact:
        ◦ Import Substitution: Reduces the outflow of foreign currency by replacing expensive foreign software  with a locally developed solution.
        ◦ Cost Efficiency: Self hosting architecture reduces infrastructure costs by ~70% compared to standard AWS/Cloud deployments (approx. $140/mo vs $450/mo).
    • Environmental Impact:
        ◦ Resource Optimization: Utilizing podman and lightweight Linux containers eliminates the resource overhead of heavy orchestration tools like kubernetes.
        ◦ Paperless Workflow: Fully digital submission, review process reduces paper waste.
7. Legal, Safety, and Ethical Considerations
    • Data Privacy (Safety): Implementation of strict tenant isolation ensures that a reviewer from conference A can never access unpublished data from conference B. All data in transit is encrypted via SSL/TLS.
    • Academic Integrity (Ethical):
        ◦ Plagiarism: Automated checks for plagiarism   ensure no intellectual property theft .
        ◦ Conflict of Interest: Algorithms are coded  to prevent self referrals and same institution reviews.
    • Accessibility (Social): The platform is designed to be accessible even on low-bandwidth networks common in some regions of Bangladesh.

8. Budget Plan & Hardware Costs
We will be hosting our services on Singapore based DigitalOcean servers
A. Initial Development Cost (One time):
    • Domain & SSL: $20
    • Dev Tools/Licenses: $100
B. Monthly Operational Costs (Recurring):
Component
Specification
Estimated Monthly Cost
Load Balancer
Traffic Distribution
$12
App Server Cluster
2x Nodes (4GB RAM each)
$48
Managed Database
PostgreSQL (HA)
$60
Storage & Cache
250GB Object Storage + Redis
$20
TOTAL

~$140 / month
C. Variable Costs:
    • Plagiarism API (Turnitin/Copyleaks): Passed directly to the user (Pay per scan model).

