import { Badge } from "@/components/ui/badge";
import { PageSection } from "@/components/page/PageSection";
import { PlaceholderContent } from "@/components/page/PlaceholderContent";

export default function Home() {
  return (
    <div className="space-y-6">
      <PageSection
        title="Dashboard"
        description="Live status across ingestion, clips, QA, and exports."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-paradox-gray-400">Active runs</p>
              <p className="text-3xl font-semibold text-white">12</p>
            </div>
            <Badge>Stable</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-paradox-gray-400">Pending reviews</p>
              <p className="text-3xl font-semibold text-white">4</p>
            </div>
            <Badge variant="accent">Alert</Badge>
          </div>
        </div>
      </PageSection>

      <div className="grid gap-4 lg:grid-cols-3">
        <PlaceholderContent highlight="One killer short">
          <p>Declare a clip-focus workflow, set durations, and style hints.</p>
          <p>Preview candidate scores once analysis completes.</p>
        </PlaceholderContent>
        <PlaceholderContent highlight="Series">
          <p>Draft up to three connected clips for episodic drops.</p>
          <p>Adjust translations, punch captions, and voice assets.</p>
        </PlaceholderContent>
        <PlaceholderContent highlight="Review & approvals">
          <p>Inspect captions, translations, voice, and lip-sync artifacts.</p>
          <p>Approve or request regeneration before export.</p>
        </PlaceholderContent>
      </div>
    </div>
  );
}
