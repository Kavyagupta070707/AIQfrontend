import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Lock, Play, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/study/PageHeader";
import { getRoadmapProgress } from "@/components/study/ProgressSummary";
import { studyApi } from "@/lib/api";

const isStepUnlocked = (steps: any[], index: number) => {
  if (index === 0) return true;
  return steps.slice(0, index).every((step: any) => step.completed);
};

const RoadmapDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<any>(null);

  useEffect(() => {
    if (id) studyApi.getRoadmap(id).then((res) => setRoadmap(res.data)).catch(() => navigate("/roadmaps"));
  }, [id, navigate]);

  const openStep = (index: number) => {
    if (!isStepUnlocked(roadmap.steps, index)) {
      toast.warning("Complete the previous day before opening this study section.");
      return;
    }
    navigate(`/roadmaps/${roadmap._id}/steps/${index}`);
  };

  if (!roadmap) return <p className="aiq-muted text-sm">Loading roadmap...</p>;
  const progress = getRoadmapProgress(roadmap);
  const currentIndex = roadmap.steps.findIndex((step: any) => !step.completed);
  const rowHeight = 156;
  const mapHeight = Math.max(roadmap.steps.length * rowHeight + 32, 360);

  return (
    <div>
      <PageHeader
        title={roadmap.title}
        description={roadmap.overview || "Follow the path one day at a time. Each day unlocks after the previous one is complete."}
        action={
          <Button onClick={() => navigate("/roadmaps/create")} variant="outline" className="aiq-button-soft">
            New Roadmap
          </Button>
        }
      />

      <Card className="aiq-card mb-6">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="aiq-heading text-sm font-medium">{roadmap.subject}</p>
              <p className="aiq-muted text-xs">{roadmap.level} • {roadmap.duration || "Flexible"} • {roadmap.dailyStudyTime || "Flexible time"}</p>
            </div>
            <span className="aiq-chip rounded-md border px-3 py-1 text-sm font-semibold">{progress}% complete</span>
          </div>
          <Progress value={progress} className="mt-4 h-2 bg-[color-mix(in_srgb,var(--theme-text)_10%,transparent)]" />
        </CardContent>
      </Card>

      <div className="relative overflow-hidden rounded-2xl bg-[#111418] px-4 py-10 shadow-2xl shadow-black/25">
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:54px_54px]" />

        <div className="relative mx-auto hidden max-w-5xl md:block" style={{ height: mapHeight }}>
          <div className="absolute left-1/2 top-7 h-[calc(100%-56px)] -translate-x-1/2 border-l-2 border-dashed border-slate-600" />

          {roadmap.steps.map((step: any, index: number) => {
            const unlocked = isStepUnlocked(roadmap.steps, index);
            const completed = step.completed;
            const isCurrent = index === currentIndex || (currentIndex === -1 && index === roadmap.steps.length - 1);
            const alignRight = index % 2 === 1;
            const top = index * rowHeight;

            return (
              <div key={step._id || index} className="absolute left-0 w-full" style={{ top }}>
                <div
                  className={`absolute top-[58px] h-0 w-[60px] border-t-2 border-dashed ${
                    completed ? "border-teal-400" : "border-slate-600"
                  }`}
                  style={{ left: alignRight ? "calc(50% + 28px)" : "calc(50% - 88px)" }}
                />

                <button
                  onClick={() => openStep(index)}
                  className={`absolute left-1/2 top-[30px] z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 shadow-lg transition hover:scale-105 ${
                    completed
                      ? "border-teal-300 bg-teal-500 text-white"
                      : unlocked
                        ? "border-rose-200 bg-rose-500 text-white"
                        : "border-slate-700 bg-slate-800 text-slate-400"
                  } ${isCurrent && unlocked ? "ring-4 ring-amber-300/30" : ""}`}
                  aria-label={`Open day ${index + 1}`}
                >
                  {completed ? <CheckCircle2 className="h-7 w-7" /> : unlocked ? <Play className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                </button>

                <button
                  onClick={() => openStep(index)}
                  className={`group absolute z-10 flex min-h-[116px] w-[360px] items-center gap-4 rounded-2xl border p-5 text-left shadow-xl transition hover:-translate-y-0.5 ${
                    completed
                      ? "border-teal-400/50 bg-teal-500/15 text-teal-50"
                      : unlocked
                        ? "border-rose-400/40 bg-rose-500/20 text-rose-50"
                        : "border-slate-600 bg-slate-800/80 text-slate-400"
                  } ${isCurrent && unlocked ? "ring-4 ring-rose-400/20" : ""}`}
                  style={{ left: alignRight ? "calc(50% + 88px)" : "calc(50% - 448px)" }}
                >
                  <span className="min-w-0">
                    <span className="inline-flex rounded-full bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-normal opacity-90">Day {index + 1}</span>
                    <span className="mt-1 block text-lg font-semibold leading-6">{step.title}</span>
                    <span className="mt-1 line-clamp-2 block text-xs opacity-75">{step.description}</span>
                  </span>
                </button>

                {isCurrent && unlocked && !completed && (
                  <span className="absolute left-1/2 top-0 z-30 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950">
                    Next
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative flex flex-col gap-5 md:hidden">
          {roadmap.steps.map((step: any, index: number) => {
            const unlocked = isStepUnlocked(roadmap.steps, index);
            const completed = step.completed;
            const isCurrent = index === currentIndex || (currentIndex === -1 && index === roadmap.steps.length - 1);

            return (
              <button
                key={step._id || index}
                onClick={() => openStep(index)}
                className={`group relative z-10 flex min-h-[88px] w-full items-center gap-4 rounded-2xl border p-4 text-left shadow-xl ${
                  completed
                    ? "border-teal-400/50 bg-teal-500/15 text-teal-50"
                    : unlocked
                      ? "border-rose-400/40 bg-rose-500/20 text-rose-50"
                      : "border-slate-600 bg-slate-800/80 text-slate-400"
                } ${isCurrent && unlocked ? "ring-4 ring-rose-400/20" : ""}`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                  completed ? "bg-teal-500 text-white" : unlocked ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-400"
                }`}>
                  {completed ? <CheckCircle2 className="h-6 w-6" /> : unlocked ? <Play className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-normal opacity-80">Day {index + 1}</span>
                  <span className="mt-1 block text-lg font-semibold leading-6">{step.title}</span>
                  <span className="mt-1 line-clamp-2 block text-xs opacity-75">{step.description}</span>
                </span>
                {isCurrent && unlocked && !completed && (
                  <span className="absolute -right-2 -top-3 rounded-full bg-amber-400 px-2 py-1 text-xs font-bold text-slate-950">
                    Next
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative mt-10 flex justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-amber-400/15 px-5 py-3 text-[var(--theme-text)]">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-medium">{progress === 100 ? "Roadmap completed" : "Complete each day to unlock the next one"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetailPage;
