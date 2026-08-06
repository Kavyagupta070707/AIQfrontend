import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, ExternalLink, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/study/PageHeader";
import { studyApi } from "@/lib/api";
import { downloadRoadmapStepPdf } from "@/lib/noteTools";

const isStepUnlocked = (steps: any[], index: number) => {
  if (index === 0) return true;
  return steps.slice(0, index).every((step: any) => step.completed);
};

const RoadmapStepPage = ({ onQuizGenerated }) => {
  const { id, stepIndex } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<any>(null);
  const index = Number(stepIndex || 0);

  useEffect(() => {
    if (!id) return;
    studyApi.getRoadmap(id)
      .then((res) => {
        if (!isStepUnlocked(res.data.steps || [], index)) {
          toast.warning("Complete the previous day before opening this study section.");
          navigate(`/roadmaps/${id}`);
          return;
        }
        setRoadmap(res.data);
      })
      .catch(() => navigate("/roadmaps"));
  }, [id, index, navigate]);

  const markComplete = async () => {
    const next = {
      ...roadmap,
      steps: roadmap.steps.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, completed: true } : item),
    };
    setRoadmap(next);
    await studyApi.updateRoadmap(roadmap._id, next);
    toast.success(`Day ${index + 1} completed`);
    navigate(`/roadmaps/${roadmap._id}`);
  };

  const quizFromStep = async () => {
    const generated = await studyApi.generateQuiz(`${roadmap.subject}: ${step.title}`);
    const quiz = {
      topic: `${roadmap.subject}: ${step.title}`,
      questions: generated.data.questions.map((q: any, qIndex: number) => ({ id: qIndex + 1, ...q })),
      participants: [],
      createdBy: roadmap.createdBy,
    };
    const saved = await studyApi.saveQuiz(quiz);
    onQuizGenerated(saved.data);
    navigate("/quiz");
  };

  const downloadPdf = () => {
    downloadRoadmapStepPdf(roadmap, step, index) || toast.error("Could not download the PDF.");
  };

  if (!roadmap) return <p className="aiq-muted text-sm">Loading study section...</p>;
  const step = roadmap.steps[index];
  if (!step) return <p className="aiq-muted text-sm">Study section not found.</p>;

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate(`/roadmaps/${roadmap._id}`)} className="aiq-muted mb-4 hover:bg-[var(--theme-subcard)] hover:text-[var(--theme-text)]">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Roadmap
      </Button>

      <PageHeader
        title={`Day ${index + 1}: ${step.title}`}
        description={step.description}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadPdf} className="border-blue-400/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15 hover:text-blue-200">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" onClick={quizFromStep} className="border-violet-400/20 bg-violet-500/10 text-violet-300 hover:bg-violet-500/15 hover:text-violet-200">
              <Trophy className="mr-2 h-4 w-4" />
              Quiz
            </Button>
            <Button onClick={markComplete} className="bg-teal-600 text-white hover:bg-teal-700">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <Card className="aiq-card">
          <CardHeader>
            <CardTitle className="aiq-heading text-lg">Study Material</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="aiq-muted whitespace-pre-line text-sm leading-7">{step.studyMaterial || step.description || "Study material will appear here for newly generated roadmaps."}</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="aiq-card">
            <CardHeader><CardTitle className="aiq-heading text-base">Key Points</CardTitle></CardHeader>
            <CardContent><ul className="aiq-muted list-disc space-y-2 pl-5 text-sm">{(step.keyPoints?.length ? step.keyPoints : [step.description]).map((item: string) => <li key={item}>{item}</li>)}</ul></CardContent>
          </Card>
          <Card className="aiq-card">
            <CardHeader><CardTitle className="aiq-heading text-base">Examples</CardTitle></CardHeader>
            <CardContent><ul className="aiq-muted list-disc space-y-2 pl-5 text-sm">{(step.examples || []).map((item: string) => <li key={item}>{item}</li>)}{!step.examples?.length && <li>No examples added for this older roadmap section.</li>}</ul></CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="aiq-card">
          <CardHeader><CardTitle className="aiq-heading text-base">Practice Questions</CardTitle></CardHeader>
          <CardContent><ul className="aiq-muted list-disc space-y-2 pl-5 text-sm">{(step.practiceQuestions || []).map((item: string) => <li key={item}>{item}</li>)}{!step.practiceQuestions?.length && <li>Use the quiz button to generate practice questions.</li>}</ul></CardContent>
        </Card>

        <Card className="aiq-card">
          <CardHeader><CardTitle className="aiq-heading text-base">Helpful Links</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(step.resources || []).map((resource: any, resourceIndex: number) => {
              const normalized = typeof resource === "string" ? { title: resource, url: "", description: "" } : resource;
              return (
                <a key={`${normalized.title}-${resourceIndex}`} href={normalized.url || "#"} target="_blank" rel="noreferrer" className="aiq-subcard block rounded-md border p-3 transition hover:bg-[var(--theme-card-hover)]">
                  <span className="aiq-heading flex items-center gap-2 font-medium">
                    {normalized.title || "Study resource"}
                    {normalized.url && <ExternalLink className="h-3.5 w-3.5 text-teal-300" />}
                  </span>
                  <span className="aiq-muted mt-1 block text-xs leading-5">{normalized.description || normalized.url || "Search this resource for the topic."}</span>
                </a>
              );
            })}
            {!step.resources?.length && <p className="aiq-muted text-sm">No links added for this section yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoadmapStepPage;
