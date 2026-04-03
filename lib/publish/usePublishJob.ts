import { useQuery } from "@tanstack/react-query";

import { ControlPlaneClient, type PublishJobDetail } from "@/lib/api/controlPlane";
import { defaultPublishJobId, integrationMode } from "@/lib/config";
import { mockPublishJob } from "@/lib/publish/mock";

const fallbackJob: PublishJobDetail = {
  id: Number(mockPublishJob.id) || 0,
  status: mockPublishJob.status,
  scheduled_for: mockPublishJob.schedule,
  attempts: mockPublishJob.attempts.map((attempt, index) => ({
    id: index,
    status: attempt.status,
    attempted_at: attempt.timestamp,
    detail: attempt.detail,
  })),
};

export function usePublishJobData() {
  const jobId = defaultPublishJobId;
  const query = useQuery({
    queryKey: ["publish-job", jobId],
    queryFn: () => ControlPlaneClient.fetchPublishJob(jobId),
    enabled: jobId > 0,
    staleTime: 15_000,
  });

  const usesLive = integrationMode === "live" && jobId > 0 && !query.isError;
  const job = usesLive ? query.data ?? fallbackJob : fallbackJob;

  return { job, isMock: !usesLive, isLoading: query.isLoading };
}
