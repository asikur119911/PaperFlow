export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  console.debug(`[api] ${options.method ?? "GET"} ${url}`);
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options,
    cache: "no-store"
  });

  if (!res.ok) {
    let message = "Request failed. Please try again.";
    try {
      const raw = await res.text();
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as {
            message?: string;
            error?: string;
            details?: string;
          };
          message =
            parsed.message ||
            parsed.error ||
            parsed.details ||
            message;
        } catch {
          if (!raw.trim().startsWith("<")) {
            message = raw.trim();
          }
        }
      }
    } catch {
      message = "Unable to reach server. Please try again.";
    }

    if (res.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }
    if (res.status === 404) {
      throw new Error("Requested resource was not found.");
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Auth

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  affiliation?: string;
  country?: string;
}

export interface RegisterResponse {
  userId: string;
  status: string;
  message: string;
}

export function registerUser(body: RegisterRequest) {
  return request<RegisterResponse>("/paperflow/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  email: string;
  roles: string[];
}

export function loginUser(body: LoginRequest) {
  return request<LoginResponse>("/paperflow/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

// Conferences

export interface ConferenceSummary {
  id: string;
  title: string;
  researchArea: string;
  bannerUrl?: string;
}

export interface ListConferencesResponse {
  data: ConferenceSummary[];
  meta: { total: number };
}

export function listConferences(params?: {
  status?: string;
  area?: string;
  page?: number;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.area) search.set("area", params.area);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));

  const qs = search.toString();
  const path =
    "/paperflow/v1/conferences" + (qs ? `?${qs}` : "");

  return request<ListConferencesResponse>(path);
}

export interface CreateConferenceRequest {
  chairId: string;
  title: string;
  acronym: string;
  researchArea: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  venue: string;
}

export interface CreateConferenceResponse {
  conferenceId: string;
  status: string;
}

export function createConference(body: CreateConferenceRequest) {
  return request<CreateConferenceResponse>("/paperflow/v1/conferences", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

// Papers

export interface SubmitPaperRequest {
  conferenceId: string;
  userId: string;
  title: string;
  abstract: string;
  authors: string[];
  researchArea: string;
}

export interface SubmitPaperResponse {
  paperId: string;
  status: string;
}

export interface PaperSummary {
  id: string;
  title: string;
  status: string;
  conference_name: string;
}

// get request
export interface ListIndividualPapersResponse {
  data: PaperSummary[];
  total: number;
}

export function listIndividualPapers(user_id :string){
  const userId=encodeURIComponent(user_id);
  return request<ListIndividualPapersResponse>(`/paperflow/v1/papers?userId=${userId}`);
}

//get request 
export interface ListConferencePapersResponse {
  data: PaperSummary[];
  total: number;
}
export function listConferenceAllPapers(conferenceId: string) {
  const qs = encodeURIComponent(conferenceId);
  return request<ListConferencePapersResponse>(`/paperflow/v1/papers?conferenceId=${qs}`);
}

export function submitPaper(body: SubmitPaperRequest) {
  return request<SubmitPaperResponse>("/paperflow/v1/papers", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

// Reviews & Assignments

export interface PendingReviewsResponse {
  assignments: {
    paperTitle: string;
    deadline: string;
    status: string;
    assignmentId: string;
  }[];
}

export function getPendingReviews(reviewerId: string) {
  const path = `/paperflow/v1/reviews/pending?reviewerId=${encodeURIComponent(
    reviewerId
  )}`;
  return request<PendingReviewsResponse>(path);
}

export interface SubmitReviewRequest {
  assignmentId: string;
  score: number;
  confidence: string;
  recommendation: "ACCEPT" | "REJECT" | "REVISE";
  comments?: string;
}

export interface SubmitReviewResponse {
  reviewId: string;
  status: string;
}

export function submitReview(body: SubmitReviewRequest) {
  return request<SubmitReviewResponse>("/paperflow/v1/reviews", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export interface InviteReviewersRequest {
  emails: string[];
}

export interface InviteReviewersResponse {
  conferenceId: string;
  invitedCount: number;
  invitedReviewerIds: string[];
  message: string;
}

export function inviteReviewers(conferenceId: string, body: InviteReviewersRequest) {
  return request<InviteReviewersResponse>(
    `/paperflow/v1/conferences/${encodeURIComponent(conferenceId)}/invite`,
    {
      method: "POST",
      body: JSON.stringify(body)
    }
  );
}

export interface AssignReviewersResponse {
  conferenceId: string;
  totalPapers: number;
  totalAssignmentsCreated: number;
  message: string;
}

export function assignReviewers(conferenceId: string) {
  return request<AssignReviewersResponse>(
    `/paperflow/v1/conferences/${encodeURIComponent(conferenceId)}/assign`,
    {
      method: "POST"
    }
  );
}

export interface AssignmentReviewerSummary {
  reviewerId: string;
  reviewerEmail: string;
  reviewerName: string;
}

export interface PaperAssignmentSummary {
  paperId: string;
  paperTitle: string;
  reviewers: AssignmentReviewerSummary[];
}

export interface ConferenceAssignmentsResponse {
  conferenceId: string;
  totalPapers: number;
  assignments: PaperAssignmentSummary[];
}

export function getAssignments(conferenceId: string) {
  return request<ConferenceAssignmentsResponse>(
    `/paperflow/v1/conferences/${encodeURIComponent(conferenceId)}/assignments`
  );
}

export interface ReviewerDashboardPaper {
  conferenceId: string;
  conferenceTitle: string;
  paperId: string;
  paperTitle: string;
}

export interface ReviewerDashboardResponse {
  reviewerId: string;
  papers: ReviewerDashboardPaper[];
}

export function getReviewerDashboard(userId: string) {
  return request<ReviewerDashboardResponse>(
    `/paperflow/v1/users/${encodeURIComponent(userId)}/reviewer-dashboard`
  );
}

