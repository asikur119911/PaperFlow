export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options,
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  // ✅ SAFE PARSE
  const text = await res.text();

  if (!text) return undefined as T;

  return JSON.parse(text) as T;
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
  fullName: string;
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
  title: string;
  acronym: string;
  researchArea: string;
  startDate: string;
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
  title: string;
  abstract: string;
  authors: string[];
  track: string;
}

export interface SubmitPaperResponse {
  paperId: string;
  status: string;
}

export interface PaperSummary {
  id: string;
  title: string;
  status: string;
  conferenceId: string;
  conferenceTitle: string;
}

export interface ListPapersResponse {
  data: PaperSummary[];
  total: number;
}

export function listPapers(conferenceId?: string) {
  const qs = conferenceId ? `?conferenceId=${encodeURIComponent(conferenceId)}` : "";
  return request<ListPapersResponse>(`/paperflow/v1/papers${qs}`);
}

// export function submitPaper(body: SubmitPaperRequest) {
//   return request<SubmitPaperResponse>("/paperflow/v1/papers", {
//     method: "POST",
//     body: JSON.stringify(body)
//   });
// }
export async function submitPaper(formData: FormData) {
  console.log("📡 Sending request to backend...");

  for (const pair of formData.entries()) {
    console.log("➡️", pair[0], pair[1]);
  }

  const res = await fetch(`${API_BASE_URL}/paperflow/v1/papers/upload`, {
    method: "POST",
    body: formData
  });

  console.log("📥 Response status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.log("❌ Backend error:", text);
    throw new Error(text || "Failed to submit paper");
  }

  return res.json();
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


export interface UpdateProfileRequest {
  fullName: string;
  affiliation?: string;
  country?: string;
}

export interface UpdateProfileResponse {
  userId: string;
  status: string;
  message: string;
}

export function updateProfile(userId: string, body: UpdateProfileRequest) {
  return request<UpdateProfileResponse>(
    `/paperflow/v1/auth/profile?userId=${encodeURIComponent(userId)}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
}