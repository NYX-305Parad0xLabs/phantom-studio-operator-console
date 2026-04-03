import { create } from "zustand";

export type JobStatusState = {
  currentJobId?: string;
  status: "idle" | "running" | "queued";
  updatedAt: string;
  setJob: (jobId: string, status: JobStatusState["status"]) => void;
  reset: () => void;
};

export const useJobStatusStore = create<JobStatusState>((set) => ({
  currentJobId: undefined,
  status: "idle",
  updatedAt: new Date().toISOString(),
  setJob: (jobId, status) =>
    set({
      currentJobId: jobId,
      status,
      updatedAt: new Date().toISOString(),
    }),
  reset: () =>
    set({
      currentJobId: undefined,
      status: "idle",
      updatedAt: new Date().toISOString(),
    }),
}));
