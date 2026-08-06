import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const getRoadmapProgress = (roadmap: any) => {
  const steps = roadmap?.steps || [];
  if (!steps.length) return 0;
  return Math.round((steps.filter((step: any) => step.completed).length / steps.length) * 100);
};

const ProgressSummary = ({ roadmap }) => {
  const progress = getRoadmapProgress(roadmap);

  return (
    <Card className="aiq-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="aiq-heading text-sm font-medium">{roadmap.title}</p>
            <p className="aiq-muted text-xs">{roadmap.subject}</p>
          </div>
          <span className="aiq-accent text-sm font-semibold">{progress}%</span>
        </div>
        <Progress value={progress} className="mt-3 h-2 bg-[color-mix(in_srgb,var(--theme-text)_10%,transparent)]" />
      </CardContent>
    </Card>
  );
};

export default ProgressSummary;
