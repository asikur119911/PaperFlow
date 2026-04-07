export type MockPaperAssignment = {
  id: string;
  title: string;
  assignedCount: number;
  reviewers: string[];
};

export type ConferenceAssignmentState = {
  conferenceId: string;
  totalInvitationsAccepted: number;
  papers: MockPaperAssignment[];
};

const assignmentStore = new Map<string, ConferenceAssignmentState>();

function createDefaultState(conferenceId: string): ConferenceAssignmentState {
  return {
    conferenceId,
    totalInvitationsAccepted: 15,
    papers: [
      {
        id: `${conferenceId}-paper-1`,
        title: "Improving Transformer Robustness for Low-Resource Languages",
        assignedCount: 0,
        reviewers: [],
      },
      {
        id: `${conferenceId}-paper-2`,
        title: "Graph Neural Routing for Adaptive Traffic Optimization",
        assignedCount: 0,
        reviewers: [],
      },
      {
        id: `${conferenceId}-paper-3`,
        title: "Privacy-Preserving Federated Learning in Clinical AI",
        assignedCount: 0,
        reviewers: [],
      },
    ],
  };
}

export function getConferenceAssignmentState(
  conferenceId: string
): ConferenceAssignmentState {
  const existing = assignmentStore.get(conferenceId);
  if (existing) {
    return {
      ...existing,
      papers: existing.papers.map((paper) => ({ ...paper })),
    };
  }

  const created = createDefaultState(conferenceId);
  assignmentStore.set(conferenceId, created);
  return {
    ...created,
    papers: created.papers.map((paper) => ({ ...paper })),
  };
}

export function assignReviewerToPaper(
  conferenceId: string,
  paperId: string,
  reviewerEmail: string
) {
  const state = getConferenceAssignmentState(conferenceId);
  const updatedPapers = state.papers.map((paper) =>
    paper.id === paperId
      ? {
          ...paper,
          assignedCount: paper.assignedCount + 1,
          reviewers: [...paper.reviewers, reviewerEmail],
        }
      : paper
  );
  const updatedState: ConferenceAssignmentState = {
    ...state,
    papers: updatedPapers,
  };
  assignmentStore.set(conferenceId, updatedState);
  return getConferenceAssignmentState(conferenceId);
}

export function autoAssignAllPapers(conferenceId: string) {
  const state = getConferenceAssignmentState(conferenceId);
  const updatedState: ConferenceAssignmentState = {
    ...state,
    papers: state.papers.map((paper, index) => {
      const mockEmail = `auto.reviewer${paper.assignedCount + 1}.${index + 1}@example.com`;
      return {
        ...paper,
        assignedCount: paper.assignedCount + 1,
        reviewers: [...paper.reviewers, mockEmail],
      };
    }),
  };
  assignmentStore.set(conferenceId, updatedState);
  return getConferenceAssignmentState(conferenceId);
}
