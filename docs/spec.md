
## Conference Management System (CMS)
**Module Documentation**


1. Registration Module
Purpose
The Registration Module enables any individual, irrespective of their intended role in the conference, to create and activate an account in the system.
Functionalities
    • Account Creation: Any user (author, reviewer, chair, or PC chair) must create an account to access the system.
    • Email Verification: Upon successful registration, the system sends a verification email to validate the user’s email address.
    • Automatic Redirection: After first-time registration and verification, the user is redirected directly to the system without requiring an additional login.

2. Profile Module
Purpose
The Profile Module maintains user identity, role-related information, and participation history across conferences.
Functionalities
    • Personal Information:
        ◦ Full name
        ◦ Email address (verified and non-editable)
        ◦ Affiliation / Institution
        ◦ Country
        ◦ Contact details (optional)
    • User History:
        ◦ Conferences created by the user
        ◦ Conferences participated in as an author
        ◦ Conferences participated in as a reviewer
    • Notifications:
        ◦ Invitations to act as Reviewer or PC Chair
        ◦ System alerts related to conferences and deadlines

3. Homepage Module
Purpose
The Homepage acts as the main dashboard and entry point after login.
Functionalities
    • Conference Banner: Displays an attractive virtual banner containing key conference information.
    • Ongoing and Upcoming Conferences: Lists currently active and future conferences.
    • Notification Panel: Shows invitations, announcements, and alerts.

4. Conference Module
Purpose
This module presents detailed information about individual conferences.
Functionalities
    • Conference name and description
    • Organizer details
    • Conference dates and important deadlines
    • Review period information
    • Option to join the conference as an author

5. Author / Submission Module
Purpose
The Author Module allows authors to submit and manage research papers.
Functionalities
    • Paper Submission:
        ◦ Paper title
        ◦ Author(s) name(s)
        ◦ Abstract
        ◦ Paper file upload
        ◦ Submission type (Single-blind / Double-blind)
    • Paper Status Tracking:
        ◦ Submitted for review
        ◦ Under review
        ◦ Accepted
        ◦ Rejected
    • Editing Policy:
        ◦ Paper editing is disabled once the review process begins.

6. Conference Creation (CFP Module)
Purpose
This module enables authorized users (Chair / PC Chair) to create and configure a conference.
Functionalities
    • Conference type
    • Conference title
    • Start date and submission deadline
    • Venue
    • Research area (e.g., Computer Science, Physics)
    • Organizer / Institution name
    • Contact information
    • Additional notes and instructions
    • Payment configuration (based on number of papers, if applicable)

7. Reviewer Module
Purpose
The Reviewer Module allows reviewers to view assigned papers and submit reviews.
Functionalities
    • Reviewed Papers:
        ◦ Conference name
        ◦ Paper title
        ◦ Review deadline
    • Unreviewed Papers:
        ◦ Conference name
        ◦ Paper title
        ◦ Review status

8. Review Module
Purpose
This module supports the peer-review process.
Functionalities
    • Abstract and full paper access
    • Author identity visibility based on submission type
        ◦ Visible in single-blind review
        ◦ Hidden in double-blind review
    • Review evaluation:
        ◦ Score
        ◦ Recommendation (Accept / Reject / Strong Accept / Strong Reject)
        ◦ Reviewer confidence level

9. Chair Module
Purpose
The Chair Module provides administrative control over the conference.
Submodules
    • Reviewer and PC Chair Invitation:
        ◦ Invite via email, username, or Google Scholar ID
        ◦ Bulk upload reviewers using Excel/CSV
        ◦ Track invitation acceptance status
    • Conference Editing:
        ◦ Extend submission or review deadlines
        ◦ Update conference title, venue, and dates
        ◦ Notify authors and reviewers via email
    • Paper Assignment:
        ◦ Manual assignment based on expertise
        ◦ Automatic assignment with conflict and expertise checks

10. PC Chair Module
Purpose
The PC Chair assists the Chair in managing reviews and reviewer coordination.
Functionalities
    • Monitor review progress
    • Coordinate reviewer assignments
    • Assist in decision-making processes

11. Paper Management Module
Purpose
This module tracks the relationship between papers and reviewers.
Functionalities
    • View paper title, assigned reviewer(s), and review status
    • View reviewer-wise paper assignments and progress

12. Reminder and Notification Module
Purpose
This module ensures timely communication with authors and reviewers.
Functionalities
    • Email templates for reminders
    • Automatic and manual email sending options
    • Reviewer-wise summary:
        ◦ Assigned papers
        ◦ Review status
        ◦ Number of pending reviews
    • Paper status notifications (Accepted / Rejected)

13. Backend Support Modules
Components
    • Payment Module: Supports free and paid conferences
    • Email Service: Handles all system-generated emails
    • Conflict Resolution Module: Detects conflicts of interest
    • Flagging Module: Allows reporting of issues or inconsistencies


